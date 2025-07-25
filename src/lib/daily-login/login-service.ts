import { upsertDailyActivity } from "@/gateways/daily-activity";
import { fetchLoginStreak, upsertLoginStreak } from "@/gateways/login-streak";
import { fetchRewardItems } from "@/gateways/reward-item";
import { addToInventory } from "@/gateways/user-inventory";
import { addExperience } from "@/gateways/user-level";
import {
	calculateLoginBonus,
	calculateLoginStreak,
	getTodayString,
} from "./streak-calculator";

export interface LoginResult {
	success: boolean;
	error?: string;
	streakInfo?: {
		currentStreak: number;
		isNewDay: boolean;
		streakBroken: boolean;
		bonusMultiplier: number;
	};
	rewards?: {
		coins: number;
		exp: number;
		specialReward?: {
			itemId: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		};
	};
	levelUp?: {
		newLevel: number;
		leveledUp: boolean;
	};
}

/**
 * デイリーログイン処理を実行
 */
export async function processUserLogin(userId: string): Promise<LoginResult> {
	try {
		const today = getTodayString();

		// 現在のストリーク情報を取得
		const currentStreak = await fetchLoginStreak(userId);

		// ストリーク計算
		const streakResult = calculateLoginStreak(currentStreak, today);

		// 同日ログインの場合は処理をスキップ
		if (!streakResult.isNewDay) {
			return {
				success: true,
				streakInfo: {
					currentStreak: streakResult.newStreak,
					isNewDay: false,
					streakBroken: false,
					bonusMultiplier: streakResult.bonusMultiplier,
				},
			};
		}

		// ログインボーナス計算
		const loginBonus = calculateLoginBonus(streakResult.newStreak);

		// ストリーク情報を更新
		const streakUpdateResult = await upsertLoginStreak(userId, {
			currentStreak: streakResult.newStreak,
			longestStreak: currentStreak
				? Math.max(currentStreak.longestStreak, streakResult.newStreak)
				: streakResult.newStreak,
			lastLoginDate: today,
			totalLoginDays: currentStreak ? currentStreak.totalLoginDays + 1 : 1,
		});

		if (!streakUpdateResult.success) {
			return {
				success: false,
				error: "Failed to update login streak",
			};
		}

		// 日次活動記録を更新
		const activityResult = await upsertDailyActivity(userId, today, {
			loginCount: 1,
		});

		if (!activityResult.success) {
			return {
				success: false,
				error: "Failed to update daily activity",
			};
		}

		// 経験値を付与
		const expResult = await addExperience(userId, loginBonus.exp);
		if (!expResult.success) {
			return {
				success: false,
				error: "Failed to add experience",
			};
		}

		// 特別報酬がある場合はインベントリに追加
		if (loginBonus.specialReward) {
			// 報酬アイテムを取得（実際の実装では事前に作成されたアイテムを使用）
			const rewardItems = await fetchRewardItems({
				isActive: true,
				limit: 1,
			});

			if (rewardItems.length > 0) {
				await addToInventory({
					userId,
					rewardItemId: rewardItems[0].id,
					quantity: 1,
				});
			}
		}

		return {
			success: true,
			streakInfo: {
				currentStreak: streakResult.newStreak,
				isNewDay: streakResult.isNewDay,
				streakBroken: streakResult.streakBroken,
				bonusMultiplier: streakResult.bonusMultiplier,
			},
			rewards: loginBonus,
			levelUp: {
				newLevel: expResult.level?.currentLevel || 1,
				leveledUp: expResult.leveledUp || false,
			},
		};
	} catch (error) {
		console.error("Login processing error:", error);
		return {
			success: false,
			error: "Internal server error during login processing",
		};
	}
}

/**
 * ユーザーの今日のログイン状態を確認
 */
export async function checkTodayLoginStatus(userId: string): Promise<{
	hasLoggedInToday: boolean;
	currentStreak: number;
	canClaimBonus: boolean;
}> {
	try {
		const today = getTodayString();
		const streak = await fetchLoginStreak(userId);

		if (!streak || !streak.lastLoginDate) {
			return {
				hasLoggedInToday: false,
				currentStreak: 0,
				canClaimBonus: true,
			};
		}

		const hasLoggedInToday = streak.lastLoginDate === today;

		return {
			hasLoggedInToday,
			currentStreak: streak.currentStreak,
			canClaimBonus: !hasLoggedInToday,
		};
	} catch (error) {
		console.error("Error checking login status:", error);
		return {
			hasLoggedInToday: false,
			currentStreak: 0,
			canClaimBonus: false,
		};
	}
}
