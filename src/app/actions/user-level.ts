"use server";

import { revalidatePath } from "next/cache";
import type { UserLevel } from "@/entities/user-level";
import { addExperience, fetchUserLevel } from "@/gateways/user-level";
import { createClient } from "@/lib/supabase/server";
import {
	type ExperienceReward,
	getActivityExperience,
	getLevelUpRewards,
} from "@/lib/user-level/level-service";
import { getUserStats } from "@/lib/user-stats/stats-service";

export async function getUserLevel(): Promise<UserLevel | null> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return fetchUserLevel(user.id);
}

export async function grantActivityExperience(
	activityType: ExperienceReward["activityType"],
	context?: {
		miniGameScore?: number;
		loginStreak?: number;
		achievementId?: string;
	},
): Promise<{
	success: boolean;
	error?: string;
	experience?: {
		gained: number;
		total: number;
	};
	levelUp?: {
		previousLevel: number;
		currentLevel: number;
		rewards: ReturnType<typeof getLevelUpRewards>;
	};
}> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const expReward = getActivityExperience(activityType, context);
		const totalExp = expReward.baseExp + (expReward.bonus ?? 0);

		const previousLevel = await fetchUserLevel(user.id);
		const result = await addExperience(user.id, totalExp);

		if (!result.success || !result.level) {
			return { success: false, error: result.error };
		}

		const response = {
			success: true,
			experience: {
				gained: totalExp,
				total: result.level.totalExp,
			},
			levelUp: undefined as
				| {
						previousLevel: number;
						currentLevel: number;
						rewards: ReturnType<typeof getLevelUpRewards>;
				  }
				| undefined,
		};

		if (result.leveledUp && previousLevel) {
			const rewards = getLevelUpRewards(result.level.currentLevel);
			response.levelUp = {
				previousLevel: previousLevel.currentLevel,
				currentLevel: result.level.currentLevel,
				rewards,
			};
		}

		revalidatePath("/profile");
		revalidatePath("/daily-rewards");

		return response;
	} catch (error) {
		console.error("Error granting experience:", error);
		return { success: false, error: "Failed to grant experience" };
	}
}

export async function fetchUserStats() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return getUserStats(user.id);
}
