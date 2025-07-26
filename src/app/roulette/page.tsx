"use client";

import { Clock, Dices, Gift, Loader2, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getRouletteStatus, spinRouletteAction } from "@/app/actions/roulette";
import { AchievementNotification } from "@/components/features/achievement/AchievementNotification";
import { LevelUpEffect } from "@/components/features/level-up/LevelUpEffect";
import { RouletteResultModal } from "@/components/features/roulette/RouletteResultModal";
import { RouletteWheel } from "@/components/features/roulette/RouletteWheel";
import { GameButton } from "@/components/shared/GameButton";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RewardItem } from "@/components/shared/RewardItem";
import { RPGCard } from "@/components/shared/RpgCard";
import type { Achievement } from "@/entities/achievement";
import { useErrorHandler } from "@/hooks/use-error-handler";
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
	newAchievements?: Achievement[];
}

type SpinRouletteActionResult = {
	success: boolean;
	error?: string;
	result?: import("@/lib/roulette/roulette-engine").RouletteResult;
	alreadyPlayed?: boolean;
	experience?:
		| {
				gained: number;
				total: number;
		  }
		| undefined;
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
		| undefined;
	newAchievements?: Achievement[];
};

export default function RoulettePage() {
	const [status, setStatus] = useState<RouletteStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [spinning, setSpinning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showResultModal, setShowResultModal] = useState(false);
	const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
	const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);
	const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

	const { handleAsyncError } = useErrorHandler();
	const rewards = sortRewardsByAngle(DEFAULT_ROULETTE_REWARDS);

	const fetchStatus = useCallback(async () => {
		setLoading(true);
		setError(null);

		const result = await handleAsyncError(
			async () => {
				const res = await getRouletteStatus();
				if (!res.success) {
					throw new Error(
						res.error || "ルーレットの状態を取得できませんでした",
					);
				}
				return res;
			},
			{
				showToast: false,
				fallbackMessage: "ルーレットの状態を取得できませんでした",
			},
		);

		if (result?.success && result.data) {
			setStatus(result.data);
		} else {
			setError("ルーレットの状態を取得できませんでした");
		}

		setLoading(false);
	}, [handleAsyncError]);

	const handleSpin = async () => {
		if (!status?.canPlay || spinning) return;

		try {
			setSpinning(true);
			setError(null);

			const result = (await spinRouletteAction()) as SpinRouletteActionResult;

			if (result.success && result.result) {
				setSpinResult({
					reward: result.result.reward,
					spinAngle: result.result.spinAngle,
					spinDuration: result.result.spinDuration,
					levelUp: result.levelUp,
					newAchievements: result.newAchievements,
				});
			} else if (result.alreadyPlayed) {
				setError("今日は既にルーレットを実行済みです");
				setSpinning(false);
				await fetchStatus();
			} else {
				setError(result.error || "ルーレットの実行に失敗しました");
				setSpinning(false);
			}
		} catch (err) {
			setError("ルーレット実行中に予期しないエラーが発生しました");
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
			// 新しい実績がある場合は通知を表示
			if (spinResult.newAchievements && spinResult.newAchievements.length > 0) {
				setTimeout(() => {
					setNewAchievements(spinResult.newAchievements || []);
				}, 1000);
			}
		}
		fetchStatus();
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
					<p className="text-slate-300">ルーレットを読み込んでいます...</p>
				</RPGCard>
			</div>
		);
	}

	if (error && !status) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
				<RPGCard className="max-w-md text-center">
					<h2 className="mb-4 font-bold text-red-300 text-xl">エラー</h2>
					<p className="mb-4 text-red-200">{error}</p>
					<GameButton onClick={fetchStatus} variant="secondary">
						再試行
					</GameButton>
				</RPGCard>
			</div>
		);
	}

	// ルーレットのレアリティ別統計を計算
	const rarityStats = rewards.reduce(
		(acc, reward) => {
			acc[reward.rarity] = (acc[reward.rarity] || 0) + reward.probability;
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				{/* ヘッダー */}
				<div className="mb-6 text-center sm:mb-8">
					<h1 className="mb-2 flex flex-col items-center gap-2 font-bold text-3xl text-white sm:flex-row sm:justify-center sm:gap-3 sm:text-4xl">
						<Dices className="h-8 w-8 text-amber-400 sm:h-10 sm:w-10" />
						<span>デイリールーレット</span>
						<Dices className="hidden text-amber-400 sm:block sm:h-10 sm:w-10" />
					</h1>
					<p className="text-slate-400 text-sm sm:text-base">
						1日1回、運命の輪を回して豪華報酬をゲット！
					</p>
				</div>

				{/* エラーメッセージ */}
				{error && (
					<div className="mb-6">
						<RPGCard className="border-red-500 bg-red-900/20">
							<div className="text-center text-red-300">
								<p className="font-medium">{error}</p>
							</div>
						</RPGCard>
					</div>
				)}

				{/* メインゲームエリア */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
					{/* ルーレットホイール */}
					<div className="lg:col-span-2">
						<RPGCard className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-center">
							<div className="mb-4">
								<h2 className="font-bold text-amber-400 text-xl sm:text-2xl">
									運命の輪
								</h2>
								<p className="text-slate-400 text-xs sm:text-sm">
									何が出るかはお楽しみ！
								</p>
							</div>

							<RouletteWheel
								rewards={rewards}
								isSpinning={spinning}
								spinAngle={spinResult?.spinAngle}
								spinDuration={spinResult?.spinDuration}
								onSpinComplete={handleSpinComplete}
								className="mb-6"
							/>

							{/* スピンボタン */}
							<div className="space-y-4">
								{status?.alreadyPlayed ? (
									<div className="space-y-3">
										<div className="flex items-center justify-center gap-2 text-green-400">
											<Star className="h-5 w-5" />
											<span className="font-medium">本日は実行済みです！</span>
										</div>
										<GameButton
											variant="secondary"
											size="lg"
											disabled
											icon={<Clock />}
										>
											明日また挑戦しよう
										</GameButton>
										<p className="text-slate-500 text-sm">
											毎日0時にリセットされます
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<GameButton
											variant="legendary"
											size="lg"
											onClick={handleSpin}
											disabled={spinning || !status?.canPlay}
											loading={spinning}
											className="w-full max-w-xs"
										>
											{spinning ? (
												<>
													<Loader2 className="mr-2 h-5 w-5 animate-spin" />
													回転中...
												</>
											) : (
												<>
													<Sparkles className="mr-2 h-5 w-5" />
													ルーレットを回す！
												</>
											)}
										</GameButton>
										{!spinning && (
											<p className="text-amber-400/80 text-sm">
												✨ 1日1回の大チャンス！
											</p>
										)}
									</div>
								)}
							</div>
						</RPGCard>
					</div>

					{/* 報酬情報 */}
					<div className="space-y-6">
						{/* レアリティ統計 */}
						<RPGCard>
							<h3 className="mb-4 flex items-center gap-2 font-bold text-lg text-white">
								<Gift className="h-5 w-5 text-amber-400" />
								報酬レアリティ
							</h3>
							<div className="space-y-3">
								{Object.entries(rarityStats)
									.sort(([a], [b]) => {
										const order = ["legendary", "epic", "rare", "common"];
										return order.indexOf(a) - order.indexOf(b);
									})
									.map(([rarity, probability]) => (
										<div key={rarity}>
											<div className="mb-1 flex items-center justify-between">
												<RewardItem
													name={`${rarity} アイテム`}
													rarity={
														rarity as "common" | "rare" | "epic" | "legendary"
													}
													quantity={1}
													className="h-8 w-8"
												/>
												<span className="text-slate-400 text-sm">
													{probability}%
												</span>
											</div>
											<ProgressBar
												value={probability}
												max={100}
												variant={
													rarity === "legendary"
														? "exp"
														: rarity === "epic"
															? "mana"
															: rarity === "rare"
																? "health"
																: "default"
												}
												showText={false}
												className="h-2"
											/>
										</div>
									))}
							</div>
						</RPGCard>

						{/* 獲得可能な報酬 */}
						<RPGCard>
							<h3 className="mb-4 flex items-center gap-2 font-bold text-lg text-white">
								<Star className="h-5 w-5 text-amber-400" />
								獲得可能な報酬
							</h3>
							<div className="max-h-64 space-y-2 overflow-y-auto">
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
										<div
											className="h-6 w-6 rounded border"
											style={{
												backgroundImage: `linear-gradient(to bottom right, ${
													reward.rarity === "legendary"
														? "#f59e0b, #d97706"
														: reward.rarity === "epic"
															? "#a855f7, #9333ea"
															: reward.rarity === "rare"
																? "#3b82f6, #2563eb"
																: "#64748b, #475569"
												})`,
												borderColor:
													reward.rarity === "legendary"
														? "#fbbf24"
														: reward.rarity === "epic"
															? "#c084fc"
															: reward.rarity === "rare"
																? "#60a5fa"
																: "#94a3b8",
											}}
										/>
									</div>
								))}
							</div>
						</RPGCard>

						{/* 遊び方 */}
						<RPGCard className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-800/20">
							<h3 className="mb-4 font-bold text-blue-400 text-lg">遊び方</h3>
							<div className="space-y-2 text-slate-300 text-sm">
								<p>📌 1日1回ルーレットを回せます</p>
								<p>⭐ レア度が高いほど出現率は低い</p>
								<p>🎁 獲得した報酬は自動でインベントリに追加</p>
								<p>🏆 レベルアップや実績解除も！</p>
								<p>🔄 毎日0時にリセットされます</p>
							</div>
						</RPGCard>
					</div>
				</div>

				{/* 結果モーダル */}
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

				{/* レベルアップエフェクト */}
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

				{/* 実績通知 */}
				{newAchievements.length > 0 && (
					<AchievementNotification
						achievements={newAchievements}
						onClose={() => setNewAchievements([])}
					/>
				)}
			</div>
		</div>
	);
}
