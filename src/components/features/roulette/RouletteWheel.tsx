"use client";

import { useEffect, useState } from "react";
import type { RouletteReward } from "@/lib/roulette/roulette-engine";
import { cn } from "@/lib/utils";

export interface RouletteWheelProps {
	rewards: RouletteReward[];
	isSpinning: boolean;
	spinAngle?: number;
	spinDuration?: number;
	onSpinComplete?: () => void;
	className?: string;
}

export function RouletteWheel({
	rewards,
	isSpinning,
	spinAngle = 0,
	spinDuration = 3000,
	onSpinComplete,
	className,
}: RouletteWheelProps) {
	const [currentAngle, setCurrentAngle] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	const segmentAngle = 360 / rewards.length;

	useEffect(() => {
		if (isSpinning && spinAngle > 0) {
			setIsAnimating(true);
			setCurrentAngle(spinAngle);

			const timer = setTimeout(() => {
				setIsAnimating(false);
				onSpinComplete?.();
			}, spinDuration);

			return () => clearTimeout(timer);
		}
	}, [isSpinning, spinAngle, spinDuration, onSpinComplete]);

	const getRarityColor = (rarity: RouletteReward["rarity"]) => {
		switch (rarity) {
			case "legendary":
				return "from-amber-400 to-amber-600";
			case "epic":
				return "from-purple-400 to-purple-600";
			case "rare":
				return "from-blue-400 to-blue-600";
			default:
				return "from-slate-400 to-slate-600";
		}
	};

	const getTextColor = (rarity: RouletteReward["rarity"]) => {
		switch (rarity) {
			case "legendary":
				return "text-amber-900";
			case "epic":
				return "text-purple-900";
			case "rare":
				return "text-blue-900";
			default:
				return "text-slate-900";
		}
	};

	return (
		<div className={cn("relative", className)}>
			{/* Wheel Container */}
			<div className="relative mx-auto h-80 w-80">
				{/* Wheel */}
				<div
					className={cn(
						"relative h-full w-full overflow-hidden rounded-full border-8 border-slate-700 shadow-2xl",
						isAnimating && "transition-transform ease-out",
					)}
					style={{
						transform: `rotate(${currentAngle}deg)`,
						transitionDuration: isAnimating ? `${spinDuration}ms` : "0ms",
					}}
				>
					{/* Segments */}
					{rewards.map((reward, index) => {
						const rotation = index * segmentAngle;
						const rarityColors = getRarityColor(reward.rarity);
						const textColor = getTextColor(reward.rarity);

						return (
							<div
								key={reward.id}
								className="absolute inset-0"
								style={{
									transform: `rotate(${rotation}deg)`,
									clipPath: `polygon(50% 50%, 50% 0%, ${
										50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)
									}% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`,
								}}
							>
								<div
									className={cn("h-full w-full bg-gradient-to-r", rarityColors)}
								>
									{/* Segment Content */}
									<div
										className="absolute flex flex-col items-center justify-center"
										style={{
											top: "10%",
											left: "62.5%",
											transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
											width: "80px",
											height: "80px",
										}}
									>
										{/* Icon */}
										<div className="mb-1 text-2xl">{reward.icon || "🎁"}</div>

										{/* Name */}
										<div
											className={cn(
												"text-center font-bold text-xs leading-tight",
												textColor,
											)}
										>
											{reward.name.split(" ").map((word, i) => (
												<div key={`${reward.id}-word-${i}`}>{word}</div>
											))}
										</div>
									</div>
								</div>
							</div>
						);
					})}

					{/* Center Circle */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-500 bg-gradient-to-br from-slate-600 to-slate-800 shadow-lg">
							<div className="text-2xl">🎯</div>
						</div>
					</div>
				</div>

				{/* Pointer */}
				<div className="-translate-x-1/2 -translate-y-2 absolute top-0 left-1/2 z-10 transform">
					<div className="h-0 w-0 border-r-4 border-r-transparent border-b-8 border-b-red-500 border-l-4 border-l-transparent drop-shadow-lg" />
				</div>

				{/* Outer Ring */}
				<div className="pointer-events-none absolute inset-0 animate-pulse rounded-full border-4 border-amber-400 opacity-50" />
			</div>

			{/* Spinning Effect Overlay */}
			{isAnimating && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-96 w-96 animate-spin rounded-full border-4 border-amber-400 opacity-30" />
				</div>
			)}
		</div>
	);
}

export default RouletteWheel;
