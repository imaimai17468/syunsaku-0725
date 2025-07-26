import { createError } from "@/lib/error-handling";

// 不正操作の種類
export type FraudType =
	| "rapid_clicks"
	| "impossible_score"
	| "time_manipulation"
	| "duplicate_submission"
	| "suspicious_pattern";

// 不正操作検知の設定
export const FRAUD_THRESHOLDS = {
	// クリック間隔の最小値（ミリ秒）
	MIN_CLICK_INTERVAL: 100,
	// ミニゲームの理論上の最高スコア
	MAX_MINI_GAME_SCORE: 1000,
	// アクション間の最小間隔（ミリ秒）
	MIN_ACTION_INTERVAL: 500,
	// 同一アクションの最大連続回数
	MAX_CONSECUTIVE_ACTIONS: 10,
	// 異常パターン検知の閾値
	ANOMALY_THRESHOLD: 0.95,
};

export class FraudDetector {
	private actionHistory: Map<
		string,
		Array<{ timestamp: number; data: unknown }>
	> = new Map();

	// 高速クリックの検知
	detectRapidClicks(userId: string, timestamps: number[]): boolean {
		if (timestamps.length < 2) return false;

		for (let i = 1; i < timestamps.length; i++) {
			const interval = timestamps[i] - timestamps[i - 1];
			if (interval < FRAUD_THRESHOLDS.MIN_CLICK_INTERVAL) {
				this.logFraudAttempt(userId, "rapid_clicks", {
					interval,
					timestamps,
				});
				return true;
			}
		}
		return false;
	}

	// 不可能なスコアの検知
	detectImpossibleScore(
		userId: string,
		score: number,
		gameType: string,
		timePlayed: number,
	): boolean {
		// 理論上の最高スコアを超えている
		if (score > FRAUD_THRESHOLDS.MAX_MINI_GAME_SCORE) {
			this.logFraudAttempt(userId, "impossible_score", {
				score,
				gameType,
				timePlayed,
			});
			return true;
		}

		// 時間に対してスコアが異常に高い（1秒あたり50点以上）
		const scorePerSecond = score / (timePlayed / 1000);
		if (scorePerSecond > 50) {
			this.logFraudAttempt(userId, "impossible_score", {
				score,
				scorePerSecond,
				timePlayed,
			});
			return true;
		}

		return false;
	}

	// 時間操作の検知
	detectTimeManipulation(
		userId: string,
		clientTime: Date,
		serverTime: Date,
		allowedDriftMs = 60000, // 1分の誤差を許容
	): boolean {
		const drift = Math.abs(clientTime.getTime() - serverTime.getTime());
		if (drift > allowedDriftMs) {
			this.logFraudAttempt(userId, "time_manipulation", {
				clientTime,
				serverTime,
				drift,
			});
			return true;
		}
		return false;
	}

	// 重複送信の検知
	async detectDuplicateSubmission(
		userId: string,
		actionType: string,
		data: unknown,
		windowMs = 5000,
	): Promise<boolean> {
		const key = `${userId}:${actionType}`;
		const history = this.actionHistory.get(key) || [];
		const now = Date.now();

		// 古いエントリを削除
		const recentHistory = history.filter(
			(entry) => now - entry.timestamp < windowMs,
		);

		// 同じデータの送信をチェック
		const isDuplicate = recentHistory.some(
			(entry) => JSON.stringify(entry.data) === JSON.stringify(data),
		);

		if (isDuplicate) {
			this.logFraudAttempt(userId, "duplicate_submission", {
				actionType,
				data,
			});
			return true;
		}

		// 履歴に追加
		recentHistory.push({ timestamp: now, data });
		this.actionHistory.set(key, recentHistory);

		return false;
	}

	// 疑わしいパターンの検知（統計的異常検知）
	detectSuspiciousPattern(
		userId: string,
		metrics: {
			winRate?: number;
			averageScore?: number;
			actionFrequency?: number;
		},
	): boolean {
		// 勝率が異常に高い（95%以上）
		if (
			metrics.winRate &&
			metrics.winRate > FRAUD_THRESHOLDS.ANOMALY_THRESHOLD
		) {
			this.logFraudAttempt(userId, "suspicious_pattern", {
				metric: "winRate",
				value: metrics.winRate,
			});
			return true;
		}

		// その他の異常パターンもここで検知可能

		return false;
	}

	// 不正操作のログ記録
	private async logFraudAttempt(
		userId: string,
		fraudType: FraudType,
		details: unknown,
	): Promise<void> {
		console.warn("Fraud attempt detected:", {
			userId,
			fraudType,
			details,
			timestamp: new Date(),
		});

		// データベースに記録（実装は省略）
		// const supabase = await createClient();
		// await supabase.from("fraud_logs").insert({
		//   user_id: userId,
		//   fraud_type: fraudType,
		//   details,
		// });
	}
}

// 不正操作防止のミドルウェア
export const withFraudPrevention = <
	T extends (...args: unknown[]) => Promise<unknown>,
>(
	fn: T,
	options: {
		checkRapidClicks?: boolean;
		checkDuplicates?: boolean;
		actionType: string;
		getUserId: (args: Parameters<T>) => string | Promise<string>;
	},
): T => {
	const detector = new FraudDetector();

	return (async (...args: Parameters<T>) => {
		const userId = await options.getUserId(args);

		// 重複チェック
		if (options.checkDuplicates) {
			const isDuplicate = await detector.detectDuplicateSubmission(
				userId,
				options.actionType,
				args,
			);
			if (isDuplicate) {
				throw createError("validation", "重複したリクエストです", {
					code: "DUPLICATE_REQUEST",
				});
			}
		}

		// 実際の処理を実行
		const result = await fn(...args);

		return result;
	}) as T;
};

// セキュアなランダム値生成
export const generateSecureRandom = (min: number, max: number): number => {
	const range = max - min + 1;
	const randomBuffer = new Uint32Array(1);

	if (typeof window !== "undefined" && window.crypto) {
		window.crypto.getRandomValues(randomBuffer);
	} else {
		// Node.js環境の場合
		randomBuffer[0] = Math.floor(Math.random() * 0xffffffff);
	}

	return min + (randomBuffer[0] % range);
};

// タイムスタンプ検証
export const validateTimestamp = (
	timestamp: number | string | Date,
	maxAgeMs = 300000, // 5分
): boolean => {
	const time = new Date(timestamp).getTime();
	const now = Date.now();

	// 未来の時刻は無効
	if (time > now) return false;

	// 古すぎる時刻は無効
	if (now - time > maxAgeMs) return false;

	return true;
};
