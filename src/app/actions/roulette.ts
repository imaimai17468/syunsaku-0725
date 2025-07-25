"use server";

import { redirect } from "next/navigation";
import {
	checkRouletteStatus,
	playRoulette,
} from "@/lib/roulette/roulette-service";
import { createClient } from "@/lib/supabase/server";
import { grantActivityExperience } from "./user-level";

export async function spinRouletteAction() {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect("/login");
	}

	const result = await playRoulette(user.id);

	if (result.success) {
		// ルーレット完了に対して経験値を付与
		const expResult = await grantActivityExperience("roulette");

		return {
			...result,
			experience: expResult.experience,
			levelUp: expResult.levelUp,
		};
	}

	return result;
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
