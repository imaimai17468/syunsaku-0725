"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { AchievementNotificationProps } from "@/components/features/achievement/AchievementNotification";
import type { ItemDetailModalProps } from "@/components/features/inventory/ItemDetailModal";
import type { LevelUpEffectProps } from "@/components/features/level-up/LevelUpEffect";
import type { RouletteResultModalProps } from "@/components/features/roulette/RouletteResultModal";
import type { RouletteWheelProps } from "@/components/features/roulette/RouletteWheel";

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

export const LazyAchievementNotification =
	createLazyComponent<AchievementNotificationProps>(
		() => import("@/components/features/achievement/AchievementNotification"),
		"実績情報を読み込み中...",
	);

export const LazyLevelUpEffect = createLazyComponent<LevelUpEffectProps>(
	() => import("@/components/features/level-up/LevelUpEffect"),
	"レベルアップエフェクトを準備中...",
);

export const LazyRouletteWheel = createLazyComponent<RouletteWheelProps>(
	() => import("@/components/features/roulette/RouletteWheel"),
	"ルーレットを読み込み中...",
);

export const LazyRouletteResultModal =
	createLazyComponent<RouletteResultModalProps>(
		() => import("@/components/features/roulette/RouletteResultModal"),
		"結果モーダルを準備中...",
	);

export const LazyItemDetailModal = createLazyComponent<ItemDetailModalProps>(
	() => import("@/components/features/inventory/ItemDetailModal"),
	"アイテム詳細を読み込み中...",
);
