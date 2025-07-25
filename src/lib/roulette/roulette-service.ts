import {
	fetchDailyActivity,
	upsertDailyActivity,
} from "@/gateways/daily-activity";
import { fetchRewardItems } from "@/gateways/reward-item";
import { addToInventory } from "@/gateways/user-inventory";
import { addExperience } from "@/gateways/user-level";
import {
	type RouletteResult,
	type RouletteReward,
	spinRoulette,
} from "./roulette-engine";

export interface RoulettePlayResult {
	success: boolean;
	error?: string;
	result?: RouletteResult;
	alreadyPlayed?: boolean;
	levelUp?: {
		newLevel: number;
		leveledUp: boolean;
	};
}

/**
 * ユーザーのルーレット実行処理
 */
export async function playRoulette(
	userId: string,
): Promise<RoulettePlayResult> {
	try {
		const today = new Date().toISOString().split("T")[0];

		// 今日の活動記録を確認
		const todayActivity = await fetchDailyActivity(userId, today);

		// 既にルーレットを実行済みかチェック
		if (todayActivity?.rouletteCompleted) {
			return {
				success: false,
				alreadyPlayed: true,
				error: "You have already played the roulette today",
			};
		}

		// ルーレットを回す
		const spinResult = spinRoulette();

		// 報酬を付与
		const rewardResult = await grantRouletteReward(userId, spinResult.reward);
		if (!rewardResult.success) {
			return {
				success: false,
				error: rewardResult.error,
			};
		}

		// 日次活動記録を更新
		const activityResult = await upsertDailyActivity(userId, today, {
			rouletteCompleted: true,
		});

		if (!activityResult.success) {
			return {
				success: false,
				error: "Failed to update daily activity",
			};
		}

		return {
			success: true,
			result: spinResult,
			levelUp: rewardResult.levelUp,
		};
	} catch (error) {
		console.error("Roulette play error:", error);
		return {
			success: false,
			error: "Internal server error during roulette play",
		};
	}
}

/**
 * ルーレット報酬を付与
 */
async function grantRouletteReward(
	userId: string,
	reward: RouletteReward,
): Promise<{
	success: boolean;
	error?: string;
	levelUp?: {
		newLevel: number;
		leveledUp: boolean;
	};
}> {
	try {
		let levelUp:
			| {
					newLevel: number;
					leveledUp: boolean;
			  }
			| undefined;

		// 経験値報酬
		if (reward.exp && reward.exp > 0) {
			const expResult = await addExperience(userId, reward.exp);
			if (!expResult.success) {
				return {
					success: false,
					error: "Failed to grant experience reward",
				};
			}
			levelUp = {
				newLevel: expResult.level?.currentLevel || 1,
				leveledUp: expResult.leveledUp || false,
			};
		}

		// アイテム報酬
		if (reward.itemId) {
			// 実際の実装では、reward.itemIdに対応するアイテムをデータベースから取得
			// ここでは簡易的に最初のアクティブなアイテムを使用
			const rewardItems = await fetchRewardItems({
				isActive: true,
				limit: 1,
			});

			if (rewardItems.length > 0) {
				const inventoryResult = await addToInventory({
					userId,
					rewardItemId: rewardItems[0].id,
					quantity: 1,
				});

				if (!inventoryResult.success) {
					return {
						success: false,
						error: "Failed to grant item reward",
					};
				}
			}
		}

		// コイン報酬は将来的にユーザーの通貨システムと連携
		// 現在は経験値として代替
		if (reward.coins && reward.coins > 0) {
			const coinExpResult = await addExperience(
				userId,
				Math.floor(reward.coins / 10),
			);
			if (!coinExpResult.success) {
				return {
					success: false,
					error: "Failed to grant coin reward",
				};
			}

			if (!levelUp) {
				levelUp = {
					newLevel: coinExpResult.level?.currentLevel || 1,
					leveledUp: coinExpResult.leveledUp || false,
				};
			}
		}

		return {
			success: true,
			levelUp,
		};
	} catch (error) {
		console.error("Error granting roulette reward:", error);
		return {
			success: false,
			error: "Failed to grant reward",
		};
	}
}

/**
 * ユーザーの今日のルーレット状態を確認
 */
export async function checkRouletteStatus(userId: string): Promise<{
	canPlay: boolean;
	alreadyPlayed: boolean;
	error?: string;
}> {
	try {
		const today = new Date().toISOString().split("T")[0];
		const todayActivity = await fetchDailyActivity(userId, today);

		const alreadyPlayed = todayActivity?.rouletteCompleted || false;

		return {
			canPlay: !alreadyPlayed,
			alreadyPlayed,
		};
	} catch (error) {
		console.error("Error checking roulette status:", error);
		return {
			canPlay: false,
			alreadyPlayed: false,
			error: "Failed to check roulette status",
		};
	}
}
