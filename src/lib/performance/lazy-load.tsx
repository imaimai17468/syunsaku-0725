"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const createLazyComponent = <P extends object>(
	importFn: () => Promise<{ default: ComponentType<P> }>,
	loadingMessage = "読み込み中...",
) => {
	return dynamic(importFn, {
		loading: () => (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-6 w-6 animate-spin text-blue-500" />
				<span className="ml-2 text-slate-400">{loadingMessage}</span>
			</div>
		),
		ssr: true,
	});
};

export const LazyAchievementNotification = createLazyComponent(
	() =>
		import("@/components/features/achievement/AchievementNotification").then(
			(mod) => ({ default: mod.AchievementNotification }),
		),
	"実績情報を読み込み中...",
);

export const LazyLevelUpEffect = createLazyComponent(
	() =>
		import("@/components/features/level-up/LevelUpEffect").then((mod) => ({
			default: mod.LevelUpEffect,
		})),
	"レベルアップエフェクトを準備中...",
);

export const LazyRouletteWheel = createLazyComponent(
	() =>
		import("@/components/features/roulette/RouletteWheel").then((mod) => ({
			default: mod.RouletteWheel,
		})),
	"ルーレットを読み込み中...",
);

export const LazyRouletteResultModal = createLazyComponent(
	() =>
		import("@/components/features/roulette/RouletteResultModal").then(
			(mod) => ({ default: mod.RouletteResultModal }),
		),
	"結果モーダルを準備中...",
);

export const LazyInventoryGrid = createLazyComponent(
	() =>
		import("@/components/features/inventory/InventoryGrid").then((mod) => ({
			default: mod.InventoryGrid,
		})),
	"インベントリを読み込み中...",
);

export const LazyItemDetailModal = createLazyComponent(
	() =>
		import("@/components/features/inventory/ItemDetailModal").then((mod) => ({
			default: mod.ItemDetailModal,
		})),
	"アイテム詳細を読み込み中...",
);
