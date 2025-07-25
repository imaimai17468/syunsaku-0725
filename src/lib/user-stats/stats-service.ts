import { and, count, desc, eq, max } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import {
	dailyActivities,
	loginStreaks,
	rewardItems,
	userAchievements,
	userInventory,
} from "@/lib/drizzle/schema";

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
		// ログイン統計
		const [loginStreak] = await db
			.select()
			.from(loginStreaks)
			.where(eq(loginStreaks.userId, userId))
			.limit(1);

		// 日次活動統計
		const [activityStats] = await db
			.select({
				totalDays: count(),
				maxMiniGameScore: max(dailyActivities.miniGameScore),
			})
			.from(dailyActivities)
			.where(eq(dailyActivities.userId, userId));

		// ルーレット完了回数
		const [rouletteStats] = await db
			.select({
				wins: count(),
			})
			.from(dailyActivities)
			.where(
				and(
					eq(dailyActivities.userId, userId),
					eq(dailyActivities.rouletteCompleted, true),
				),
			);

		// インベントリ統計
		const inventoryStats = await db
			.select({
				totalItems: count(),
				itemId: userInventory.rewardItemId,
				rarity: rewardItems.rarity,
			})
			.from(userInventory)
			.leftJoin(rewardItems, eq(userInventory.rewardItemId, rewardItems.id))
			.where(eq(userInventory.userId, userId));

		const totalItems = inventoryStats.length;
		const legendaryItems = inventoryStats.filter(
			(item) => item.rarity === "legendary",
		).length;

		// 実績統計
		const [achievementStats] = await db
			.select({
				totalAchievements: count(),
			})
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId));

		return {
			totalLoginDays: loginStreak?.totalLoginDays ?? 0,
			currentStreak: loginStreak?.currentStreak ?? 0,
			longestStreak: loginStreak?.longestStreak ?? 0,
			totalItems,
			legendaryItems,
			achievements: achievementStats?.totalAchievements ?? 0,
			miniGameHighScore: Number(activityStats?.maxMiniGameScore ?? 0),
			rouletteWins: rouletteStats?.wins ?? 0,
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
	switch (type) {
		case "miniGame": {
			const scores = await db
				.select({
					userId: dailyActivities.userId,
					maxScore: max(dailyActivities.miniGameScore),
				})
				.from(dailyActivities)
				.groupBy(dailyActivities.userId)
				.orderBy(desc(max(dailyActivities.miniGameScore)))
				.limit(limit);

			return scores.map((score, index) => ({
				userId: score.userId,
				value: Number(score.maxScore ?? 0),
				rank: index + 1,
			}));
		}
		case "streak": {
			const streaks = await db
				.select({
					userId: loginStreaks.userId,
					longestStreak: loginStreaks.longestStreak,
				})
				.from(loginStreaks)
				.orderBy(desc(loginStreaks.longestStreak))
				.limit(limit);

			return streaks.map((streak, index) => ({
				userId: streak.userId,
				value: streak.longestStreak,
				rank: index + 1,
			}));
		}
		default:
			return [];
	}
};
