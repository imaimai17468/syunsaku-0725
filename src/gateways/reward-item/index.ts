import { revalidatePath } from "next/cache";
import {
	type NewRewardItem,
	type RewardItem,
	type RewardItemRarity,
	RewardItemSchema,
	type RewardItemType,
} from "@/entities/reward-item";
import { createClient } from "@/lib/supabase/server";

// Supabaseクライアントを取得
const getSupabaseClient = async () => {
	return await createClient();
};

export const fetchRewardItems = async (
	options: {
		isActive?: boolean;
		rarity?: RewardItemRarity;
		itemType?: RewardItemType;
		limit?: number;
	} = {},
): Promise<RewardItem[]> => {
	const supabase = await getSupabaseClient();

	let query = supabase.from("reward_items").select("*");

	if (options.isActive !== undefined) {
		query = query.eq("is_active", options.isActive);
	}
	if (options.rarity) {
		query = query.eq("rarity", options.rarity);
	}
	if (options.itemType) {
		query = query.eq("item_type", options.itemType);
	}
	if (options.limit) {
		query = query.limit(options.limit);
	}

	query = query.order("created_at", { ascending: false });

	const { data, error } = await query;

	if (error || !data) {
		return [];
	}

	const rawItems = data.map((item: Record<string, unknown>) => ({
		id: item.id,
		name: item.name,
		description: item.description,
		rarity: item.rarity,
		iconUrl: item.icon_url,
		itemType: item.item_type,
		value: item.value,
		isActive: item.is_active,
		createdAt: new Date(item.created_at as string),
	}));

	return RewardItemSchema.array().parse(rawItems);
};

export const fetchRewardItem = async (
	itemId: string,
): Promise<RewardItem | null> => {
	const supabase = await getSupabaseClient();

	const { data, error } = await supabase
		.from("reward_items")
		.select("*")
		.eq("id", itemId)
		.single();

	if (error || !data) {
		return null;
	}

	const rawItem = {
		id: data.id,
		name: data.name,
		description: data.description,
		rarity: data.rarity,
		iconUrl: data.icon_url,
		itemType: data.item_type,
		value: data.value,
		isActive: data.is_active,
		createdAt: new Date(data.created_at),
	};

	return RewardItemSchema.parse(rawItem);
};

export const createRewardItem = async (
	data: NewRewardItem,
): Promise<{ success: boolean; error?: string; item?: RewardItem }> => {
	const supabase = await getSupabaseClient();

	const { data: result, error } = await supabase
		.from("reward_items")
		.insert({
			name: data.name,
			description: data.description ?? null,
			rarity: data.rarity ?? "common",
			icon_url: data.iconUrl ?? null,
			item_type: data.itemType ?? "coin",
			value: data.value ?? 1,
			is_active: data.isActive ?? true,
		})
		.select()
		.single();

	if (error || !result) {
		return { success: false, error: "Failed to create reward item" };
	}

	const rawItem = {
		id: result.id,
		name: result.name,
		description: result.description,
		rarity: result.rarity,
		iconUrl: result.icon_url,
		itemType: result.item_type,
		value: result.value,
		isActive: result.is_active,
		createdAt: new Date(result.created_at),
	};

	const item = RewardItemSchema.parse(rawItem);

	revalidatePath("/daily-rewards");
	return { success: true, item };
};

export const updateRewardItem = async (
	itemId: string,
	updates: Partial<
		Pick<
			RewardItem,
			| "name"
			| "description"
			| "rarity"
			| "iconUrl"
			| "itemType"
			| "value"
			| "isActive"
		>
	>,
): Promise<{ success: boolean; error?: string; item?: RewardItem }> => {
	const supabase = await getSupabaseClient();

	const updateData: Record<string, unknown> = {};
	if (updates.name !== undefined) {
		updateData.name = updates.name;
	}
	if (updates.description !== undefined) {
		updateData.description = updates.description;
	}
	if (updates.rarity !== undefined) {
		updateData.rarity = updates.rarity;
	}
	if (updates.iconUrl !== undefined) {
		updateData.icon_url = updates.iconUrl;
	}
	if (updates.itemType !== undefined) {
		updateData.item_type = updates.itemType;
	}
	if (updates.value !== undefined) {
		updateData.value = updates.value;
	}
	if (updates.isActive !== undefined) {
		updateData.is_active = updates.isActive;
	}

	const { data: result, error } = await supabase
		.from("reward_items")
		.update(updateData)
		.eq("id", itemId)
		.select()
		.single();

	if (error || !result) {
		return { success: false, error: "Failed to update reward item" };
	}

	const rawItem = {
		id: result.id,
		name: result.name,
		description: result.description,
		rarity: result.rarity,
		iconUrl: result.icon_url,
		itemType: result.item_type,
		value: result.value,
		isActive: result.is_active,
		createdAt: new Date(result.created_at),
	};

	const item = RewardItemSchema.parse(rawItem);

	revalidatePath("/daily-rewards");
	return { success: true, item };
};
