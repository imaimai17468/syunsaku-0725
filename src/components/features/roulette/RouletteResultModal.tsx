"use client";

import { Coins, Gift, Star, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { GameButton } from "@/components/shared/GameButton";
import { RewardItem } from "@/components/shared/RewardItem";
import { RPGCard } from "@/components/shared/RpgCard";
import type { RouletteReward } from "@/lib/roulette/roulette-engine";

interface RouletteResultModalProps {
	isOpen: boolean;
	onClose: () => void;
	reward: RouletteReward;
	levelUp?: {
		newLevel: number;
		leveledUp: boolean;
	};
}

export function RouletteResultModal({
	isOpen,
	onClose,
	reward,
	levelUp,
}: RouletteResultModalProps) {
	const [showAnimation, setShowAnimation] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShowAnimation(true);

			// レアな報酬の場合は紙吹雪エフェクト
			if (reward.rarity === "legendary" || reward.rarity === "epic") {
				setShowConfetti(true);
				const timer = setTimeout(() => setShowConfetti(false), 3000);
				return () => clearTimeout(timer);
			}
		}
	}, [isOpen, reward.rarity]);

	if (!isOpen) return null;

	const getRewardIcon = () => {
		if (reward.icon) return reward.icon;
		if (reward.coins) return <Coins className="text-yellow-500" />;
		if (reward.exp) return <Zap className="text-blue-500" />;
		if (reward.itemId) return <Gift className="text-purple-500" />;
		return "🎁";
	};

	const getRewardDescription = () => {
		const parts = [];
		if (reward.coins) parts.push(`${reward.coins} Coins`);
		if (reward.exp) parts.push(`${reward.exp} EXP`);
		if (reward.itemId) parts.push("Special Item");
		return parts.join(" + ") || "Mystery Reward";
	};

	const getCardVariant = () => {
		switch (reward.rarity) {
			case "legendary":
				return "legendary";
			case "epic":
				return "epic";
			case "rare":
				return "rare";
			default:
				return "default";
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			{/* Confetti Effect */}
			{showConfetti && (
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					{Array.from({ length: 50 }, (_, i) => (
						<div
							key={`confetti-${Math.random()}-${i}`}
							className="absolute h-2 w-2 animate-bounce bg-gradient-to-r from-yellow-400 to-red-500"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 2}s`,
								animationDuration: `${2 + Math.random() * 2}s`,
							}}
						/>
					))}
				</div>
			)}

			<div
				className={`w-full max-w-md transform transition-all duration-500 ${
					showAnimation ? "scale-100 opacity-100" : "scale-95 opacity-0"
				}`}
			>
				<RPGCard variant={getCardVariant()} className="relative">
					{/* Close Button */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 z-10 text-slate-400 transition-colors hover:text-white"
					>
						<X className="h-6 w-6" />
					</button>

					<div className="space-y-6 text-center">
						{/* Header */}
						<div>
							<h2 className="mb-2 font-bold text-3xl text-white">
								🎉 Congratulations! 🎉
							</h2>
							<p className="text-lg text-slate-300">
								You won a {reward.rarity} reward!
							</p>
						</div>

						{/* Level Up Notification */}
						{levelUp?.leveledUp && (
							<div className="rounded-lg border border-purple-500 bg-gradient-to-r from-purple-600/20 to-purple-800/20 p-4">
								<div className="flex items-center justify-center gap-2 text-purple-300">
									<Star className="h-5 w-5" />
									<span className="font-bold">Level Up!</span>
								</div>
								<p className="mt-1 text-purple-200">
									You reached level {levelUp.newLevel}!
								</p>
							</div>
						)}

						{/* Main Reward Display */}
						<div className="space-y-4">
							<RewardItem
								name={reward.name}
								description={getRewardDescription()}
								rarity={reward.rarity}
								icon={getRewardIcon()}
								className="mx-auto max-w-48"
							/>

							{/* Reward Details */}
							<div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
								<h3 className="mb-3 font-bold text-lg text-white">
									Reward Details:
								</h3>

								<div className="space-y-2">
									{reward.coins && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Coins className="h-4 w-4 text-yellow-500" />
												<span className="text-slate-300">Coins</span>
											</div>
											<span className="font-bold text-yellow-400">
												+{reward.coins}
											</span>
										</div>
									)}

									{reward.exp && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Zap className="h-4 w-4 text-blue-500" />
												<span className="text-slate-300">Experience</span>
											</div>
											<span className="font-bold text-blue-400">
												+{reward.exp}
											</span>
										</div>
									)}

									{reward.itemId && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Gift className="h-4 w-4 text-purple-500" />
												<span className="text-slate-300">Special Item</span>
											</div>
											<span className="font-bold text-purple-400">+1</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Rarity Badge */}
						<div className="flex justify-center">
							<div
								className={cn(
									"rounded-full border-2 px-4 py-2 font-bold text-sm",
									reward.rarity === "legendary" &&
										"border-amber-500 bg-amber-500/20 text-amber-300",
									reward.rarity === "epic" &&
										"border-purple-500 bg-purple-500/20 text-purple-300",
									reward.rarity === "rare" &&
										"border-blue-500 bg-blue-500/20 text-blue-300",
									reward.rarity === "common" &&
										"border-slate-500 bg-slate-500/20 text-slate-300",
								)}
							>
								{reward.rarity.toUpperCase()} REWARD
							</div>
						</div>

						{/* Close Button */}
						<GameButton
							variant={
								getCardVariant() as
									| "primary"
									| "secondary"
									| "success"
									| "danger"
									| "legendary"
							}
							size="lg"
							onClick={onClose}
							className="w-full"
							icon={<Star />}
						>
							Awesome!
						</GameButton>
					</div>
				</RPGCard>
			</div>
		</div>
	);
}

function cn(...classes: (string | undefined | false)[]): string {
	return classes.filter(Boolean).join(" ");
}
