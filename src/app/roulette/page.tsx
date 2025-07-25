"use client";

import { Clock, Loader2, RotateCcw, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getRouletteStatus, spinRouletteAction } from "@/app/actions/roulette";
import { LevelUpEffect } from "@/components/features/level-up/LevelUpEffect";
import { RouletteResultModal } from "@/components/features/roulette/RouletteResultModal";
import { RouletteWheel } from "@/components/features/roulette/RouletteWheel";
import { GameButton } from "@/components/shared/GameButton";
import { RPGCard } from "@/components/shared/RpgCard";
import {
	DEFAULT_ROULETTE_REWARDS,
	sortRewardsByAngle,
} from "@/lib/roulette/roulette-engine";

interface RouletteStatus {
	canPlay: boolean;
	alreadyPlayed: boolean;
}

interface SpinResult {
	reward: import("@/lib/roulette/roulette-engine").RouletteReward;
	spinAngle: number;
	spinDuration: number;
	levelUp?:
		| {
				previousLevel: number;
				currentLevel: number;
				rewards: Array<{
					level: number;
					rewardType: "item" | "achievement" | "unlock";
					rewardName: string;
					rewardDescription?: string;
				}>;
		  }
		| {
				newLevel: number;
				leveledUp: boolean;
		  };
}

export default function RoulettePage() {
	const [status, setStatus] = useState<RouletteStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [spinning, setSpinning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showResultModal, setShowResultModal] = useState(false);
	const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
	const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);

	const rewards = sortRewardsByAngle(DEFAULT_ROULETTE_REWARDS);

	const fetchStatus = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getRouletteStatus();

			if (result.success && result.data) {
				setStatus(result.data);
				setError(null);
			} else {
				setError(result.error || "Failed to fetch roulette status");
			}
		} catch (err) {
			setError("An unexpected error occurred");
			console.error("Error fetching roulette status:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSpin = async () => {
		if (!status?.canPlay || spinning) return;

		try {
			setSpinning(true);
			setError(null);

			const result = await spinRouletteAction();

			if (result.success && result.result) {
				setSpinResult({
					reward: result.result.reward,
					spinAngle: result.result.spinAngle,
					spinDuration: result.result.spinDuration,
					levelUp: result.levelUp,
				});
			} else if (result.alreadyPlayed) {
				setError("You have already played the roulette today");
				setSpinning(false);
				await fetchStatus();
			} else {
				setError(result.error || "Failed to spin roulette");
				setSpinning(false);
			}
		} catch (err) {
			setError("An unexpected error occurred while spinning");
			setSpinning(false);
			console.error("Error spinning roulette:", err);
		}
	};

	const handleSpinComplete = () => {
		setSpinning(false);
		if (spinResult) {
			setShowResultModal(true);
			// レベルアップがあった場合は、モーダルを閉じた後にエフェクトを表示
			if (spinResult.levelUp) {
				setTimeout(() => {
					setShowLevelUpEffect(true);
				}, 500);
			}
		}
		fetchStatus(); // Refresh status
	};

	const handleCloseModal = () => {
		setShowResultModal(false);
		setSpinResult(null);
	};

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<RPGCard className="text-center">
					<Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
					<p className="text-slate-300">Loading roulette...</p>
				</RPGCard>
			</div>
		);
	}

	if (error && !status) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
				<RPGCard className="max-w-md text-center">
					<h2 className="mb-4 font-bold text-red-300 text-xl">Error</h2>
					<p className="mb-4 text-red-200">{error}</p>
					<GameButton onClick={fetchStatus} variant="secondary">
						Try Again
					</GameButton>
				</RPGCard>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-white">
						🎰 Daily Roulette
					</h1>
					<p className="text-slate-400">
						Spin the wheel once per day for amazing rewards!
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6">
						<RPGCard className="border-red-500 bg-red-900/20">
							<div className="text-center text-red-300">
								<p className="font-medium">{error}</p>
							</div>
						</RPGCard>
					</div>
				)}

				{/* Main Game Area */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* Roulette Wheel */}
					<div className="lg:col-span-2">
						<RPGCard className="text-center">
							<RouletteWheel
								rewards={rewards}
								isSpinning={spinning}
								spinAngle={spinResult?.spinAngle}
								spinDuration={spinResult?.spinDuration}
								onSpinComplete={handleSpinComplete}
								className="mb-6"
							/>

							{/* Spin Button */}
							<div className="space-y-4">
								{status?.alreadyPlayed ? (
									<div className="space-y-3">
										<div className="flex items-center justify-center gap-2 text-green-400">
											<Star className="h-5 w-5" />
											<span className="font-medium">Already played today!</span>
										</div>
										<GameButton
											variant="secondary"
											size="lg"
											disabled
											icon={<Clock />}
										>
											Come back tomorrow
										</GameButton>
									</div>
								) : (
									<GameButton
										variant="legendary"
										size="lg"
										onClick={handleSpin}
										disabled={spinning || !status?.canPlay}
										loading={spinning}
										icon={<RotateCcw />}
										className="w-full max-w-xs"
									>
										{spinning ? "Spinning..." : "Spin the Wheel!"}
									</GameButton>
								)}
							</div>
						</RPGCard>
					</div>

					{/* Rewards Info */}
					<div className="space-y-6">
						<RPGCard>
							<h3 className="mb-4 font-bold text-lg text-white">
								Possible Rewards
							</h3>
							<div className="space-y-3">
								{rewards.map((reward) => (
									<div
										key={reward.id}
										className="flex items-center justify-between rounded bg-slate-800/50 p-2"
									>
										<div className="flex items-center gap-2">
											<span className="text-lg">{reward.icon || "🎁"}</span>
											<span className="text-slate-300 text-sm">
												{reward.name}
											</span>
										</div>
										<div className="text-slate-400 text-xs">
											{reward.probability}%
										</div>
									</div>
								))}
							</div>
						</RPGCard>

						<RPGCard>
							<h3 className="mb-4 font-bold text-lg text-white">How to Play</h3>
							<div className="space-y-2 text-slate-300 text-sm">
								<p>• Spin the roulette once per day</p>
								<p>• Higher rarity rewards are rarer</p>
								<p>• Rewards are added to your inventory</p>
								<p>• Come back tomorrow for another spin!</p>
							</div>
						</RPGCard>
					</div>
				</div>

				{/* Result Modal */}
				{showResultModal && spinResult && (
					<RouletteResultModal
						isOpen={showResultModal}
						onClose={handleCloseModal}
						reward={spinResult.reward}
						levelUp={
							spinResult.levelUp && "currentLevel" in spinResult.levelUp
								? {
										newLevel: spinResult.levelUp.currentLevel,
										leveledUp: true,
									}
								: undefined
						}
					/>
				)}

				{/* Level Up Effect */}
				{showLevelUpEffect &&
					spinResult?.levelUp &&
					"previousLevel" in spinResult.levelUp && (
						<LevelUpEffect
							isOpen={showLevelUpEffect}
							onClose={() => setShowLevelUpEffect(false)}
							previousLevel={spinResult.levelUp.previousLevel}
							currentLevel={spinResult.levelUp.currentLevel}
							rewards={spinResult.levelUp.rewards}
						/>
					)}
			</div>
		</div>
	);
}
