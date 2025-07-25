import { revalidatePath } from "next/cache";
import {
	type DailyActivity,
	DailyActivitySchema,
} from "@/entities/daily-activity";
import { createClient } from "@/lib/supabase/server";

export const fetchDailyActivity = async (
	userId: string,
	activityDate: string,
): Promise<DailyActivity | null> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("daily_activities")
		.select("*")
		.eq("user_id", userId)
		.eq("activity_date", activityDate)
		.single();

	if (error || !data) {
		return null;
	}

	const rawActivity = {
		id: data.id,
		userId: data.user_id,
		activityDate: data.activity_date,
		loginCount: data.login_count,
		rouletteCompleted: data.roulette_completed,
		miniGameCompleted: data.mini_game_completed,
		miniGameScore: data.mini_game_score,
		createdAt: new Date(data.created_at),
		updatedAt: new Date(data.updated_at),
	};

	return DailyActivitySchema.parse(rawActivity);
};

export const fetchUserDailyActivities = async (
	userId: string,
	limit = 30,
): Promise<DailyActivity[]> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("daily_activities")
		.select("*")
		.eq("user_id", userId)
		.order("activity_date", { ascending: false })
		.limit(limit);

	if (error || !data) {
		return [];
	}

	const rawActivities = data.map((item: Record<string, unknown>) => ({
		id: item.id,
		userId: item.user_id,
		activityDate: item.activity_date,
		loginCount: item.login_count,
		rouletteCompleted: item.roulette_completed,
		miniGameCompleted: item.mini_game_completed,
		miniGameScore: item.mini_game_score,
		createdAt: new Date(item.created_at as string),
		updatedAt: new Date(item.updated_at as string),
	}));

	return DailyActivitySchema.array().parse(rawActivities);
};

export const upsertDailyActivity = async (
	userId: string,
	activityDate: string,
	updates: Partial<
		Pick<
			DailyActivity,
			"loginCount" | "rouletteCompleted" | "miniGameCompleted" | "miniGameScore"
		>
	>,
): Promise<{ success: boolean; error?: string; activity?: DailyActivity }> => {
	const supabase = await createClient();

	// 既存レコードを確認
	const existing = await fetchDailyActivity(userId, activityDate);

	if (existing) {
		// 更新処理
		return updateDailyActivity(userId, activityDate, updates);
	} else {
		// 新規作成
		const { data: result, error } = await supabase
			.from("daily_activities")
			.insert({
				user_id: userId,
				activity_date: activityDate,
				login_count: updates.loginCount ?? 1,
				roulette_completed: updates.rouletteCompleted ?? false,
				mini_game_completed: updates.miniGameCompleted ?? false,
				mini_game_score: updates.miniGameScore ?? 0,
			})
			.select()
			.single();

		if (error || !result) {
			return { success: false, error: "Failed to create daily activity" };
		}

		const rawActivity = {
			id: result.id,
			userId: result.user_id,
			activityDate: result.activity_date,
			loginCount: result.login_count,
			rouletteCompleted: result.roulette_completed,
			miniGameCompleted: result.mini_game_completed,
			miniGameScore: result.mini_game_score,
			createdAt: new Date(result.created_at),
			updatedAt: new Date(result.updated_at),
		};

		const activity = DailyActivitySchema.parse(rawActivity);

		revalidatePath("/daily-rewards");
		return { success: true, activity };
	}
};

export const updateDailyActivity = async (
	userId: string,
	activityDate: string,
	updates: Partial<
		Pick<
			DailyActivity,
			"rouletteCompleted" | "miniGameCompleted" | "miniGameScore"
		>
	>,
): Promise<{ success: boolean; error?: string; activity?: DailyActivity }> => {
	const supabase = await createClient();

	const updateData: Record<string, unknown> = {};
	if (updates.rouletteCompleted !== undefined) {
		updateData.roulette_completed = updates.rouletteCompleted;
	}
	if (updates.miniGameCompleted !== undefined) {
		updateData.mini_game_completed = updates.miniGameCompleted;
	}
	if (updates.miniGameScore !== undefined) {
		updateData.mini_game_score = updates.miniGameScore;
	}

	const { data: result, error } = await supabase
		.from("daily_activities")
		.update(updateData)
		.eq("user_id", userId)
		.eq("activity_date", activityDate)
		.select()
		.single();

	if (error || !result) {
		return { success: false, error: "Failed to update daily activity" };
	}

	const rawActivity = {
		id: result.id,
		userId: result.user_id,
		activityDate: result.activity_date,
		loginCount: result.login_count,
		rouletteCompleted: result.roulette_completed,
		miniGameCompleted: result.mini_game_completed,
		miniGameScore: result.mini_game_score,
		createdAt: new Date(result.created_at),
		updatedAt: new Date(result.updated_at),
	};

	const activity = DailyActivitySchema.parse(rawActivity);

	revalidatePath("/daily-rewards");
	return { success: true, activity };
};
