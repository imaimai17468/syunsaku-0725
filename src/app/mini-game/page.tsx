"use client";

import { Loader2, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ExtendedMiniGameResult,
	getMiniGameStatus,
	submitMiniGameResult,
} from "@/app/actions/mini-game";
import { LoginBonusModal } from "@/components/features/daily-login/LoginBonusModal";
import { LevelUpEffect } from "@/components/features/level-up/LevelUpEffect";
import { GameButton } from "@/components/shared/GameButton";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	activateTarget,
	type ClickGameData,
	calculateAverageReactionTime,
	createInitialGameData,
	getRank,
	getRankColor,
	getWaitTime,
	recordClick,
	startGame,
	startRound,
} from "@/lib/mini-game/click-game-engine";
import { soundEffects } from "@/lib/notifications";

export default function MiniGamePage() {
	const [isLoading, setIsLoading] = useState(true);
	const [canPlay, setCanPlay] = useState(false);
	const [todayScore, setTodayScore] = useState<number | null>(null);
	const [gameData, setGameData] = useState<ClickGameData>(
		createInitialGameData(),
	);
	const [showResult, setShowResult] = useState(false);
	const [gameResult, setGameResult] = useState<ExtendedMiniGameResult | null>(
		null,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);

	const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// ゲームステータスを取得
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const status = await getMiniGameStatus();
				setCanPlay(status.canPlay);
				setTodayScore(status.todayScore);
			} catch (error) {
				console.error("Error checking game status:", error);
			} finally {
				setIsLoading(false);
			}
		};
		checkStatus();
	}, []);

	// ラウンド開始処理
	const startNewRound = useCallback(() => {
		setGameData((prev) => startRound(prev));

		// ランダムな待機時間後にターゲットを表示
		const waitTime = getWaitTime();
		waitTimeoutRef.current = setTimeout(() => {
			setGameData((prev) => activateTarget(prev));
		}, waitTime);
	}, []);

	// ゲーム開始
	const handleStartGame = useCallback(() => {
		setGameData(startGame(createInitialGameData()));
		setShowResult(false);
		setGameResult(null);
		setTimeout(() => startNewRound(), 1000);
	}, [startNewRound]);

	// クリック処理
	const handleClick = useCallback(async () => {
		if (gameData.state === "waiting") {
			// 早すぎるクリック
			if (waitTimeoutRef.current) {
				clearTimeout(waitTimeoutRef.current);
			}
			alert("Too early! Wait for the target to appear.");
			setGameData(createInitialGameData());
			return;
		}

		if (gameData.state !== "active") return;

		soundEffects.play("click");
		const updatedData = recordClick(gameData);
		setGameData(updatedData);

		if (updatedData.state === "finished") {
			// ゲーム終了
			const avgReactionTime = calculateAverageReactionTime(updatedData.history);
			setIsSubmitting(true);

			try {
				const result = await submitMiniGameResult(
					updatedData.score,
					updatedData.totalRounds,
					avgReactionTime,
				);
				setGameResult(result);
				setShowResult(true);
				setCanPlay(false);
				setTodayScore(updatedData.score);

				// レベルアップエフェクトを表示
				if (result.levelUp) {
					setShowLevelUpEffect(true);
				}
			} catch (error) {
				console.error("Error submitting game result:", error);
				alert("Failed to submit game result. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		} else if (updatedData.state === "ready") {
			// 次のラウンドへ
			setTimeout(() => startNewRound(), 1500);
		}
	}, [gameData, startNewRound]);

	// クリーンアップ
	useEffect(() => {
		return () => {
			if (waitTimeoutRef.current) {
				clearTimeout(waitTimeoutRef.current);
			}
		};
	}, []);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black py-[10vh]">
			<div className="mx-auto max-w-6xl px-4">
				{/* ヒーローセクション */}
				<div className="mb-12 text-center">
					<div className="mb-6 flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl" />
							<Zap className="relative h-24 w-24 text-white" />
						</div>
					</div>
					<h1 className="mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent">
						スピードチャレンジ
					</h1>
					<p className="mx-auto max-w-2xl text-gray-400 text-lg">
						反射神経を試すミニゲームで高スコアを目指そう！
					</p>
				</div>

				{/* Game Status */}
				{!canPlay && todayScore !== null && (
					<Alert className="border-amber-600 bg-amber-900/20">
						<AlertDescription className="text-amber-200">
							You've already played today! Your score: {todayScore}
						</AlertDescription>
					</Alert>
				)}

				{/* Game Area */}
				<Card className="border-slate-600 bg-slate-800/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-white text-xl">
								{gameData.state === "idle" && "Ready to start?"}
								{gameData.state === "ready" &&
									`Round ${gameData.round} of ${gameData.totalRounds}`}
								{gameData.state === "waiting" && "Wait for it..."}
								{gameData.state === "active" && "CLICK NOW!"}
								{gameData.state === "finished" && "Game Over!"}
							</CardTitle>
							<Badge
								variant="outline"
								className="border-blue-500 text-blue-400"
							>
								Score: {gameData.score}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Game Display */}
						<button
							type="button"
							className={`relative h-64 w-full rounded-lg border-2 ${
								gameData.state === "active"
									? "cursor-pointer border-green-500 bg-green-900/20"
									: gameData.state === "waiting"
										? "border-amber-500 bg-amber-900/20"
										: "border-slate-600 bg-slate-700/50"
							} transition-all duration-200`}
							onClick={handleClick}
						>
							<div className="flex h-full items-center justify-center">
								{gameData.state === "idle" && (
									<span className="text-slate-400">
										Click "Start Game" to begin
									</span>
								)}
								{gameData.state === "ready" && (
									<span className="text-blue-400">Get ready...</span>
								)}
								{gameData.state === "waiting" && (
									<span className="animate-pulse text-amber-400 text-xl">
										Wait for the green signal...
									</span>
								)}
								{gameData.state === "active" && (
									<div className="animate-pulse">
										<Zap className="h-24 w-24 text-green-400" />
										<span className="mt-2 block font-bold text-2xl text-green-400">
											CLICK!
										</span>
									</div>
								)}
								{gameData.state === "finished" && !isSubmitting && (
									<div className="text-center">
										<span className="block text-slate-300 text-xl">
											Final Score: {gameData.score}
										</span>
										<span
											className={`mt-2 block font-bold text-4xl ${getRankColor(
												getRank(gameData.score, gameData.totalRounds),
											)}`}
										>
											Rank: {getRank(gameData.score, gameData.totalRounds)}
										</span>
									</div>
								)}
								{isSubmitting && (
									<Loader2 className="h-12 w-12 animate-spin text-blue-500" />
								)}
							</div>

							{/* Reaction Time Display */}
							{gameData.reactionTime !== null && gameData.state === "ready" && (
								<div className="absolute top-4 right-4 rounded bg-slate-800 px-3 py-1">
									<span className="text-green-400 text-sm">
										{gameData.reactionTime}ms
									</span>
								</div>
							)}
						</button>

						{/* Progress */}
						{gameData.state !== "idle" && gameData.state !== "finished" && (
							<ProgressBar
								value={gameData.round - 1}
								max={gameData.totalRounds}
								label="Progress"
								variant="exp"
							/>
						)}

						{/* Round History */}
						{gameData.history.length > 0 && (
							<div className="space-y-2">
								<h3 className="font-medium text-slate-300 text-sm">
									Reaction Times:
								</h3>
								<div className="flex gap-2">
									{gameData.history.map((time, index) => (
										<Badge
											// biome-ignore lint/suspicious/noArrayIndexKey: Order of reaction times doesn't change
											key={`reaction-time-${index}`}
											variant="outline"
											className={
												time < 200
													? "border-green-500 text-green-400"
													: time < 400
														? "border-blue-500 text-blue-400"
														: time < 600
															? "border-amber-500 text-amber-400"
															: "border-red-500 text-red-400"
											}
										>
											{time}ms
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Action Button */}
						<div className="flex justify-center">
							{gameData.state === "idle" && canPlay && (
								<GameButton
									variant="primary"
									size="lg"
									onClick={handleStartGame}
									icon={<Zap className="h-5 w-5" />}
								>
									Start Game
								</GameButton>
							)}
							{gameData.state === "finished" && !isSubmitting && canPlay && (
								<GameButton
									variant="success"
									size="lg"
									onClick={handleStartGame}
								>
									Play Again
								</GameButton>
							)}
							{!canPlay && (
								<GameButton variant="secondary" size="lg" disabled>
									Come back tomorrow!
								</GameButton>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Instructions */}
				<Card className="border-slate-600 bg-slate-800/50">
					<CardHeader>
						<CardTitle className="text-white">How to Play</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-slate-300">
						<p>1. Click "Start Game" to begin the challenge</p>
						<p>2. Wait for the green signal to appear</p>
						<p>3. Click as fast as you can when you see it!</p>
						<p>4. Complete 5 rounds to get your final score</p>
						<p className="mt-4 text-amber-400 text-sm">
							⚡ Tip: The faster you react, the higher your score!
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Result Modal */}
			{showResult && gameResult && (
				<LoginBonusModal
					isOpen={showResult}
					onClose={() => setShowResult(false)}
					rewards={gameResult.rewards}
					streakInfo={{
						currentStreak: 1,
						isNewDay: true,
						streakBroken: false,
						bonusMultiplier: 1,
					}}
				/>
			)}

			{/* Level Up Effect */}
			{showLevelUpEffect && gameResult?.levelUp && (
				<LevelUpEffect
					isOpen={showLevelUpEffect}
					onClose={() => setShowLevelUpEffect(false)}
					previousLevel={gameResult.levelUp.previousLevel}
					currentLevel={gameResult.levelUp.currentLevel}
					rewards={gameResult.levelUp.rewards}
				/>
			)}
		</div>
	);
}
