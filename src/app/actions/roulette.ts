"use server";

import { redirect } from "next/navigation";
import {
	checkRouletteStatus,
	playRoulette,
} from "@/lib/roulette/roulette-service";
import { createClient } from "@/lib/supabase/server";

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
