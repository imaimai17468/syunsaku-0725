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
		<div className="min-h-screen bg-black py-[10vh]">
			<div className="mx-auto max-w-6xl px-4">
				{/* ヒーローセクション */}
				<div className="mb-12 text-center">
					<div className="mb-6 flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl" />
							<Package className="relative h-24 w-24 text-white" />
						</div>
					</div>
					<h1 className="mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent">
						インベントリ
					</h1>
					<p className="mx-auto max-w-2xl text-gray-400 text-lg">
						獲得したアイテムと宝物を管理しよう
					</p>
				</div>

				{/* Stats */}
				{stats && (
					<div className="grid gap-4 md:grid-cols-4">
						<RPGCard className="text-center">
							<div className="mb-2 flex justify-center">
								<Package className="h-8 w-8 text-blue-500" />
							</div>
							<p className="font-bold text-2xl text-white">
								{stats.totalItems}
							</p>
							<p className="text-gray-400 text-sm">総アイテム数</p>
						</RPGCard>
						<RPGCard className="text-center">
							<div className="mb-2 flex justify-center">
								<span className="text-2xl">📦</span>
							</div>
							<p className="font-bold text-2xl text-white">
								{stats.totalQuantity}
							</p>
							<p className="text-gray-400 text-sm">総所持数</p>
						</RPGCard>
						<RPGCard className="text-center">
							<div className="mb-2 flex justify-center">
								<span className="text-2xl">⭐</span>
							</div>
							<p className="font-bold text-2xl text-amber-400">
								{stats.itemsByRarity.legendary}
							</p>
							<p className="text-gray-400 text-sm">レジェンダリー</p>
						</RPGCard>
						<RPGCard className="text-center">
							<div className="mb-2 flex justify-center">
								<span className="text-2xl">🚀</span>
							</div>
							<p className="font-bold text-2xl text-blue-400">
								{stats.itemsByType.boost}
							</p>
							<p className="text-gray-400 text-sm">ブーストアイテム</p>
						</RPGCard>
					</div>
				)}

				{/* Main Content */}
				<Tabs defaultValue="all" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3 lg:w-auto">
						<TabsTrigger value="all">All Items</TabsTrigger>
						<TabsTrigger value="usable">Usable</TabsTrigger>
						<TabsTrigger value="collectibles">Collectibles</TabsTrigger>
					</TabsList>

					<RPGCard>
						<div className="p-4">
							<h3 className="mb-4 font-semibold text-lg text-white">
								フィルター
							</h3>
							<InventoryFilter
								onFilterChange={handleFilterChange}
								stats={
									stats?.itemsByRarity && stats?.itemsByType ? stats : undefined
								}
							/>
						</div>
					</RPGCard>

					<TabsContent value="all" className="space-y-4">
						{items.length === 0 ? (
							<RPGCard className="text-center">
								<div className="p-8">
									<Package className="mx-auto mb-4 h-16 w-16 text-gray-600" />
									<p className="text-gray-400">
										アイテムがありません。デイリー活動を完了して報酬を獲得しましょう！
									</p>
								</div>
							</RPGCard>
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
							<RPGCard className="text-center">
								<div className="p-8">
									<span className="mx-auto mb-4 block text-6xl">🚀</span>
									<p className="text-gray-400">
										使用可能なアイテムがありません。
									</p>
								</div>
							</RPGCard>
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
							<RPGCard className="text-center">
								<div className="p-8">
									<span className="mx-auto mb-4 block text-6xl">💎</span>
									<p className="text-gray-400">
										コレクションアイテムがありません。
									</p>
								</div>
							</RPGCard>
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
