import { revalidatePath } from "next/cache";
import { type UserLevel, UserLevelSchema } from "@/entities/user-level";
import { createClient } from "@/lib/supabase/server";

// Supabaseクライアントを取得
const getSupabaseClient = async () => {
	return await createClient();
};

export const fetchUserLevel = async (
	userId: string,
): Promise<UserLevel | null> => {
	const supabase = await getSupabaseClient();

	const { data, error } = await supabase
		.from("user_levels")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error || !data) {
		return null;
	}

	const rawLevel = {
		id: data.id,
		userId: data.user_id,
		currentLevel: data.current_level,
		currentExp: data.current_exp,
		totalExp: data.total_exp,
		createdAt: new Date(data.created_at),
		updatedAt: new Date(data.updated_at),
	};

	return UserLevelSchema.parse(rawLevel);
};

export const upsertUserLevel = async (
	userId: string,
	updates: Partial<Pick<UserLevel, "currentLevel" | "currentExp" | "totalExp">>,
): Promise<{ success: boolean; error?: string; level?: UserLevel }> => {
	const supabase = await getSupabaseClient();

	// 既存レコードを確認
	const existing = await fetchUserLevel(userId);

	if (existing) {
		// 更新処理
		const updateData: Record<string, unknown> = {};
		if (updates.currentLevel !== undefined) {
			updateData.current_level = updates.currentLevel;
		}
		if (updates.currentExp !== undefined) {
			updateData.current_exp = updates.currentExp;
		}
		if (updates.totalExp !== undefined) {
			updateData.total_exp = updates.totalExp;
		}

		const { data: result, error } = await supabase
			.from("user_levels")
			.update(updateData)
			.eq("user_id", userId)
			.select()
			.single();

		if (error || !result) {
			return { success: false, error: "Failed to update user level" };
		}

		const rawLevel = {
			id: result.id,
			userId: result.user_id,
			currentLevel: result.current_level,
			currentExp: result.current_exp,
			totalExp: result.total_exp,
			createdAt: new Date(result.created_at),
			updatedAt: new Date(result.updated_at),
		};

		const level = UserLevelSchema.parse(rawLevel);
		revalidatePath("/daily-rewards");
		return { success: true, level };
	} else {
		// 新規作成
		const { data: result, error } = await supabase
			.from("user_levels")
			.insert({
				user_id: userId,
				current_level: updates.currentLevel ?? 1,
				current_exp: updates.currentExp ?? 0,
				total_exp: updates.totalExp ?? 0,
			})
			.select()
			.single();

		if (error || !result) {
			return { success: false, error: "Failed to create user level" };
		}

		const rawLevel = {
			id: result.id,
			userId: result.user_id,
			currentLevel: result.current_level,
			currentExp: result.current_exp,
			totalExp: result.total_exp,
			createdAt: new Date(result.created_at),
			updatedAt: new Date(result.updated_at),
		};

		const level = UserLevelSchema.parse(rawLevel);
		revalidatePath("/daily-rewards");
		return { success: true, level };
	}
};

export const addExperience = async (
	userId: string,
	expToAdd: number,
): Promise<{
	success: boolean;
	error?: string;
	level?: UserLevel;
	leveledUp?: boolean;
}> => {
	const current = await fetchUserLevel(userId);

	if (!current) {
		// 初回の場合は新規作成
		return {
			...(await upsertUserLevel(userId, {
				currentExp: expToAdd,
				totalExp: expToAdd,
			})),
			leveledUp: false,
		};
	}

	const newTotalExp = current.totalExp + expToAdd;
	let newCurrentExp = current.currentExp + expToAdd;
	let newLevel = current.currentLevel;
	let leveledUp = false;

	// レベルアップ判定（100exp毎にレベルアップ）
	while (newCurrentExp >= 100) {
		newCurrentExp -= 100;
		newLevel += 1;
		leveledUp = true;
	}

	const result = await upsertUserLevel(userId, {
		currentLevel: newLevel,
		currentExp: newCurrentExp,
		totalExp: newTotalExp,
	});

	return {
		...result,
		leveledUp,
	};
};
