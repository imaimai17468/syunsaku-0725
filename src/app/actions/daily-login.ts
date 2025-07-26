"use server";

import { fetchLoginStreak } from "@/gateways/login-streak";
import { withAuth } from "@/lib/auth/auth-guard";
import {
	checkTodayLoginStatus,
	processUserLogin,
} from "@/lib/daily-login/login-service";
import { createError, withRetry } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import { checkAndUpdateAchievements } from "./achievement";
import { grantActivityExperience } from "./user-level";

export async function claimDailyLoginBonus() {
	return withAuth(async (userId) => {
		return withRetry(
			async () => {
				const result = await processUserLogin(userId);

				if (!result.success) {
					throw createError(
						"serverError",
						result.error || "ログイン処理に失敗しました",
					);
				}

				if (result.streakInfo) {
					// ログインボーナスに対して経験値を付与
					const expResult = await grantActivityExperience("login", {
						loginStreak: result.streakInfo.currentStreak,
					});

					// 実績をチェック
					const achievementResult = await checkAndUpdateAchievements(userId);

					return {
						...result,
						experience: expResult.experience,
						levelUp: expResult.levelUp,
						newAchievements: achievementResult.newlyUnlocked,
					};
				}

				return result;
			},
			{
				maxAttempts: 3,
				shouldRetry: (error) => {
					const appError = error as ReturnType<typeof createError>;
					return appError.type === "serverError";
				},
			},
		);
	});
}

export async function getUserLoginStatus() {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return {
			success: false,
			error: "User not authenticated",
		};
	}

	try {
		const [loginStatus, streakData] = await Promise.all([
			checkTodayLoginStatus(user.id),
			fetchLoginStreak(user.id),
		]);

		return {
			success: true,
			data: {
				...loginStatus,
				longestStreak: streakData?.longestStreak || 0,
				totalLoginDays: streakData?.totalLoginDays || 0,
			},
		};
	} catch (error) {
		console.error("Error fetching user login status:", error);
		return {
			success: false,
			error: "Failed to fetch login status",
		};
	}
}

export async function getDailyProgress(userId: string) {
	const supabase = await createClient();

	// 今日の日付を取得
	const today = new Date().toISOString().split("T")[0];

	// 今日の活動記録を取得
	const { data: dailyActivity } = await supabase
		.from("daily_activities")
		.select("*")
		.eq("user_id", userId)
		.eq("activity_date", today)
		.single();

	// ログインストリーク情報を取得
	const streakData = await fetchLoginStreak(userId);

	return {
		dailyLogin: !!dailyActivity?.login_count,
		rouletteCompleted: dailyActivity?.roulette_completed || false,
		miniGameCompleted: dailyActivity?.mini_game_completed || false,
		miniGameHighScore: dailyActivity?.mini_game_score || 0,
		loginStreak: streakData?.currentStreak || 0,
		longestStreak: streakData?.longestStreak || 0,
		totalLoginDays: streakData?.totalLoginDays || 0,
	};
}
