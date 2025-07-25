import { revalidatePath } from "next/cache";
import { type LoginStreak, LoginStreakSchema } from "@/entities/login-streak";
import { createClient } from "@/lib/supabase/server";

// Supabaseクライアントを取得
const getSupabaseClient = async () => {
	return await createClient();
};

export const fetchLoginStreak = async (
	userId: string,
): Promise<LoginStreak | null> => {
	const supabase = await getSupabaseClient();

	const { data, error } = await supabase
		.from("login_streaks")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error || !data) {
		return null;
	}

	const rawStreak = {
		id: data.id,
		userId: data.user_id,
		currentStreak: data.current_streak,
		longestStreak: data.longest_streak,
		lastLoginDate: data.last_login_date,
		totalLoginDays: data.total_login_days,
		createdAt: new Date(data.created_at),
		updatedAt: new Date(data.updated_at),
	};

	return LoginStreakSchema.parse(rawStreak);
};

export const upsertLoginStreak = async (
	userId: string,
	updates: Partial<
		Pick<
			LoginStreak,
			"currentStreak" | "longestStreak" | "lastLoginDate" | "totalLoginDays"
		>
	>,
): Promise<{ success: boolean; error?: string; streak?: LoginStreak }> => {
	const supabase = await getSupabaseClient();

	// 既存レコードを確認
	const existing = await fetchLoginStreak(userId);

	if (existing) {
		// 更新処理
		return updateLoginStreak(userId, updates);
	} else {
		// 新規作成
		const { data: result, error } = await supabase
			.from("login_streaks")
			.insert({
				user_id: userId,
				current_streak: updates.currentStreak ?? 0,
				longest_streak: updates.longestStreak ?? 0,
				last_login_date: updates.lastLoginDate ?? null,
				total_login_days: updates.totalLoginDays ?? 0,
			})
			.select()
			.single();

		if (error || !result) {
			return { success: false, error: "Failed to create login streak" };
		}

		const rawStreak = {
			id: result.id,
			userId: result.user_id,
			currentStreak: result.current_streak,
			longestStreak: result.longest_streak,
			lastLoginDate: result.last_login_date,
			totalLoginDays: result.total_login_days,
			createdAt: new Date(result.created_at),
			updatedAt: new Date(result.updated_at),
		};

		const streak = LoginStreakSchema.parse(rawStreak);

		revalidatePath("/daily-rewards");
		return { success: true, streak };
	}
};

export const updateLoginStreak = async (
	userId: string,
	updates: Partial<
		Pick<
			LoginStreak,
			"currentStreak" | "longestStreak" | "lastLoginDate" | "totalLoginDays"
		>
	>,
): Promise<{ success: boolean; error?: string; streak?: LoginStreak }> => {
	const supabase = await getSupabaseClient();

	const updateData: Record<string, unknown> = {};
	if (updates.currentStreak !== undefined) {
		updateData.current_streak = updates.currentStreak;
	}
	if (updates.longestStreak !== undefined) {
		updateData.longest_streak = updates.longestStreak;
	}
	if (updates.lastLoginDate !== undefined) {
		updateData.last_login_date = updates.lastLoginDate;
	}
	if (updates.totalLoginDays !== undefined) {
		updateData.total_login_days = updates.totalLoginDays;
	}

	const { data: result, error } = await supabase
		.from("login_streaks")
		.update(updateData)
		.eq("user_id", userId)
		.select()
		.single();

	if (error || !result) {
		return { success: false, error: "Failed to update login streak" };
	}

	const rawStreak = {
		id: result.id,
		userId: result.user_id,
		currentStreak: result.current_streak,
		longestStreak: result.longest_streak,
		lastLoginDate: result.last_login_date,
		totalLoginDays: result.total_login_days,
		createdAt: new Date(result.created_at),
		updatedAt: new Date(result.updated_at),
	};

	const streak = LoginStreakSchema.parse(rawStreak);

	revalidatePath("/daily-rewards");
	return { success: true, streak };
};
