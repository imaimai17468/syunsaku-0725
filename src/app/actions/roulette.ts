"use server";

import { withAuth } from "@/lib/auth/auth-guard";
import {
	checkRouletteStatus,
	playRoulette,
} from "@/lib/roulette/roulette-service";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { createClient } from "@/lib/supabase/server";
import { checkAndUpdateAchievements } from "./achievement";
import { grantActivityExperience } from "./user-level";

export async function spinRouletteAction() {
	return withAuth(async (userId) => {
		// レート制限チェック
		const rateLimiter = new RateLimiter("gameAction");
		await rateLimiter.enforce(userId);

		const result = await playRoulette(userId);

		if (result.success) {
			// ルーレット完了に対して経験値を付与
			const expResult = await grantActivityExperience("roulette");

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
	});
}

export async function getRouletteStatus() {
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
		const status = await checkRouletteStatus(user.id);

		return {
			success: true,
			data: status,
		};
	} catch (error) {
		console.error("Error fetching roulette status:", error);
		return {
			success: false,
			error: "Failed to fetch roulette status",
		};
	}
}
