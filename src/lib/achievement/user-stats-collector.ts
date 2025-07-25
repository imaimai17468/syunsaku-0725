import { createClient } from "@/lib/supabase/server";
import type { UserStats } from "./achievement-service";

export const collectUserStats = async (userId: string): Promise<UserStats> => {
	const supabase = await createClient();

	// 並列でデータを取得
	const [
		loginStreakData,
		dailyActivities,
		userInventory,
		userLevel,
		miniGameScores,
	] = await Promise.all([
		// ログインストリーク情報
		supabase
			.from("login_streaks")
			.select("current_streak, longest_streak, total_login_days")
			.eq("user_id", userId)
			.single(),

		// 日次活動情報
		supabase
			.from("daily_activities")
			.select("roulette_completed, mini_game_completed, mini_game_score")
			.eq("user_id", userId),

		// インベントリ情報
		supabase
			.from("user_inventory")
			.select(`
				quantity,
				reward_items (
					rarity
				)
			`)
			.eq("user_id", userId),

		// ユーザーレベル情報
		supabase
			.from("user_levels")
			.select("current_level, total_exp")
			.eq("user_id", userId)
			.single(),

		// ミニゲームハイスコア
		supabase
			.from("daily_activities")
			.select("mini_game_score")
			.eq("user_id", userId)
			.eq("mini_game_completed", true)
			.order("mini_game_score", { ascending: false }),
	]);

	// データ集計
	const stats: UserStats = {
		loginStreak: loginStreakData.data?.current_streak || 0,
		totalLogins: loginStreakData.data?.total_login_days || 0,
		roulettePlays: 0,
		rouletteLegendaryWins: 0,
		miniGamePlays: 0,
		miniGameHighScore: 0,
		miniGamePerfectScores: 0,
		itemsCollected: 0,
		itemsCollectedByRarity: {
			common: 0,
			rare: 0,
			epic: 0,
			legendary: 0,
		},
		currentLevel: userLevel.data?.current_level || 1,
		totalExp: userLevel.data?.total_exp || 0,
	};

	// 日次活動の集計
	if (dailyActivities.data) {
		stats.roulettePlays = dailyActivities.data.filter(
			(d) => d.roulette_completed,
		).length;
		stats.miniGamePlays = dailyActivities.data.filter(
			(d) => d.mini_game_completed,
		).length;

		// パーフェクトスコア（2000点以上）の回数
		stats.miniGamePerfectScores = dailyActivities.data.filter(
			(d) => d.mini_game_score && d.mini_game_score >= 2000,
		).length;
	}

	// ミニゲームハイスコア
	if (miniGameScores.data && miniGameScores.data.length > 0) {
		stats.miniGameHighScore = miniGameScores.data[0].mini_game_score || 0;
	}

	// インベントリの集計
	if (userInventory.data) {
		for (const item of userInventory.data) {
			stats.itemsCollected += item.quantity;

			const rewardItem = item.reward_items as { rarity?: string } | null;
			const rarity = rewardItem?.rarity;
			if (rarity && rarity in stats.itemsCollectedByRarity) {
				stats.itemsCollectedByRarity[
					rarity as keyof typeof stats.itemsCollectedByRarity
				] += item.quantity;

				// レジェンダリーアイテムの獲得はルーレットからのみと仮定
				if (rarity === "legendary") {
					stats.rouletteLegendaryWins += item.quantity;
				}
			}
		}
	}

	return stats;
};
