"use client";

import { Award, Loader2, Trophy } from "lucide-react";
import { useState } from "react";
import { RankingList } from "@/components/features/ranking/RankingList";
import { RPGCard } from "@/components/shared/RpgCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RankingData, RankingType } from "@/entities/ranking";

type RankingTabsProps = {
	initialData: RankingData;
	currentUserId?: string;
	fetchRankingAction: (type: RankingType) => Promise<RankingData>;
};

export const RankingTabs = ({
	initialData,
	currentUserId,
	fetchRankingAction,
}: RankingTabsProps) => {
	const [rankings, setRankings] = useState<
		Record<RankingType, RankingData | null>
	>({
		level: initialData,
		loginStreak: null,
		miniGameScore: null,
		totalPoints: null,
	});
	const [activeTab, setActiveTab] = useState<RankingType>("level");

	const handleTabChange = async (value: string) => {
		const type = value as RankingType;
		setActiveTab(type);

		// すでに読み込み済みの場合はスキップ
		if (rankings[type]) return;

		try {
			const data = await fetchRankingAction(type);
			setRankings((prev) => ({ ...prev, [type]: data }));
		} catch (error) {
			console.error(`Error loading ${type} ranking:`, error);
		}
	};

	const getRankingConfig = (type: RankingType) => {
		switch (type) {
			case "level":
				return {
					title: "レベル",
					scoreLabel: "レベル",
					formatScore: (score: number) => `Lv.${score}`,
					icon: <Trophy className="h-4 w-4" />,
				};
			case "loginStreak":
				return {
					title: "連続ログイン",
					scoreLabel: "連続日数",
					formatScore: (score: number) => `${score}日`,
					icon: <span className="text-base">🔥</span>,
				};
			case "miniGameScore":
				return {
					title: "ミニゲーム",
					scoreLabel: "最高スコア",
					formatScore: (score: number) => score.toLocaleString(),
					icon: <span className="text-base">🎮</span>,
				};
			case "totalPoints":
				return {
					title: "実績ポイント",
					scoreLabel: "総ポイント",
					formatScore: (score: number) => `${score.toLocaleString()}pt`,
					icon: <Award className="h-4 w-4" />,
				};
		}
	};

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange}>
			<TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-4">
				{(
					["level", "loginStreak", "miniGameScore", "totalPoints"] as const
				).map((type) => {
					const config = getRankingConfig(type);
					return (
						<TabsTrigger key={type} value={type} className="gap-2">
							{config.icon}
							<span>{config.title}</span>
						</TabsTrigger>
					);
				})}
			</TabsList>

			{(["level", "loginStreak", "miniGameScore", "totalPoints"] as const).map(
				(type) => {
					const config = getRankingConfig(type);
					const data = rankings[type];

					return (
						<TabsContent key={type} value={type}>
							{/* 現在のユーザーランク */}
							{data?.currentUserRank && (
								<RPGCard variant="rare" className="mb-6">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">
												あなたの順位
											</h3>
											<p className="text-gray-400 text-sm">
												{config.title}ランキング
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-3xl text-amber-400">
												{data.currentUserRank}位
											</p>
											<p className="text-gray-400 text-sm">
												/ {data.users.length}人中
											</p>
										</div>
									</div>
								</RPGCard>
							)}

							{/* ランキングリスト */}
							{data ? (
								<RankingList
									users={data.users}
									currentUserId={currentUserId}
									scoreLabel={config.scoreLabel}
									formatScore={config.formatScore}
								/>
							) : (
								<div className="flex h-64 items-center justify-center">
									<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
								</div>
							)}
						</TabsContent>
					);
				},
			)}
		</Tabs>
	);
};
