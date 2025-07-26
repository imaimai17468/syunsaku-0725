import { createClient } from "@/lib/supabase/server";

export interface UserStats {
	totalLoginDays: number;
	currentStreak: number;
	longestStreak: number;
	totalItems: number;
	legendaryItems: number;
	achievements: number;
	miniGameHighScore: number;
	rouletteWins: number;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
	try {
		const supabase = await createClient();

		// ログイン統計
		const { data: loginStreak } = await supabase
			.from("login_streaks")
			.select("*")
			.eq("user_id", userId)
			.single();

		// 日次活動統計
		const { data: activities } = await supabase
			.from("daily_activities")
			.select("*")
			.eq("user_id", userId);

		const maxMiniGameScore =
			activities?.reduce(
				(max, activity) => Math.max(max, activity.mini_game_score || 0),
				0,
			) || 0;
		const rouletteWins =
			activities?.filter((activity) => activity.roulette_completed).length || 0;

		// インベントリ統計
		const { data: inventory } = await supabase
			.from("user_inventory")
			.select(`
				*,
				reward_items!inner(
					id,
					rarity
				)
			`)
			.eq("user_id", userId);

		const totalItems = inventory?.length || 0;
		const legendaryItems =
			inventory?.filter((item) => item.reward_items?.rarity === "legendary")
				.length || 0;

		// 実績統計
		const { data: achievements } = await supabase
			.from("user_achievements")
			.select("*")
			.eq("user_id", userId);

		// ログインストリークからtotalLoginDaysを取得
		// もしなければ、日次活動の数をカウント
		const totalLoginDays =
			loginStreak?.total_login_days || activities?.length || 0;

		return {
			totalLoginDays,
			currentStreak: loginStreak?.current_streak || 0,
			longestStreak: loginStreak?.longest_streak || 0,
			totalItems,
			legendaryItems,
			achievements: achievements?.length || 0,
			miniGameHighScore: maxMiniGameScore,
			rouletteWins,
		};
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return {
			totalLoginDays: 0,
			currentStreak: 0,
			longestStreak: 0,
			totalItems: 0,
			legendaryItems: 0,
			achievements: 0,
			miniGameHighScore: 0,
			rouletteWins: 0,
		};
	}
};

export const getLeaderboard = async (
	type: "level" | "miniGame" | "streak",
	limit = 10,
): Promise<
	Array<{
		userId: string;
		userName?: string;
		value: number;
		rank: number;
	}>
> => {
	try {
		const supabase = await createClient();

		switch (type) {
			case "miniGame": {
				// ユーザーごとの最高スコアを取得
				const { data: activities } = await supabase
					.from("daily_activities")
					.select("user_id, mini_game_score")
					.order("mini_game_score", { ascending: false });

				// ユーザーごとの最高スコアを集計
				const userScores = new Map<string, number>();
				activities?.forEach((activity) => {
					const currentScore = userScores.get(activity.user_id) || 0;
					userScores.set(
						activity.user_id,
						Math.max(currentScore, activity.mini_game_score || 0),
					);
				});

				// ソートして上位を取得
				const sortedScores = Array.from(userScores.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, limit);

				return sortedScores.map(([userId, value], index) => ({
					userId,
					value,
					rank: index + 1,
				}));
			}
			case "streak": {
				const { data: streaks } = await supabase
					.from("login_streaks")
					.select("user_id, longest_streak")
					.order("longest_streak", { ascending: false })
					.limit(limit);

				return (
					streaks?.map((streak, index) => ({
						userId: streak.user_id,
						value: streak.longest_streak,
						rank: index + 1,
					})) || []
				);
			}
			default:
				return [];
		}
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return [];
	}
};
