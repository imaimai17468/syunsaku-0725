"use server";

import { revalidatePath } from "next/cache";
import type { Achievement } from "@/entities/achievement";
import type { UserAchievement } from "@/entities/user-achievement";
import { DEFAULT_ACHIEVEMENTS } from "@/lib/achievement/achievement-data";
import {
	type AchievementCheckResult,
	checkAchievementProgress,
} from "@/lib/achievement/achievement-service";
import { collectUserStats } from "@/lib/achievement/user-stats-collector";
import { createClient } from "@/lib/supabase/server";
import { isDevelopment } from "@/utils/environment";

// 実績の一覧を取得
export async function getAchievements(): Promise<Achievement[]> {
	if (isDevelopment()) {
		// 開発環境ではデフォルトデータを返す
		return DEFAULT_ACHIEVEMENTS.map((achievement, index) => ({
			...achievement,
			id: `dev-achievement-${index}`,
			createdAt: new Date(),
		}));
	}

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("achievements")
		.select("*")
		.eq("is_active", true)
		.order("sort_order");

	if (error) {
		console.error("Error fetching achievements:", error);
		return [];
	}

	// Supabaseのデータ型をAchievement型に変換
	const achievements: Achievement[] = data.map((row) => ({
		id: row.id,
		category: "game" as const, // デフォルトカテゴリー（実際のデータベースにカテゴリーカラムがない場合）
		name: row.name,
		description: row.description || "",
		iconUrl: row.icon_url,
		conditionType: row.condition_type as Achievement["conditionType"],
		conditionValue: row.condition_value,
		conditionSubValue: null,
		points: 100, // デフォルトポイント（実際のデータベースにポイントカラムがない場合）
		rewardExp: row.reward_exp,
		rewardItemId: null,
		isActive: row.is_active,
		sortOrder: 0, // デフォルトソート順（実際のデータベースにソート順カラムがない場合）
		createdAt: new Date(row.created_at),
	}));

	return achievements;
}

// ユーザーの実績達成状況を取得
export async function getUserAchievements(
	userId: string,
): Promise<UserAchievement[]> {
	if (isDevelopment()) {
		return [];
	}

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("user_achievements")
		.select("*")
		.eq("user_id", userId);

	if (error) {
		console.error("Error fetching user achievements:", error);
		return [];
	}

	// Supabaseのデータ型をUserAchievement型に変換
	const userAchievements: UserAchievement[] = data.map((row) => ({
		id: row.id,
		userId: row.user_id,
		achievementId: row.achievement_id,
		achievedAt: row.achieved_at ? new Date(row.achieved_at) : null,
		progress: 0, // デフォルト進捗（実際のデータベースに進捗カラムがない場合）
		notified: false, // デフォルト通知フラグ（実際のデータベースに通知カラムがない場合）
	}));

	return userAchievements;
}

// 実績の進捗をチェックして更新
export async function checkAndUpdateAchievements(userId: string): Promise<{
	newlyUnlocked: Achievement[];
	updatedProgress: AchievementCheckResult[];
}> {
	const supabase = await createClient();

	// ユーザーの統計情報を収集
	const userStats = await collectUserStats(userId);

	// 全ての実績を取得
	const achievements = await getAchievements();

	// ユーザーの実績達成状況を取得
	const userAchievements = await getUserAchievements(userId);
	const unlockedAchievementIds = userAchievements
		.filter((ua) => ua.achievedAt)
		.map((ua) => ua.achievementId);

	const newlyUnlocked: Achievement[] = [];
	const updatedProgress: AchievementCheckResult[] = [];

	// 各実績の進捗をチェック
	for (const achievement of achievements) {
		// 既に解除済みの実績はスキップ
		if (unlockedAchievementIds.includes(achievement.id)) {
			continue;
		}

		const progress = checkAchievementProgress(achievement, userStats);
		updatedProgress.push(progress);

		if (progress.isUnlocked) {
			// 新しく解除された実績
			newlyUnlocked.push(achievement);

			if (!isDevelopment()) {
				// データベースに記録
				const existingProgress = userAchievements.find(
					(ua) => ua.achievementId === achievement.id,
				);

				if (existingProgress) {
					// 既存の進捗を更新
					await supabase
						.from("user_achievements")
						.update({
							achieved_at: new Date().toISOString(),
						})
						.eq("id", existingProgress.id);
				} else {
					// 新規作成
					await supabase.from("user_achievements").insert({
						user_id: userId,
						achievement_id: achievement.id,
						achieved_at: new Date().toISOString(),
					});
				}
			}
		} else {
			// 進捗のみ更新
			if (!isDevelopment()) {
				const existingProgress = userAchievements.find(
					(ua) => ua.achievementId === achievement.id,
				);

				if (
					existingProgress &&
					existingProgress.progress !== progress.progress
				) {
					// 進捗のみの更新は現在のデータベーススキーマではサポートされていない
				}
			}
		}
	}

	// 経験値を付与
	if (newlyUnlocked.length > 0 && !isDevelopment()) {
		const totalExp = newlyUnlocked.reduce(
			(sum, achievement) => sum + achievement.rewardExp,
			0,
		);

		if (totalExp > 0) {
			const { data: currentLevel } = await supabase
				.from("user_levels")
				.select("current_exp, total_exp")
				.eq("user_id", userId)
				.single();

			if (currentLevel) {
				await supabase
					.from("user_levels")
					.update({
						current_exp: currentLevel.current_exp + totalExp,
						total_exp: currentLevel.total_exp + totalExp,
					})
					.eq("user_id", userId);
			}
		}
	}

	revalidatePath("/achievements");
	revalidatePath("/profile");

	return {
		newlyUnlocked,
		updatedProgress,
	};
}

// 通知済みフラグを更新
export async function markAchievementsAsNotified(
	_userId: string,
	achievementIds: string[],
): Promise<void> {
	if (isDevelopment() || achievementIds.length === 0) {
		return;
	}

	const _supabase = await createClient();

	// notifiedカラムがデータベースに存在しないため、この機能は現在利用できません
}

// 実績の進捗情報を含めて取得
export async function getAchievementsWithProgress(userId: string): Promise<
	Array<
		Achievement & {
			userProgress?: {
				progress: number;
				achievedAt: Date | null;
				notified: boolean;
			};
		}
	>
> {
	const [achievements, userAchievements, userStats] = await Promise.all([
		getAchievements(),
		getUserAchievements(userId),
		collectUserStats(userId),
	]);

	return achievements.map((achievement) => {
		const userAchievement = userAchievements.find(
			(ua) => ua.achievementId === achievement.id,
		);

		if (userAchievement?.achievedAt) {
			// 既に達成済み
			return {
				...achievement,
				userProgress: {
					progress: userAchievement.progress,
					achievedAt: userAchievement.achievedAt,
					notified: userAchievement.notified,
				},
			};
		}

		// 未達成の場合は現在の進捗を計算
		const progress = checkAchievementProgress(achievement, userStats);
		return {
			...achievement,
			userProgress: {
				progress: progress.progress,
				achievedAt: null,
				notified: false,
			},
		};
	});
}
