import { NextResponse } from "next/server";
import { checkAndUpdateAchievements } from "@/app/actions/achievement";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 実績をチェックして更新
		const result = await checkAndUpdateAchievements(user.id);

		return NextResponse.json({
			success: true,
			newlyUnlocked: result.newlyUnlocked.length,
			achievements: result.newlyUnlocked.map((a) => ({
				name: a.name,
				description: a.description,
				points: a.points,
			})),
		});
	} catch (error) {
		console.error("Error checking achievements:", error);
		return NextResponse.json(
			{ error: "Failed to check achievements" },
			{ status: 500 },
		);
	}
}
