"use server";

import type { RewardItem } from "@/entities/reward-item";
import {
	deleteInventoryItem,
	getInventoryItems,
	getInventoryStats,
	type InventoryItem,
	type InventoryStats,
	useInventoryItem,
} from "@/lib/inventory/inventory-service";
import { createClient } from "@/lib/supabase/server";

export async function fetchInventoryItems(filter?: {
	rarity?: RewardItem["rarity"];
	type?: RewardItem["itemType"];
	showUsed?: boolean;
}): Promise<InventoryItem[]> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return getInventoryItems(user.id, filter);
}

export async function fetchInventoryStats(): Promise<InventoryStats> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return getInventoryStats(user.id);
}

export async function useItem(
	inventoryId: string,
): Promise<{ success: boolean; message: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return useInventoryItem(user.id, inventoryId);
}

export async function deleteItem(
	inventoryId: string,
): Promise<{ success: boolean; message: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return deleteInventoryItem(user.id, inventoryId);
}
