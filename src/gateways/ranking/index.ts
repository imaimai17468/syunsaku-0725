import type { RankingData, RankingType } from "@/entities/ranking";
import { RankingDataSchema } from "@/entities/ranking";
import { createClient } from "@/lib/supabase/server";

export const fetchRanking = async (
	type: RankingType,
	limit = 50,
): Promise<RankingData> => {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		let rankingData: RankingData;

		switch (type) {
			case "level": {
				type LevelRankingRow = {
					user_id: string;
					current_level: number;
					current_exp: number;
					users: {
						name: string | null;
						avatar_url: string | null;
					} | null;
				};

				const { data } = await supabase
					.from("user_levels")
					.select(`
					user_id,
					current_level,
					current_exp,
					users (
						name,
						avatar_url
					)
				`)
					.order("current_level", { ascending: false })
					.order("current_exp", { ascending: false })
					.limit(limit);

				const typedData = data as LevelRankingRow[] | null;
				const users = (typedData || []).map((item, index) => ({
					userId: item.user_id,
					name: item.users?.name || "冒険者",
					avatarUrl: item.users?.avatar_url || null,
					score: item.current_level,
					rank: index + 1,
				}));

				const currentUserRank = user
					? users.findIndex((u) => u.userId === user.id) + 1 || null
					: null;

				rankingData = {
					type: "level",
					users,
					currentUserRank,
					updatedAt: new Date().toISOString(),
				};
				break;
			}

			case "loginStreak": {
				type LoginStreakRow = {
					user_id: string;
					current_streak: number;
					users: {
						name: string | null;
						avatar_url: string | null;
					} | null;
				};

				const { data } = await supabase
					.from("login_streaks")
					.select(`
					user_id,
					current_streak,
					users (
						name,
						avatar_url
					)
				`)
					.order("current_streak", { ascending: false })
					.limit(limit);

				const typedData = data as LoginStreakRow[] | null;
				const users = (typedData || []).map((item, index) => ({
					userId: item.user_id,
					name: item.users?.name || "冒険者",
					avatarUrl: item.users?.avatar_url || null,
					score: item.current_streak,
					rank: index + 1,
				}));

				const currentUserRank = user
					? users.findIndex((u) => u.userId === user.id) + 1 || null
					: null;

				rankingData = {
					type: "loginStreak",
					users,
					currentUserRank,
					updatedAt: new Date().toISOString(),
				};
				break;
			}

			case "miniGameScore": {
				type MiniGameScoreRow = {
					user_id: string;
					mini_game_score: number | null;
					users: {
						name: string | null;
						avatar_url: string | null;
					} | null;
				};

				const { data } = await supabase
					.from("daily_activities")
					.select(`
					user_id,
					mini_game_score,
					users (
						name,
						avatar_url
					)
				`)
					.eq("mini_game_completed", true)
					.not("mini_game_score", "is", null)
					.order("mini_game_score", { ascending: false })
					.limit(limit * 2);

				// 各ユーザーの最高スコアのみを取得
				const typedData = data as MiniGameScoreRow[] | null;
				const userHighScores = new Map<
					string,
					{ name: string; avatarUrl: string | null; score: number }
				>();
				for (const item of typedData || []) {
					if (item.mini_game_score) {
						const existing = userHighScores.get(item.user_id);
						if (!existing || item.mini_game_score > existing.score) {
							userHighScores.set(item.user_id, {
								name: item.users?.name || "冒険者",
								avatarUrl: item.users?.avatar_url || null,
								score: item.mini_game_score,
							});
						}
					}
				}

				const users = Array.from(userHighScores.entries())
					.sort((a, b) => b[1].score - a[1].score)
					.slice(0, limit)
					.map(([userId, data], index) => ({
						userId,
						name: data.name,
						avatarUrl: data.avatarUrl,
						score: data.score,
						rank: index + 1,
					}));

				const currentUserRank = user
					? users.findIndex((u) => u.userId === user.id) + 1 || null
					: null;

				rankingData = {
					type: "miniGameScore",
					users,
					currentUserRank,
					updatedAt: new Date().toISOString(),
				};
				break;
			}

			case "totalPoints": {
				// 各ユーザーの獲得実績数をカウント
				type AchievementCountRow = {
					user_id: string;
					achievement_count: number;
					users: {
						name: string | null;
						avatar_url: string | null;
					} | null;
				};

				// ユーザーごとの実績獲得数を集計
				const { data, error } = await supabase
					.from("user_achievements")
					.select(`
					user_id,
					users (
						name,
						avatar_url
					)
				`);

				if (error) {
					console.error("Error fetching user achievements for ranking:", error);
				}

				const typedData = data as
					| Omit<AchievementCountRow, "achievement_count">[]
					| null;

				// ユーザーごとに実績数をカウント
				const userAchievementCounts = new Map<
					string,
					{
						name: string;
						avatarUrl: string | null;
						count: number;
					}
				>();

				for (const item of typedData || []) {
					const existing = userAchievementCounts.get(item.user_id);
					if (existing) {
						existing.count++;
					} else {
						userAchievementCounts.set(item.user_id, {
							name: item.users?.name || "冒険者",
							avatarUrl: item.users?.avatar_url || null,
							count: 1,
						});
					}
				}

				// 実績獲得数でソートしてランキングを作成
				const users = Array.from(userAchievementCounts.entries())
					.sort((a, b) => b[1].count - a[1].count)
					.slice(0, limit)
					.map(([userId, data], index) => ({
						userId,
						name: data.name,
						avatarUrl: data.avatarUrl,
						score: data.count * 100, // 実績1つあたり100ポイントとして計算
						rank: index + 1,
					}));

				const currentUserRank = user
					? users.findIndex((u) => u.userId === user.id) + 1 || null
					: null;

				rankingData = {
					type: "totalPoints",
					users,
					currentUserRank,
					updatedAt: new Date().toISOString(),
				};
				break;
			}

			default:
				throw new Error(`Unknown ranking type: ${type}`);
		}

		return RankingDataSchema.parse(rankingData);
	} catch (error) {
		console.error(`Error fetching ${type} ranking:`, error);
		// エラー時はモックデータを返す
		return getMockRankingData(type);
	}
};

const getMockRankingData = (type: RankingType): RankingData => {
	const mockUsers = Array.from({ length: 20 }, (_, i) => ({
		userId: `user-${i + 1}`,
		name: `冒険者${i + 1}`,
		avatarUrl: null,
		score:
			type === "level"
				? 50 - i
				: type === "miniGameScore"
					? (20 - i) * 1000
					: 100 - i * 5,
		rank: i + 1,
	}));

	return {
		type,
		users: mockUsers,
		currentUserRank: 5,
		updatedAt: new Date().toISOString(),
	};
};
