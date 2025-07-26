"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Award, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Achievement } from "@/entities/achievement";
import { soundEffects } from "@/lib/notifications";
import { cn } from "@/lib/utils";

interface AchievementNotificationProps {
	achievements: Achievement[];
	onClose?: () => void;
	autoHide?: boolean;
	autoHideDelay?: number;
}

export function AchievementNotification({
	achievements,
	onClose,
	autoHide = true,
	autoHideDelay = 5000,
}: AchievementNotificationProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);

	const currentAchievement = achievements[currentIndex];

	const handleNext = useCallback(() => {
		if (currentIndex < achievements.length - 1) {
			setCurrentIndex(currentIndex + 1);
		} else {
			setIsVisible(false);
			onClose?.();
		}
	}, [currentIndex, achievements.length, onClose]);

	useEffect(() => {
		if (currentAchievement) {
			soundEffects.play("achievement");
		}
	}, [currentAchievement]);

	useEffect(() => {
		if (autoHide && isVisible) {
			const timer = setTimeout(() => {
				handleNext();
			}, autoHideDelay);

			return () => clearTimeout(timer);
		}
	}, [autoHide, autoHideDelay, isVisible, handleNext]);

	const handleClose = () => {
		setIsVisible(false);
		onClose?.();
	};

	if (!currentAchievement) return null;

	const categoryColors = {
		login: "from-blue-500 to-blue-700",
		game: "from-purple-500 to-purple-700",
		collection: "from-amber-500 to-amber-700",
		level: "from-green-500 to-green-700",
		special: "from-red-500 to-red-700",
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: -50, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -50, scale: 0.9 }}
					className="pointer-events-auto fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
				>
					<div className="relative overflow-hidden rounded-lg border border-amber-500/50 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-sm">
						{/* 背景エフェクト */}
						<div className="pointer-events-none absolute inset-0 opacity-30">
							<div
								className={cn(
									"-right-20 -top-20 absolute h-40 w-40 rounded-full bg-gradient-to-br blur-3xl",
									categoryColors[currentAchievement.category],
								)}
							/>
						</div>

						{/* 閉じるボタン */}
						<button
							type="button"
							onClick={handleClose}
							className="absolute top-2 right-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>

						{/* コンテンツ */}
						<div className="relative">
							{/* ヘッダー */}
							<div className="mb-4 flex items-center gap-3">
								<motion.div
									initial={{ rotate: -180, scale: 0 }}
									animate={{ rotate: 0, scale: 1 }}
									transition={{ type: "spring", duration: 0.5 }}
									className={cn(
										"flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br shadow-lg",
										categoryColors[currentAchievement.category],
									)}
								>
									<Award className="h-6 w-6 text-white" />
								</motion.div>
								<div>
									<motion.h3
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.2 }}
										className="font-bold text-amber-400 text-lg"
									>
										実績達成！
									</motion.h3>
									<motion.p
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.3 }}
										className="text-slate-400 text-sm"
									>
										{achievements.length > 1 &&
											`${currentIndex + 1} / ${achievements.length}`}
									</motion.p>
								</div>
							</div>

							{/* 実績情報 */}
							<motion.div
								key={currentAchievement.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
							>
								<h4 className="mb-2 font-bold text-white text-xl">
									{currentAchievement.name}
								</h4>
								<p className="mb-4 text-slate-300">
									{currentAchievement.description}
								</p>

								{/* 報酬 */}
								<div className="flex items-center gap-4">
									{currentAchievement.rewardExp > 0 && (
										<div className="flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1">
											<span className="text-blue-400 text-sm">
												+{currentAchievement.rewardExp} EXP
											</span>
										</div>
									)}
									<div className="flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1">
										<span className="text-amber-400 text-sm">
											+{currentAchievement.points} pts
										</span>
									</div>
								</div>
							</motion.div>
						</div>

						{/* プログレスインジケーター */}
						{achievements.length > 1 && (
							<div className="mt-4 flex gap-1">
								{achievements.map((_, index) => (
									<div
										key={`indicator-${
											// biome-ignore lint/suspicious/noArrayIndexKey: 実績の順序は変わらない
											index
										}`}
										className={cn(
											"h-1 flex-1 rounded-full transition-colors",
											index === currentIndex
												? "bg-amber-500"
												: index < currentIndex
													? "bg-amber-500/50"
													: "bg-slate-700",
										)}
									/>
								))}
							</div>
						)}

						{/* 自動進行のプログレスバー */}
						{autoHide && (
							<motion.div
								className="absolute bottom-0 left-0 h-1 bg-amber-500"
								initial={{ width: "0%" }}
								animate={{ width: "100%" }}
								transition={{ duration: autoHideDelay / 1000, ease: "linear" }}
							/>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
