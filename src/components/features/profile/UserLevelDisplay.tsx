"use client";

import { TrendingUp, Zap } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RPGCard } from "@/components/shared/RpgCard";
import { Badge } from "@/components/ui/badge";
import type { UserLevel } from "@/entities/user-level";
import {
	calculateLevelProgress,
	formatLevelInfo,
} from "@/lib/user-level/level-service";

interface UserLevelDisplayProps {
	userLevel: UserLevel;
	showDetails?: boolean;
}

export function UserLevelDisplay({
	userLevel,
	showDetails = true,
}: UserLevelDisplayProps) {
	const progress = calculateLevelProgress(
		userLevel.currentExp,
		userLevel.currentLevel,
	);
	const levelInfo = formatLevelInfo(userLevel);

	return (
		<RPGCard variant="epic" className="p-6">
			<div className="space-y-4">
				{/* Level Badge */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="absolute inset-0 bg-purple-500 opacity-50 blur-xl" />
							<div className="relative rounded-full bg-gradient-to-br from-purple-600 to-purple-800 p-4">
								<Zap className="h-8 w-8 text-white" />
							</div>
						</div>
						<div>
							<h3 className="font-bold text-2xl text-white">
								{levelInfo.displayLevel}
							</h3>
							{showDetails && (
								<p className="text-slate-300 text-sm">
									次のレベルまで {levelInfo.nextLevelExp} EXP
								</p>
							)}
						</div>
					</div>
					{showDetails && (
						<Badge
							variant="secondary"
							className="bg-purple-900/50 text-purple-300"
						>
							<TrendingUp className="mr-1 h-3 w-3" />
							総獲得EXP: {userLevel.totalExp}
						</Badge>
					)}
				</div>

				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-slate-400">経験値</span>
						<span className="text-slate-300">{levelInfo.progressText}</span>
					</div>
					<ProgressBar
						value={progress.percentage}
						max={100}
						className="h-3"
						variant="exp"
						animated={true}
						showText={false}
					/>
					<p className="text-right text-slate-400 text-xs">
						{progress.percentage}%
					</p>
				</div>

				{/* Level Milestones */}
				{showDetails && (
					<div className="border-slate-700 border-t pt-2">
						<p className="mb-2 text-slate-400 text-xs">次のマイルストーン</p>
						<div className="flex gap-2">
							{userLevel.currentLevel < 25 && (
								<Badge variant="outline" className="text-xs">
									Lv.25: 特別ミニゲーム解放
								</Badge>
							)}
							{userLevel.currentLevel < 50 && (
								<Badge variant="outline" className="text-xs">
									Lv.50: レジェンダリー報酬
								</Badge>
							)}
							{userLevel.currentLevel < 100 && (
								<Badge variant="outline" className="text-xs">
									Lv.100: マスター称号
								</Badge>
							)}
						</div>
					</div>
				)}
			</div>
		</RPGCard>
	);
}
