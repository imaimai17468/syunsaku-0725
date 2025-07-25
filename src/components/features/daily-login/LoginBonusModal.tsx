"use client";

import { Coins, Gift, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface LoginBonusModalProps {
	isOpen: boolean;
	onClose: () => void;
	rewards: {
		coins: number;
		exp: number;
		specialReward?: {
			itemId: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		};
	};
	streakInfo: {
		currentStreak: number;
		isNewDay: boolean;
		streakBroken: boolean;
		bonusMultiplier: number;
	};
	levelUp?: {
		newLevel: number;
		leveledUp: boolean;
	};
}

export function LoginBonusModal({
	isOpen,
	onClose,
	rewards,
	streakInfo,
	levelUp,
}: LoginBonusModalProps) {
	const getSpecialRewardName = (itemId: string) => {
		switch (itemId) {
			case "weekly-chest":
				return "Weekly Treasure Chest";
			case "monthly-chest":
				return "Monthly Legendary Chest";
			case "milestone-chest":
				return "Milestone Epic Chest";
			default:
				return "Special Reward";
		}
	};

	const getSpecialRewardDescription = (itemId: string) => {
		switch (itemId) {
			case "weekly-chest":
				return "Contains rare items and bonus coins";
			case "monthly-chest":
				return "Legendary chest with amazing treasures";
			case "milestone-chest":
				return "Epic rewards for your dedication";
			default:
				return "A special reward for your loyalty";
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="border-amber-600/20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center font-bold text-2xl text-amber-200">
						Daily Login Bonus!
					</DialogTitle>
					<DialogDescription className="text-center">
						{streakInfo.streakBroken ? (
							<span className="text-orange-300">
								Streak reset, but you're back on track!
							</span>
						) : (
							<span className="text-amber-300">
								{streakInfo.currentStreak} day streak •{" "}
								{streakInfo.bonusMultiplier}x multiplier
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Level Up Notification */}
					{levelUp?.leveledUp && (
						<Card className="border-purple-500 bg-gradient-to-r from-purple-600/20 to-purple-800/20">
							<CardContent className="p-4">
								<div className="flex items-center justify-center gap-2 text-purple-300">
									<Zap className="h-5 w-5" />
									<span className="font-bold">Level Up!</span>
								</div>
								<p className="mt-1 text-center text-purple-200">
									You reached level {levelUp.newLevel}!
								</p>
							</CardContent>
						</Card>
					)}

					{/* Rewards */}
					<div className="space-y-4">
						<h3 className="text-center font-bold text-lg text-white">
							Your Rewards:
						</h3>

						<div className="grid grid-cols-2 gap-4">
							{/* Coins */}
							<Card className="border-slate-600 bg-slate-800/50">
								<CardContent className="p-4 text-center">
									<Coins className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
									<div className="font-bold text-2xl text-yellow-400">
										{rewards.coins}
									</div>
									<div className="text-slate-300 text-sm">Coins</div>
								</CardContent>
							</Card>

							{/* Experience */}
							<Card className="border-slate-600 bg-slate-800/50">
								<CardContent className="p-4 text-center">
									<Zap className="mx-auto mb-2 h-8 w-8 text-blue-500" />
									<div className="font-bold text-2xl text-blue-400">
										{rewards.exp}
									</div>
									<div className="text-slate-300 text-sm">EXP</div>
								</CardContent>
							</Card>
						</div>

						{/* Special Reward */}
						{rewards.specialReward && (
							<div className="mt-6">
								<h4 className="mb-3 text-center font-bold text-amber-200 text-md">
									Special Bonus!
								</h4>
								<Card
									className={`mx-auto max-w-xs border-2 ${
										rewards.specialReward.rarity === "legendary"
											? "border-amber-500 bg-gradient-to-br from-amber-900/20 to-amber-700/20"
											: rewards.specialReward.rarity === "epic"
												? "border-purple-500 bg-gradient-to-br from-purple-900/20 to-purple-700/20"
												: rewards.specialReward.rarity === "rare"
													? "border-blue-500 bg-gradient-to-br from-blue-900/20 to-blue-700/20"
													: "border-slate-500 bg-gradient-to-br from-slate-900/20 to-slate-700/20"
									}`}
								>
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<Gift
												className={`h-6 w-6 ${
													rewards.specialReward.rarity === "legendary"
														? "text-amber-500"
														: rewards.specialReward.rarity === "epic"
															? "text-purple-500"
															: rewards.specialReward.rarity === "rare"
																? "text-blue-500"
																: "text-slate-400"
												}`}
											/>
											<Badge
												variant="outline"
												className={
													rewards.specialReward.rarity === "legendary"
														? "border-amber-500 text-amber-400"
														: rewards.specialReward.rarity === "epic"
															? "border-purple-500 text-purple-400"
															: rewards.specialReward.rarity === "rare"
																? "border-blue-500 text-blue-400"
																: "border-slate-500 text-slate-400"
												}
											>
												{rewards.specialReward.rarity.toUpperCase()}
											</Badge>
										</div>
										<CardTitle className="font-semibold text-sm text-white">
											{getSpecialRewardName(rewards.specialReward.itemId)}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-slate-300 text-xs">
											{getSpecialRewardDescription(
												rewards.specialReward.itemId,
											)}
										</p>
									</CardContent>
								</Card>
							</div>
						)}
					</div>

					{/* Close Button */}
					<Button
						size="lg"
						onClick={onClose}
						className="w-full bg-gradient-to-b from-amber-500 to-amber-700 font-bold text-white shadow-lg hover:from-amber-400 hover:to-amber-600"
					>
						Awesome!
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
