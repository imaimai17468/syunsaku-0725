import { createClient } from "@/lib/supabase/server";
import { getRank } from "./click-game-engine";

export interface MiniGameResult {
	score: number;
	rank: string;
	averageReactionTime: number;
	rewards: {
		coins: number;
		exp: number;
		bonusItem?: {
			itemId: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		};
	};
}

export const calculateRewards = (
	score: number,
	rounds: number,
): MiniGameResult["rewards"] => {
	const rank = getRank(score, rounds);
	let baseCoins = 0;
	let baseExp = 0;
	let bonusItem: MiniGameResult["rewards"]["bonusItem"];

	switch (rank) {
		case "S":
			baseCoins = 500;
			baseExp = 200;
			// 20% chance for legendary item
			if (Math.random() < 0.2) {
				bonusItem = {
					itemId: "speed-boost-legendary",
					rarity: "legendary" as const,
				};
			}
			break;
		case "A":
			baseCoins = 300;
			baseExp = 150;
			// 15% chance for epic item
			if (Math.random() < 0.15) {
				bonusItem = {
					itemId: "speed-boost-epic",
					rarity: "epic" as const,
				};
			}
			break;
		case "B":
			baseCoins = 200;
			baseExp = 100;
			// 10% chance for rare item
			if (Math.random() < 0.1) {
				bonusItem = {
					itemId: "speed-boost-rare",
					rarity: "rare" as const,
				};
			}
			break;
		case "C":
			baseCoins = 100;
			baseExp = 50;
			break;
		case "D":
			baseCoins = 50;
			baseExp = 25;
			break;
		default:
			baseCoins = 25;
			baseExp = 10;
	}

	return {
		coins: baseCoins,
		exp: baseExp,
		bonusItem,
	};
};

export async function checkMiniGameStatus(userId: string): Promise<{
	canPlay: boolean;
	lastPlayedAt: string | null;
	todayScore: number | null;
}> {
	// 開発環境でも制限を適用

	const supabase = await createClient();
	const today = new Date().toISOString().split("T")[0];

	const { data, error } = await supabase
		.from("daily_activities")
		.select("mini_game_completed, mini_game_score, updated_at")
		.eq("user_id", userId)
		.eq("activity_date", today)
		.single();

	if (error && error.code !== "PGRST116") {
		console.error("Error checking mini game status:", error);
		throw error;
	}

	return {
		canPlay: !data?.mini_game_completed,
		lastPlayedAt: data?.updated_at || null,
		todayScore: data?.mini_game_score || null,
	};
}

export async function saveMiniGameResult(
	userId: string,
	result: MiniGameResult,
): Promise<void> {
	// 開発環境でも保存処理を実行

	const supabase = await createClient();
	const today = new Date().toISOString().split("T")[0];

	// トランザクション的な処理
	try {
		// 1. 日次活動記録を更新
		const { error: activityError } = await supabase
			.from("daily_activities")
			.upsert({
				user_id: userId,
				activity_date: today,
				mini_game_completed: true,
				mini_game_score: result.score,
				updated_at: new Date().toISOString(),
			});

		if (activityError) throw activityError;

		// 2. ユーザーレベルを更新
		const { data: currentLevel, error: levelError } = await supabase
			.from("user_levels")
			.select("current_exp, current_level")
			.eq("user_id", userId)
			.single();

		if (levelError && levelError.code !== "PGRST116") throw levelError;

		const currentExp = currentLevel?.current_exp || 0;
		const newExp = currentExp + result.rewards.exp;

		const { error: updateLevelError } = await supabase
			.from("user_levels")
			.upsert({
				user_id: userId,
				current_exp: newExp,
				total_exp: newExp,
				updated_at: new Date().toISOString(),
			});

		if (updateLevelError) throw updateLevelError;

		// 3. ボーナスアイテムがあればインベントリに追加
		if (result.rewards.bonusItem) {
			// まず該当するreward_itemのIDを取得
			const { data: rewardItem, error: itemError } = await supabase
				.from("reward_items")
				.select("id")
				.eq("name", result.rewards.bonusItem.itemId)
				.eq("rarity", result.rewards.bonusItem.rarity)
				.single();

			if (!itemError && rewardItem) {
				const { error: inventoryError } = await supabase
					.from("user_inventory")
					.insert({
						user_id: userId,
						reward_item_id: rewardItem.id,
						quantity: 1,
						acquired_at: new Date().toISOString(),
					});

				if (inventoryError) throw inventoryError;
			}
		}
	} catch (error) {
		console.error("Error saving mini game result:", error);
		throw error;
	}
}
