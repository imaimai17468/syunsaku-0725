import { revalidatePath } from "next/cache";
import {
	type NewUserInventory,
	type UserInventory,
	UserInventorySchema,
} from "@/entities/user-inventory";
import { createClient } from "@/lib/supabase/server";

// Supabaseクライアントを取得
const getSupabaseClient = async () => {
	return await createClient();
};

export const fetchUserInventory = async (
	userId: string,
	options: {
		isUsed?: boolean;
		limit?: number;
	} = {},
): Promise<UserInventory[]> => {
	const supabase = await getSupabaseClient();

	let query = supabase.from("user_inventory").select("*").eq("user_id", userId);

	if (options.isUsed !== undefined) {
		query = query.eq("is_used", options.isUsed);
	}
	if (options.limit) {
		query = query.limit(options.limit);
	}

	query = query.order("acquired_at", { ascending: false });

	const { data, error } = await query;

	if (error || !data) {
		return [];
	}

	const rawInventory = data.map((item: Record<string, unknown>) => ({
		id: item.id,
		userId: item.user_id,
		rewardItemId: item.reward_item_id,
		quantity: item.quantity,
		acquiredAt: new Date(item.acquired_at as string),
		usedAt: item.used_at ? new Date(item.used_at as string) : null,
		isUsed: item.is_used,
	}));

	return UserInventorySchema.array().parse(rawInventory);
};

export const fetchUserInventoryWithItems = async (
	userId: string,
	options: {
		isUsed?: boolean;
		limit?: number;
	} = {},
): Promise<(UserInventory & { rewardItem: Record<string, unknown> })[]> => {
	const supabase = await getSupabaseClient();

	let query = supabase
		.from("user_inventory")
		.select(`
			*,
			reward_items (
				id,
				name,
				description,
				rarity,
				icon_url,
				item_type,
				value,
				is_active
			)
		`)
		.eq("user_id", userId);

	if (options.isUsed !== undefined) {
		query = query.eq("is_used", options.isUsed);
	}
	if (options.limit) {
		query = query.limit(options.limit);
	}

	query = query.order("acquired_at", { ascending: false });

	const { data, error } = await query;

	if (error || !data) {
		return [];
	}

	return data.map((item: Record<string, unknown>) => ({
		id: item.id as string,
		userId: item.user_id as string,
		rewardItemId: item.reward_item_id as string,
		quantity: item.quantity as number,
		acquiredAt: new Date(item.acquired_at as string),
		usedAt: item.used_at ? new Date(item.used_at as string) : null,
		isUsed: item.is_used as boolean,
		rewardItem: item.reward_items as Record<string, unknown>,
	}));
};

export const addToInventory = async (
	data: NewUserInventory,
): Promise<{ success: boolean; error?: string; inventory?: UserInventory }> => {
	const supabase = await getSupabaseClient();

	const { data: result, error } = await supabase
		.from("user_inventory")
		.insert({
			user_id: data.userId,
			reward_item_id: data.rewardItemId,
			quantity: data.quantity ?? 1,
			used_at: data.usedAt?.toISOString() ?? null,
			is_used: data.isUsed ?? false,
		})
		.select()
		.single();

	if (error || !result) {
		return { success: false, error: "Failed to add item to inventory" };
	}

	const rawInventory = {
		id: result.id,
		userId: result.user_id,
		rewardItemId: result.reward_item_id,
		quantity: result.quantity,
		acquiredAt: new Date(result.acquired_at as string),
		usedAt: result.used_at ? new Date(result.used_at as string) : null,
		isUsed: result.is_used,
	};

	const inventory = UserInventorySchema.parse(rawInventory);

	revalidatePath("/daily-rewards/inventory");
	return { success: true, inventory };
};

export const useInventoryItem = async (
	inventoryId: string,
): Promise<{ success: boolean; error?: string; inventory?: UserInventory }> => {
	const supabase = await getSupabaseClient();

	const { data: result, error } = await supabase
		.from("user_inventory")
		.update({
			used_at: new Date().toISOString(),
			is_used: true,
		})
		.eq("id", inventoryId)
		.eq("is_used", false)
		.select()
		.single();

	if (error || !result) {
		return { success: false, error: "Failed to use inventory item" };
	}

	const rawInventory = {
		id: result.id,
		userId: result.user_id,
		rewardItemId: result.reward_item_id,
		quantity: result.quantity,
		acquiredAt: new Date(result.acquired_at as string),
		usedAt: result.used_at ? new Date(result.used_at as string) : null,
		isUsed: result.is_used,
	};

	const inventory = UserInventorySchema.parse(rawInventory);

	revalidatePath("/daily-rewards/inventory");
	return { success: true, inventory };
};

export const removeFromInventory = async (
	inventoryId: string,
): Promise<{ success: boolean; error?: string }> => {
	const supabase = await getSupabaseClient();

	const { error } = await supabase
		.from("user_inventory")
		.delete()
		.eq("id", inventoryId);

	if (error) {
		return { success: false, error: "Failed to remove item from inventory" };
	}

	revalidatePath("/daily-rewards/inventory");
	return { success: true };
};
