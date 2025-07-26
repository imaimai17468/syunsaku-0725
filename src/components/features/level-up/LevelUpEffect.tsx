"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { soundEffects } from "@/lib/notifications";
import type { LevelUpReward } from "@/lib/user-level/level-service";

interface LevelUpEffectProps {
	isOpen: boolean;
	onClose: () => void;
	previousLevel: number;
	currentLevel: number;
	rewards: LevelUpReward[];
}

export function LevelUpEffect({
	isOpen,
	onClose,
	previousLevel,
	currentLevel,
	rewards,
}: LevelUpEffectProps) {
	const [showRewards, setShowRewards] = useState(false);

	useEffect(() => {
		if (isOpen) {
			soundEffects.play("levelUp");
			const timer = setTimeout(() => {
				setShowRewards(true);
			}, 1500);
			return () => clearTimeout(timer);
		}
		setShowRewards(false);
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md overflow-hidden border-purple-500/50 bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-blue-900/90">
				<div className="relative">
					{/* Background effects */}
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute inset-0 animate-pulse bg-gradient-to-t from-transparent via-purple-500/10 to-transparent" />
						{[...Array(20)].map((_, i) => (
							<motion.div
								// biome-ignore lint/suspicious/noArrayIndexKey: Static array for animation particles
								key={`particle-${i}`}
								className="absolute h-1 w-1 rounded-full bg-yellow-400"
								initial={{
									x: Math.random() * 400 - 200,
									y: 300,
									opacity: 0,
								}}
								animate={{
									y: -100,
									opacity: [0, 1, 0],
								}}
								transition={{
									duration: 2 + Math.random() * 2,
									delay: Math.random() * 2,
									repeat: Number.POSITIVE_INFINITY,
								}}
							/>
						))}
					</div>

					{/* Main content */}
					<div className="relative z-10 py-8 text-center">
						<motion.div
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: "spring", duration: 0.8 }}
						>
							<Trophy className="mx-auto mb-4 h-24 w-24 text-yellow-400" />
						</motion.div>

						<motion.h2
							className="mb-2 font-bold text-4xl text-white"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							LEVEL UP!
						</motion.h2>

						<motion.div
							className="mb-6 flex items-center justify-center gap-4 font-bold text-2xl"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.8 }}
						>
							<span className="text-slate-300">Lv.{previousLevel}</span>
							<motion.span
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
							>
								<Star className="h-6 w-6 text-yellow-400" />
							</motion.span>
							<span className="text-yellow-400">Lv.{currentLevel}</span>
						</motion.div>

						<AnimatePresence>
							{showRewards && rewards.length > 0 && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="mb-6 space-y-3"
								>
									<h3 className="mb-2 font-semibold text-lg text-purple-300">
										レベルアップ報酬
									</h3>
									{rewards.map((reward, index) => (
										<motion.div
											key={`${reward.level}-${reward.rewardType}-${index}`}
											initial={{ opacity: 0, x: -50 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.2 }}
											className="rounded-lg border border-purple-500/50 bg-purple-800/50 p-3"
										>
											<div className="flex items-center gap-2">
												<Sparkles className="h-5 w-5 text-yellow-400" />
												<div className="text-left">
													<p className="font-semibold text-white">
														{reward.rewardName}
													</p>
													{reward.rewardDescription && (
														<p className="text-slate-300 text-sm">
															{reward.rewardDescription}
														</p>
													)}
												</div>
											</div>
										</motion.div>
									))}
								</motion.div>
							)}
						</AnimatePresence>

						<Button
							onClick={onClose}
							className="bg-purple-600 font-bold text-white hover:bg-purple-700"
						>
							素晴らしい！
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
