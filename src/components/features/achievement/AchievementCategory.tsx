"use client";

import { Award, Gamepad2, Package, Star, Trophy } from "lucide-react";
import type { Achievement } from "@/entities/achievement";
import { cn } from "@/lib/utils";
import { AchievementBadge } from "./AchievementBadge";

interface AchievementCategoryProps {
	category: Achievement["category"];
	achievements: Array<
		Achievement & {
			userProgress?: {
				progress: number;
				achievedAt: Date | null;
				notified: boolean;
			};
		}
	>;
	showAll?: boolean;
	className?: string;
}

const categoryInfo = {
	login: {
		label: "ログイン",
		icon: Award,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500/20",
	},
	game: {
		label: "ゲーム",
		icon: Gamepad2,
		color: "text-purple-500",
		bgColor: "bg-purple-500/10",
		borderColor: "border-purple-500/20",
	},
	collection: {
		label: "コレクション",
		icon: Package,
		color: "text-amber-500",
		bgColor: "bg-amber-500/10",
		borderColor: "border-amber-500/20",
	},
	level: {
		label: "レベル",
		icon: Star,
		color: "text-green-500",
		bgColor: "bg-green-500/10",
		borderColor: "border-green-500/20",
	},
	special: {
		label: "スペシャル",
		icon: Trophy,
		color: "text-red-500",
		bgColor: "bg-red-500/10",
		borderColor: "border-red-500/20",
	},
};

export function AchievementCategory({
	category,
	achievements,
	showAll = false,
	className,
}: AchievementCategoryProps) {
	const info = categoryInfo[category];
	const Icon = info.icon;

	// 表示する実績（showAllがfalseの場合は最大6個）
	const displayAchievements = showAll ? achievements : achievements.slice(0, 6);

	// カテゴリーの統計
	const totalAchievements = achievements.length;
	const unlockedAchievements = achievements.filter(
		(a) => a.userProgress?.achievedAt,
	).length;
	const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
	const earnedPoints = achievements
		.filter((a) => a.userProgress?.achievedAt)
		.reduce((sum, a) => sum + a.points, 0);

	return (
		<div className={cn("rounded-lg border bg-slate-900/50 p-6", className)}>
			{/* カテゴリーヘッダー */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"flex h-12 w-12 items-center justify-center rounded-lg",
							info.bgColor,
							info.borderColor,
							"border",
						)}
					>
						<Icon className={cn("h-6 w-6", info.color)} />
					</div>
					<div>
						<h3 className="font-bold text-lg text-white">{info.label}</h3>
						<p className="text-slate-400 text-sm">
							{unlockedAchievements} / {totalAchievements} 達成
						</p>
					</div>
				</div>
				<div className="text-right">
					<p className="font-bold text-amber-400 text-lg">{earnedPoints}</p>
					<p className="text-slate-500 text-sm">/ {totalPoints} pts</p>
				</div>
			</div>

			{/* プログレスバー */}
			<div className="mb-6">
				<div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
					<div
						className={cn(
							"h-full transition-all duration-500",
							`bg-gradient-to-r from-${category === "login" ? "blue" : category === "game" ? "purple" : category === "collection" ? "amber" : category === "level" ? "green" : "red"}-500 to-${category === "login" ? "blue" : category === "game" ? "purple" : category === "collection" ? "amber" : category === "level" ? "green" : "red"}-600`,
						)}
						style={{
							width: `${(unlockedAchievements / totalAchievements) * 100}%`,
						}}
					/>
				</div>
			</div>

			{/* 実績グリッド */}
			<div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
				{displayAchievements.map((achievement) => (
					<AchievementBadge
						key={achievement.id}
						name={achievement.name}
						description={achievement.description}
						icon={achievement.iconUrl}
						category={achievement.category}
						points={achievement.points}
						progress={achievement.userProgress?.progress || 0}
						maxProgress={achievement.conditionValue}
						isUnlocked={!!achievement.userProgress?.achievedAt}
						size="sm"
						showProgress={false}
					/>
				))}
			</div>

			{/* もっと見るボタン */}
			{!showAll && achievements.length > 6 && (
				<div className="mt-4 text-center">
					<button
						type="button"
						className={cn(
							"text-sm transition-colors hover:underline",
							info.color,
						)}
					>
						さらに {achievements.length - 6} 個の実績を表示
					</button>
				</div>
			)}
		</div>
	);
}
