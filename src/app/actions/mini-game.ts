"use server";

import {
	calculateRewards,
	checkMiniGameStatus,
	type MiniGameResult,
	saveMiniGameResult,
} from "@/lib/mini-game/mini-game-service";
import { createClient } from "@/lib/supabase/server";
import { checkAndUpdateAchievements } from "./achievement";
import { grantActivityExperience } from "./user-level";

export interface MiniGameStatus {
	canPlay: boolean;
	lastPlayedAt: string | null;
	todayScore: number | null;
}

export async function getMiniGameStatus(): Promise<MiniGameStatus> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return checkMiniGameStatus(user.id);
}

export interface ExtendedMiniGameResult extends MiniGameResult {
	experience?: {
		gained: number;
		total: number;
	};
	levelUp?: {
		previousLevel: number;
		currentLevel: number;
		rewards: Array<{
			level: number;
			rewardType: "item" | "achievement" | "unlock";
			rewardName: string;
			rewardDescription?: string;
		}>;
	};
	newAchievements?: Array<{
		id: string;
		name: string;
		description: string;
		points: number;
		category: string;
	}>;
}

export async function submitMiniGameResult(
	score: number,
	rounds: number,
	averageReactionTime: number,
): Promise<ExtendedMiniGameResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	// ゲームステータスを再確認
	const status = await checkMiniGameStatus(user.id);
	if (!status.canPlay) {
		throw new Error("You have already played the mini game today!");
	}

	// 報酬を計算
	const rewards = calculateRewards(score, rounds);
	const rank =
		score / rounds >= 900
			? "S"
			: score / rounds >= 800
				? "A"
				: score / rounds >= 700
					? "B"
					: score / rounds >= 600
						? "C"
						: score / rounds >= 500
							? "D"
							: "F";

	const result: MiniGameResult = {
		score,
		rank,
		averageReactionTime,
		rewards,
	};

	// 結果を保存
	await saveMiniGameResult(user.id, result);

	// ミニゲーム完了に対して経験値を付与
	const expResult = await grantActivityExperience("miniGame", {
		miniGameScore: score,
	});

	// 実績をチェック
	const achievementResult = await checkAndUpdateAchievements(user.id);

	return {
		...result,
		experience: expResult.experience,
		levelUp: expResult.levelUp,
		newAchievements: achievementResult.newlyUnlocked,
	};
}
