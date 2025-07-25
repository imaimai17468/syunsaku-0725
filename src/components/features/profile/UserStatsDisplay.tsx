"use client";

import { Calendar, Package, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStatsDisplayProps {
	stats: {
		totalLoginDays: number;
		currentStreak: number;
		longestStreak: number;
		totalItems: number;
		legendaryItems: number;
		achievements: number;
		miniGameHighScore: number;
		rouletteWins: number;
	};
}

export function UserStatsDisplay({ stats }: UserStatsDisplayProps) {
	const statCards = [
		{
			title: "総ログイン日数",
			value: stats.totalLoginDays,
			icon: Calendar,
			color: "text-blue-500",
			bgColor: "bg-blue-900/20",
			borderColor: "border-blue-500/50",
		},
		{
			title: "現在の連続ログイン",
			value: `${stats.currentStreak}日`,
			icon: TrendingUp,
			color: "text-green-500",
			bgColor: "bg-green-900/20",
			borderColor: "border-green-500/50",
		},
		{
			title: "最長連続記録",
			value: `${stats.longestStreak}日`,
			icon: Trophy,
			color: "text-yellow-500",
			bgColor: "bg-yellow-900/20",
			borderColor: "border-yellow-500/50",
		},
		{
			title: "獲得アイテム数",
			value: stats.totalItems,
			icon: Package,
			color: "text-purple-500",
			bgColor: "bg-purple-900/20",
			borderColor: "border-purple-500/50",
			subtitle: `レジェンダリー: ${stats.legendaryItems}`,
		},
		{
			title: "達成実績",
			value: stats.achievements,
			icon: Trophy,
			color: "text-amber-500",
			bgColor: "bg-amber-900/20",
			borderColor: "border-amber-500/50",
		},
		{
			title: "ミニゲーム最高スコア",
			value: stats.miniGameHighScore.toLocaleString(),
			icon: TrendingUp,
			color: "text-pink-500",
			bgColor: "bg-pink-900/20",
			borderColor: "border-pink-500/50",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{statCards.map((stat, _index) => {
				const Icon = stat.icon;
				return (
					<Card
						key={stat.title}
						className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm`}
					>
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2 text-slate-300 text-sm">
								<Icon className={`h-4 w-4 ${stat.color}`} />
								{stat.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl text-white">{stat.value}</div>
							{stat.subtitle && (
								<p className="mt-1 text-slate-400 text-xs">{stat.subtitle}</p>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
