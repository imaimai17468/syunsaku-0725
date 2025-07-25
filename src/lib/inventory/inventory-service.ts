import type { RewardItem } from "@/entities/reward-item";
import { fetchUserInventoryWithItems } from "@/gateways/user-inventory";
import { createClient } from "@/lib/supabase/client";
import { isDevelopment } from "@/utils/environment";

export interface InventoryItem {
	inventoryId: string;
	item: RewardItem;
	quantity: number;
	acquiredAt: Date;
	isUsed: boolean;
}

export interface InventoryStats {
	totalItems: number;
	totalQuantity: number;
	itemsByRarity: {
		common: number;
		rare: number;
		epic: number;
		legendary: number;
	};
	itemsByType: {
		coin: number;
		gem: number;
		boost: number;
		cosmetic: number;
	};
}

export const getInventoryItems = async (
	userId: string,
	filter?: {
		rarity?: RewardItem["rarity"];
		type?: RewardItem["itemType"];
		showUsed?: boolean;
	},
): Promise<InventoryItem[]> => {
	const inventoryData = await fetchUserInventoryWithItems(userId);

	let items = inventoryData;

	// フィルタリング
	if (filter) {
		if (!filter.showUsed) {
			items = items.filter((item) => !item.isUsed);
		}
		if (filter.rarity) {
			items = items.filter((item) => {
				const rewardItem = item.rewardItem as Record<string, unknown>;
				return rewardItem.rarity === filter.rarity;
			});
		}
		if (filter.type) {
			items = items.filter((item) => {
				const rewardItem = item.rewardItem as Record<string, unknown>;
				return rewardItem.item_type === filter.type;
			});
		}
	}

	// アクティブなアイテムのみ、取得日時の新しい順に並べる
	return items
		.filter((item) => {
			const rewardItem = item.rewardItem as Record<string, unknown>;
			return rewardItem.is_active === true;
		})
		.sort(
			(a, b) =>
				new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
		)
		.map((item) => {
			const rewardItem = item.rewardItem as Record<string, unknown>;
			return {
				inventoryId: item.id,
				item: {
					id: rewardItem.id as string,
					name: rewardItem.name as string,
					description: rewardItem.description as string | null,
					rarity: rewardItem.rarity as RewardItem["rarity"],
					iconUrl: rewardItem.icon_url as string | null,
					itemType: rewardItem.item_type as RewardItem["itemType"],
					value: rewardItem.value as number,
					isActive: rewardItem.is_active as boolean,
					createdAt: new Date(),
				},
				quantity: item.quantity,
				acquiredAt: new Date(item.acquiredAt),
				isUsed: item.isUsed,
			};
		});
};

export const getInventoryStats = async (
	userId: string,
): Promise<InventoryStats> => {
	const items = await getInventoryItems(userId, { showUsed: false });

	const stats: InventoryStats = {
		totalItems: items.length,
		totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
		itemsByRarity: {
			common: 0,
			rare: 0,
			epic: 0,
			legendary: 0,
		},
		itemsByType: {
			coin: 0,
			gem: 0,
			boost: 0,
			cosmetic: 0,
		},
	};

	items.forEach((item) => {
		stats.itemsByRarity[item.item.rarity] += item.quantity;
		stats.itemsByType[item.item.itemType] += item.quantity;
	});

	return stats;
};

export const useInventoryItem = async (
	userId: string,
	inventoryId: string,
): Promise<{ success: boolean; message: string }> => {
	if (isDevelopment()) {
		console.log("Dev mode: Using inventory item", { userId, inventoryId });
		return { success: true, message: "Item used successfully!" };
	}

	const supabase = createClient();

	try {
		// インベントリアイテムを取得
		const { data: inventoryItem, error: fetchError } = await supabase
			.from("user_inventory")
			.select("*, reward_items(*)")
			.eq("id", inventoryId)
			.eq("user_id", userId)
			.eq("is_used", false)
			.single();

		if (fetchError || !inventoryItem) {
			return { success: false, message: "Item not found or already used." };
		}

		// アイテムを使用済みにする
		const { error: updateError } = await supabase
			.from("user_inventory")
			.update({
				is_used: true,
				used_at: new Date().toISOString(),
			})
			.eq("id", inventoryId)
			.eq("user_id", userId);

		if (updateError) {
			console.error("Error using item:", updateError);
			return { success: false, message: "Failed to use item." };
		}

		// アイテムタイプに応じた処理（実際の効果はここで実装）
		const itemType = inventoryItem.reward_items.item_type;
		switch (itemType) {
			case "boost":
				// ブーストアイテムの効果を適用
				console.log("Applying boost effect");
				break;
			case "cosmetic":
				// コスメティックアイテムの効果を適用
				console.log("Applying cosmetic effect");
				break;
			default:
				// その他のアイテム
				break;
		}

		return { success: true, message: "Item used successfully!" };
	} catch (error) {
		console.error("Error using inventory item:", error);
		return {
			success: false,
			message: "An error occurred while using the item.",
		};
	}
};

export const deleteInventoryItem = async (
	userId: string,
	inventoryId: string,
): Promise<{ success: boolean; message: string }> => {
	if (isDevelopment()) {
		console.log("Dev mode: Deleting inventory item", { userId, inventoryId });
		return { success: true, message: "Item deleted successfully!" };
	}

	const supabase = createClient();

	try {
		const { error } = await supabase
			.from("user_inventory")
			.delete()
			.eq("id", inventoryId)
			.eq("user_id", userId);

		if (error) {
			console.error("Error deleting item:", error);
			return { success: false, message: "Failed to delete item." };
		}

		return { success: true, message: "Item deleted successfully!" };
	} catch (error) {
		console.error("Error deleting inventory item:", error);
		return {
			success: false,
			message: "An error occurred while deleting the item.",
		};
	}
};
