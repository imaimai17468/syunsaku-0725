import type {
	Achievement,
	AchievementConditionType,
} from "@/entities/achievement";

export interface UserStats {
	loginStreak: number;
	totalLogins: number;
	roulettePlays: number;
	rouletteLegendaryWins: number;
	miniGamePlays: number;
	miniGameHighScore: number;
	miniGamePerfectScores: number;
	itemsCollected: number;
	itemsCollectedByRarity: {
		common: number;
		rare: number;
		epic: number;
		legendary: number;
	};
	currentLevel: number;
	totalExp: number;
}

export interface AchievementCheckResult {
	achievementId: string;
	isUnlocked: boolean;
	progress: number;
	maxProgress: number;
}

export const checkAchievementProgress = (
	achievement: Achievement,
	userStats: UserStats,
): AchievementCheckResult => {
	const { conditionType, conditionValue, conditionSubValue } = achievement;
	let currentProgress = 0;
	const maxProgress = conditionValue;
	let isUnlocked = false;

	switch (conditionType) {
		case "login_streak":
			currentProgress = userStats.loginStreak;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "total_logins":
			currentProgress = userStats.totalLogins;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "roulette_plays":
			currentProgress = userStats.roulettePlays;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "roulette_legendary":
			currentProgress = userStats.rouletteLegendaryWins;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "mini_game_score":
			currentProgress = userStats.miniGameHighScore;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "mini_game_plays":
			currentProgress = userStats.miniGamePlays;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "mini_game_perfect":
			currentProgress = userStats.miniGamePerfectScores;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "items_collected":
			currentProgress = userStats.itemsCollected;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "items_collected_rarity":
			if (conditionSubValue) {
				const rarity =
					conditionSubValue as keyof typeof userStats.itemsCollectedByRarity;
				currentProgress = userStats.itemsCollectedByRarity[rarity] || 0;
				isUnlocked = currentProgress >= conditionValue;
			}
			break;

		case "level_reached":
			currentProgress = userStats.currentLevel;
			isUnlocked = currentProgress >= conditionValue;
			break;

		case "exp_earned":
			currentProgress = userStats.totalExp;
			isUnlocked = currentProgress >= conditionValue;
			break;
	}

	return {
		achievementId: achievement.id,
		isUnlocked,
		progress: Math.min(currentProgress, maxProgress),
		maxProgress,
	};
};

export const getAchievementsByCategory = (
	achievements: Achievement[],
	category: Achievement["category"],
): Achievement[] => {
	return achievements
		.filter((achievement) => achievement.category === category)
		.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const calculateAchievementPoints = (
	achievements: Achievement[],
	unlockedAchievementIds: string[],
): number => {
	return achievements
		.filter((achievement) => unlockedAchievementIds.includes(achievement.id))
		.reduce((total, achievement) => total + achievement.points, 0);
};

// 実績の進捗率を計算
export const calculateProgressPercentage = (
	progress: number,
	maxProgress: number,
): number => {
	if (maxProgress === 0) return 0;
	return Math.min(Math.round((progress / maxProgress) * 100), 100);
};

// 実績のアイコンを取得（デフォルトアイコンも提供）
export const getAchievementIcon = (
	achievement: Achievement,
): { icon: string; isDefault: boolean } => {
	if (achievement.iconUrl) {
		return { icon: achievement.iconUrl, isDefault: false };
	}

	// カテゴリーに基づいたデフォルトアイコン
	const defaultIcons: Record<Achievement["category"], string> = {
		login: "🗓️",
		game: "🎮",
		collection: "📦",
		level: "⭐",
		special: "🏆",
	};

	return {
		icon: defaultIcons[achievement.category] || "🏅",
		isDefault: true,
	};
};

// マイルストーン実績かどうかを判定
export const isMilestoneAchievement = (achievement: Achievement): boolean => {
	// 特定の条件値がマイルストーンとみなされる
	const milestoneValues = [10, 25, 50, 100, 250, 500, 1000];
	return milestoneValues.includes(achievement.conditionValue);
};

// 次の実績までの必要数を計算
export const getNextAchievementTarget = (
	achievements: Achievement[],
	conditionType: AchievementConditionType,
	currentValue: number,
): { nextTarget: number; achievement: Achievement | null } => {
	const relevantAchievements = achievements
		.filter((a) => a.conditionType === conditionType && a.isActive)
		.filter((a) => a.conditionValue > currentValue)
		.sort((a, b) => a.conditionValue - b.conditionValue);

	if (relevantAchievements.length === 0) {
		return { nextTarget: 0, achievement: null };
	}

	const nextAchievement = relevantAchievements[0];
	return {
		nextTarget: nextAchievement.conditionValue - currentValue,
		achievement: nextAchievement,
	};
};
