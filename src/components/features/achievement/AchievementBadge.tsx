"use client";

import { Check, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
	name: string;
	description: string;
	icon?: string | null;
	category: "login" | "game" | "collection" | "level" | "special";
	points: number;
	progress: number;
	maxProgress: number;
	isUnlocked: boolean;
	size?: "sm" | "md" | "lg";
	showProgress?: boolean;
	className?: string;
}

export function AchievementBadge({
	name,
	description,
	icon,
	category,
	points,
	progress,
	maxProgress,
	isUnlocked,
	size = "md",
	showProgress = true,
	className,
}: AchievementBadgeProps) {
	const sizeClasses = {
		sm: "h-16 w-16",
		md: "h-20 w-20",
		lg: "h-24 w-24",
	};

	const categoryColors = {
		login: "from-blue-500 to-blue-700",
		game: "from-purple-500 to-purple-700",
		collection: "from-amber-500 to-amber-700",
		level: "from-green-500 to-green-700",
		special: "from-red-500 to-red-700",
	};

	const progressPercentage = Math.round((progress / maxProgress) * 100);

	return (
		<div
			className={cn(
				"group relative flex flex-col items-center gap-2 rounded-lg p-4 transition-all",
				isUnlocked
					? "bg-slate-800/50 hover:bg-slate-800/70"
					: "bg-slate-900/50 hover:bg-slate-900/70",
				className,
			)}
		>
			{/* バッジアイコン */}
			<div className="relative">
				<div
					className={cn(
						"relative flex items-center justify-center rounded-full border-2 transition-all",
						sizeClasses[size],
						isUnlocked
							? `border-transparent bg-gradient-to-br ${categoryColors[category]} shadow-lg`
							: "border-slate-600 bg-slate-800",
					)}
				>
					{isUnlocked ? (
						<>
							{icon ? (
								<span className="text-2xl">{icon}</span>
							) : (
								<Trophy className="h-8 w-8 text-white" />
							)}
							<div className="-right-1 -top-1 absolute">
								<div className="rounded-full bg-green-500 p-1">
									<Check className="h-3 w-3 text-white" />
								</div>
							</div>
						</>
					) : (
						<Lock className="h-6 w-6 text-slate-500" />
					)}
				</div>

				{/* プログレスリング */}
				{showProgress && !isUnlocked && progress > 0 && (
					<svg
						className="-rotate-90 absolute inset-0 transform"
						viewBox="0 0 100 100"
					>
						<title>達成度: {progressPercentage}%</title>
						<circle
							cx="50"
							cy="50"
							r="45"
							fill="none"
							stroke="currentColor"
							strokeWidth="6"
							className="text-slate-700"
						/>
						<circle
							cx="50"
							cy="50"
							r="45"
							fill="none"
							stroke="currentColor"
							strokeWidth="6"
							strokeDasharray={`${progressPercentage * 2.83} 283`}
							className="text-blue-500 transition-all duration-300"
						/>
					</svg>
				)}
			</div>

			{/* 実績情報 */}
			<div className="text-center">
				<h3
					className={cn(
						"font-bold text-sm",
						isUnlocked ? "text-white" : "text-slate-400",
					)}
				>
					{name}
				</h3>
				<p className="mt-1 text-slate-500 text-xs">{description}</p>
			</div>

			{/* ポイント表示 */}
			<div
				className={cn(
					"rounded-full px-3 py-1 text-xs",
					isUnlocked
						? "bg-amber-500/20 text-amber-400"
						: "bg-slate-800 text-slate-500",
				)}
			>
				{points} pts
			</div>

			{/* プログレステキスト */}
			{showProgress && !isUnlocked && (
				<div className="text-slate-400 text-xs">
					{progress} / {maxProgress}
				</div>
			)}

			{/* ホバー時の詳細表示 */}
			<div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 scale-0 rounded-lg bg-slate-900 p-3 opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100">
				<div className="text-center">
					<p className="font-semibold text-white">{name}</p>
					<p className="mt-1 text-slate-300 text-xs">{description}</p>
					{!isUnlocked && (
						<div className="mt-2">
							<div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
								<div
									className="h-full bg-blue-500 transition-all"
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
							<p className="mt-1 text-slate-400 text-xs">
								{progressPercentage}% 完了
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
