"use server";

import { redirect } from "next/navigation";
import { fetchLoginStreak } from "@/gateways/login-streak";
import {
	checkTodayLoginStatus,
	processUserLogin,
} from "@/lib/daily-login/login-service";
import { createClient } from "@/lib/supabase/server";
import { checkAndUpdateAchievements } from "./achievement";
import { grantActivityExperience } from "./user-level";

export async function claimDailyLoginBonus() {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect("/login");
	}

	const result = await processUserLogin(user.id);

	if (result.success && result.streakInfo) {
		// ログインボーナスに対して経験値を付与
		const expResult = await grantActivityExperience("login", {
			loginStreak: result.streakInfo.currentStreak,
		});

		// 実績をチェック
		const achievementResult = await checkAndUpdateAchievements(user.id);

		return {
			...result,
			experience: expResult.experience,
			levelUp: expResult.levelUp,
			newAchievements: achievementResult.newlyUnlocked,
		};
	}

	return result;
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
