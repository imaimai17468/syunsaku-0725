import { createError } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";

export type RateLimitConfig = {
	maxAttempts: number;
	windowMs: number;
	blockDurationMs?: number;
};

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
	// APIリクエスト
	api: {
		maxAttempts: 100,
		windowMs: 60 * 1000, // 1分
		blockDurationMs: 5 * 60 * 1000, // 5分
	},
	// ログイン試行
	login: {
		maxAttempts: 5,
		windowMs: 15 * 60 * 1000, // 15分
		blockDurationMs: 30 * 60 * 1000, // 30分
	},
	// ゲームアクション（ルーレット、ミニゲーム）
	gameAction: {
		maxAttempts: 10,
		windowMs: 60 * 1000, // 1分
		blockDurationMs: 5 * 60 * 1000, // 5分
	},
	// アイテム使用
	itemUse: {
		maxAttempts: 20,
		windowMs: 60 * 1000, // 1分
		blockDurationMs: 5 * 60 * 1000, // 5分
	},
};

export class RateLimiter {
	private config: RateLimitConfig;
	private actionType: string;

	constructor(actionType: string, config?: RateLimitConfig) {
		this.actionType = actionType;
		this.config = config || DEFAULT_CONFIGS[actionType] || DEFAULT_CONFIGS.api;
	}

	async checkLimit(userId: string): Promise<{
		allowed: boolean;
		remaining: number;
		resetAt: Date;
	}> {
		const supabase = await createClient();
		const now = new Date();
		const windowStart = new Date(now.getTime() - this.config.windowMs);

		// 現在のウィンドウ内の試行回数を取得
		const { data: attempts, error } = await supabase
			.from("rate_limits")
			.select("*")
			.eq("user_id", userId)
			.eq("action_type", this.actionType)
			.gte("window_start", windowStart.toISOString())
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Rate limit check error:", error);
			// エラーの場合は通過させる（フェイルオープン）
			return {
				allowed: true,
				remaining: this.config.maxAttempts,
				resetAt: new Date(now.getTime() + this.config.windowMs),
			};
		}

		const attemptCount = attempts?.length || 0;
		const remaining = Math.max(0, this.config.maxAttempts - attemptCount);
		const resetAt = new Date(windowStart.getTime() + this.config.windowMs);

		// ブロック期間中かチェック
		if (attempts && attempts.length > 0) {
			const lastAttempt = attempts[0];
			if (lastAttempt.attempt_count >= this.config.maxAttempts) {
				const blockUntil = new Date(
					new Date(lastAttempt.created_at).getTime() +
						(this.config.blockDurationMs || 0),
				);
				if (blockUntil > now) {
					return {
						allowed: false,
						remaining: 0,
						resetAt: blockUntil,
					};
				}
			}
		}

		return {
			allowed: attemptCount < this.config.maxAttempts,
			remaining,
			resetAt,
		};
	}

	async recordAttempt(userId: string): Promise<void> {
		const supabase = await createClient();
		const now = new Date();
		const windowStart = new Date(now.getTime() - this.config.windowMs);

		// 現在のウィンドウ内の試行回数を取得
		const { data: existing } = await supabase
			.from("rate_limits")
			.select("*")
			.eq("user_id", userId)
			.eq("action_type", this.actionType)
			.gte("window_start", windowStart.toISOString())
			.single();

		if (existing) {
			// 既存レコードを更新
			await supabase
				.from("rate_limits")
				.update({
					attempt_count: existing.attempt_count + 1,
				})
				.eq("id", existing.id);
		} else {
			// 新規レコードを作成
			await supabase.from("rate_limits").insert({
				user_id: userId,
				action_type: this.actionType,
				attempt_count: 1,
				window_start: windowStart.toISOString(),
			});
		}
	}

	async enforce(userId: string): Promise<void> {
		const { allowed, remaining, resetAt } = await this.checkLimit(userId);

		if (!allowed) {
			const waitTime = Math.ceil((resetAt.getTime() - Date.now()) / 1000 / 60);
			throw createError(
				"rateLimit",
				`アクセス制限中です。${waitTime}分後に再試行してください。`,
				{
					code: "RATE_LIMIT_EXCEEDED",
					details: {
						remaining,
						resetAt,
					},
				},
			);
		}

		await this.recordAttempt(userId);
	}
}

// レート制限デコレーター
export const withRateLimit = <
	T extends (...args: unknown[]) => Promise<unknown>,
>(
	fn: T,
	actionType: string,
	getUserId: (args: Parameters<T>) => string | Promise<string>,
	config?: RateLimitConfig,
): T => {
	const limiter = new RateLimiter(actionType, config);

	return (async (...args: Parameters<T>) => {
		const userId = await getUserId(args);
		await limiter.enforce(userId);
		return fn(...args);
	}) as T;
};
