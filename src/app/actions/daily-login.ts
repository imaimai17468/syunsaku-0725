"use server";

import { redirect } from "next/navigation";
import { fetchLoginStreak } from "@/gateways/login-streak";
import {
	checkTodayLoginStatus,
	processUserLogin,
} from "@/lib/daily-login/login-service";
import { createClient } from "@/lib/supabase/server";

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
