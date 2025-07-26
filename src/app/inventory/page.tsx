"use client";

import { Loader2, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	deleteItem,
	fetchInventoryItems,
	fetchInventoryStats,
	useItem,
} from "@/app/actions/inventory";
import { InventoryFilter } from "@/components/features/inventory/InventoryFilter";
import { InventoryItem } from "@/components/features/inventory/InventoryItem";
import { RPGCard } from "@/components/shared/RpgCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RewardItem } from "@/entities/reward-item";
import type {
	InventoryItem as InventoryItemType,
	InventoryStats,
} from "@/lib/inventory/inventory-service";
import { LazyItemDetailModal } from "@/lib/performance/lazy-load";

export default function InventoryPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [items, setItems] = useState<InventoryItemType[]>([]);
	const [stats, setStats] = useState<InventoryStats | null>(null);
	const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(
		null,
	);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [filter, setFilter] = useState<{
		rarity?: RewardItem["rarity"];
		type?: RewardItem["itemType"];
		showUsed?: boolean;
	}>({});

	// データの取得
	const loadInventory = useCallback(async () => {
		try {
			const [itemsData, statsData] = await Promise.all([
				fetchInventoryItems(filter),
				fetchInventoryStats(),
			]);
			setItems(itemsData);
			setStats(statsData);
		} catch (error) {
			console.error("Error loading inventory:", error);
			toast.error("Failed to load inventory");
		} finally {
			setIsLoading(false);
		}
	}, [filter]);

	useEffect(() => {
		loadInventory();
	}, [loadInventory]);

	// アイテム使用
	const handleUseItem = async (inventoryId: string) => {
		try {
			// biome-ignore lint/correctness/useHookAtTopLevel: useItem is a server action, not a React hook
			const result = await useItem(inventoryId);
			if (result.success) {
				toast.success(result.message);
				await loadInventory();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			console.error("Error using item:", error);
			toast.error("Failed to use item");
		}
	};

	// アイテム削除
	const handleDeleteItem = async (inventoryId: string) => {
		try {
			const result = await deleteItem(inventoryId);
			if (result.success) {
				toast.success(result.message);
				await loadInventory();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			console.error("Error deleting item:", error);
			toast.error("Failed to delete item");
		}
	};

	// アイテム詳細表示
	const handleViewItem = (item: InventoryItemType) => {
		setSelectedItem(item);
		setShowDetailModal(true);
	};

	// フィルター変更
	const handleFilterChange = (newFilter: typeof filter) => {
		setFilter((prev) => ({ ...prev, ...newFilter }));
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
			<div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<RPGCard variant="epic" className="text-center">
					<h1 className="mb-2 font-bold text-3xl text-white">
						<Package className="mb-2 inline-block h-8 w-8" /> Inventory
					</h1>
					<p className="text-slate-300">
						Manage your collected items and treasures
					</p>
				</RPGCard>

				{/* Stats */}
				{stats && (
					<div className="grid gap-4 md:grid-cols-4">
						<Card className="border-slate-600 bg-slate-800/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-slate-300 text-sm">
									Total Items
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-white">
									{stats.totalItems}
								</div>
							</CardContent>
						</Card>
						<Card className="border-slate-600 bg-slate-800/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-slate-300 text-sm">
									Total Quantity
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-white">
									{stats.totalQuantity}
								</div>
							</CardContent>
						</Card>
						<Card className="border-slate-600 bg-slate-800/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-slate-300 text-sm">
									Legendary Items
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-amber-400">
									{stats.itemsByRarity.legendary}
								</div>
							</CardContent>
						</Card>
						<Card className="border-slate-600 bg-slate-800/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-slate-300 text-sm">
									Boost Items
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl text-blue-400">
									{stats.itemsByType.boost}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Main Content */}
				<Tabs defaultValue="all" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3 lg:w-auto">
						<TabsTrigger value="all">All Items</TabsTrigger>
						<TabsTrigger value="usable">Usable</TabsTrigger>
						<TabsTrigger value="collectibles">Collectibles</TabsTrigger>
					</TabsList>

					<Card className="border-slate-600 bg-slate-800/50">
						<CardHeader>
							<CardTitle className="text-white">Filter Items</CardTitle>
						</CardHeader>
						<CardContent>
							<InventoryFilter
								onFilterChange={handleFilterChange}
								stats={
									stats?.itemsByRarity && stats?.itemsByType ? stats : undefined
								}
							/>
						</CardContent>
					</Card>

					<TabsContent value="all" className="space-y-4">
						{items.length === 0 ? (
							<Alert className="border-slate-600 bg-slate-800/50">
								<AlertDescription className="text-slate-300">
									No items found. Complete daily activities to earn rewards!
								</AlertDescription>
							</Alert>
						) : (
							<ScrollArea className="h-[600px]">
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{items.map((item) => (
										<InventoryItem
											key={item.inventoryId}
											item={item}
											onUse={handleUseItem}
											onDelete={handleDeleteItem}
											onView={handleViewItem}
										/>
									))}
								</div>
							</ScrollArea>
						)}
					</TabsContent>

					<TabsContent value="usable" className="space-y-4">
						{items.filter((item) => item.item.itemType === "boost").length ===
						0 ? (
							<Alert className="border-slate-600 bg-slate-800/50">
								<AlertDescription className="text-slate-300">
									No usable items found.
								</AlertDescription>
							</Alert>
						) : (
							<ScrollArea className="h-[600px]">
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{items
										.filter((item) => item.item.itemType === "boost")
										.map((item) => (
											<InventoryItem
												key={item.inventoryId}
												item={item}
												onUse={handleUseItem}
												onDelete={handleDeleteItem}
												onView={handleViewItem}
											/>
										))}
								</div>
							</ScrollArea>
						)}
					</TabsContent>

					<TabsContent value="collectibles" className="space-y-4">
						{items.filter((item) => item.item.itemType === "cosmetic")
							.length === 0 ? (
							<Alert className="border-slate-600 bg-slate-800/50">
								<AlertDescription className="text-slate-300">
									No collectible items found.
								</AlertDescription>
							</Alert>
						) : (
							<ScrollArea className="h-[600px]">
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{items
										.filter((item) => item.item.itemType === "cosmetic")
										.map((item) => (
											<InventoryItem
												key={item.inventoryId}
												item={item}
												onUse={handleUseItem}
												onDelete={handleDeleteItem}
												onView={handleViewItem}
											/>
										))}
								</div>
							</ScrollArea>
						)}
					</TabsContent>
				</Tabs>
			</div>

			{/* Item Detail Modal */}
			<LazyItemDetailModal
				item={selectedItem}
				isOpen={showDetailModal}
				onClose={() => setShowDetailModal(false)}
				onUse={handleUseItem}
				onDelete={handleDeleteItem}
			/>
		</div>
	);
}
