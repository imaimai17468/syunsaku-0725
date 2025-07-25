"use client";

import { Calendar, Flame, Gift, Star } from "lucide-react";
import { useState } from "react";
import { GameButton } from "@/components/shared/GameButton";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RPGCard } from "@/components/shared/RpgCard";

interface LoginStreakDisplayProps {
	currentStreak: number;
	longestStreak: number;
	totalLoginDays: number;
	hasLoggedInToday: boolean;
	canClaimBonus: boolean;
	onClaimBonus: () => Promise<void>;
	loading?: boolean;
}

export function LoginStreakDisplay({
	currentStreak,
	longestStreak,
	totalLoginDays,
	hasLoggedInToday,
	canClaimBonus,
	onClaimBonus,
	loading = false,
}: LoginStreakDisplayProps) {
	const [claiming, setClaiming] = useState(false);

	const handleClaimBonus = async () => {
		if (claiming || !canClaimBonus) return;

		setClaiming(true);
		try {
			await onClaimBonus();
		} finally {
			setClaiming(false);
		}
	};

	const getStreakCardVariant = () => {
		if (currentStreak >= 30) return "legendary";
		if (currentStreak >= 14) return "epic";
		if (currentStreak >= 7) return "rare";
		return "default";
	};

	const getNextMilestone = () => {
		if (currentStreak < 7) return { target: 7, reward: "Weekly Chest" };
		if (currentStreak < 14) return { target: 14, reward: "Epic Bonus" };
		if (currentStreak < 30) return { target: 30, reward: "Legendary Chest" };
		const nextTen = Math.ceil(currentStreak / 10) * 10;
		return { target: nextTen, reward: "Milestone Chest" };
	};

	const milestone = getNextMilestone();

	return (
		<div className="space-y-6">
			{/* Main Streak Display */}
			<RPGCard variant={getStreakCardVariant()} className="text-center">
				<div className="space-y-4">
					<div className="mb-4 flex items-center justify-center gap-2">
						<Flame className="h-8 w-8 text-orange-500" />
						<h2 className="font-bold text-2xl text-white">Login Streak</h2>
					</div>

					<div className="mb-2 font-bold text-6xl text-white">
						{currentStreak}
					</div>

					<p className="text-lg text-slate-300">
						{currentStreak === 1 ? "Day" : "Days"} in a row
					</p>

					{hasLoggedInToday ? (
						<div className="flex items-center justify-center gap-2 text-green-400">
							<Star className="h-5 w-5" />
							<span className="font-medium">Already claimed today!</span>
						</div>
					) : (
						<GameButton
							variant={canClaimBonus ? "legendary" : "secondary"}
							size="lg"
							disabled={!canClaimBonus}
							loading={claiming || loading}
							onClick={handleClaimBonus}
							icon={<Gift />}
						>
							{canClaimBonus ? "Claim Daily Bonus" : "Come back tomorrow"}
						</GameButton>
					)}
				</div>
			</RPGCard>

			{/* Progress to Next Milestone */}
			<RPGCard>
				<div className="space-y-4">
					<h3 className="flex items-center gap-2 font-bold text-lg text-white">
						<Calendar className="h-5 w-5" />
						Next Milestone
					</h3>

					<ProgressBar
						value={currentStreak}
						max={milestone.target}
						variant="exp"
						label={`Progress to ${milestone.reward}`}
						showText={true}
					/>

					<p className="text-center text-slate-400 text-sm">
						{milestone.target - currentStreak} more days to unlock{" "}
						{milestone.reward}
					</p>
				</div>
			</RPGCard>

			{/* Statistics */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<RPGCard>
					<div className="text-center">
						<div className="mb-2 font-bold text-3xl text-amber-400">
							{longestStreak}
						</div>
						<p className="text-slate-300">Longest Streak</p>
					</div>
				</RPGCard>

				<RPGCard>
					<div className="text-center">
						<div className="mb-2 font-bold text-3xl text-blue-400">
							{totalLoginDays}
						</div>
						<p className="text-slate-300">Total Login Days</p>
					</div>
				</RPGCard>
			</div>

			{/* Streak Milestones */}
			<RPGCard>
				<div className="space-y-4">
					<h3 className="font-bold text-lg text-white">Streak Rewards</h3>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{ days: 3, reward: "1.5x Bonus", achieved: currentStreak >= 3 },
							{ days: 7, reward: "Weekly Chest", achieved: currentStreak >= 7 },
							{ days: 14, reward: "2.5x Bonus", achieved: currentStreak >= 14 },
							{
								days: 30,
								reward: "Legendary Chest",
								achieved: currentStreak >= 30,
							},
						].map((milestone) => (
							<div
								key={milestone.days}
								className={`rounded-lg border-2 p-3 text-center transition-all ${
									milestone.achieved
										? "border-green-500 bg-green-500/10 text-green-400"
										: "border-slate-600 bg-slate-800/50 text-slate-400"
								}`}
							>
								<div className="font-bold">{milestone.days} Days</div>
								<div className="text-xs">{milestone.reward}</div>
								{milestone.achieved && (
									<Star className="mx-auto mt-1 h-4 w-4 text-green-400" />
								)}
							</div>
						))}
					</div>
				</div>
			</RPGCard>
		</div>
	);
}
