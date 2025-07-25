import type { UserLevel } from "@/entities/user-level";

export type ExperienceReward = {
	activityType: "login" | "roulette" | "miniGame" | "achievement";
	baseExp: number;
	bonus?: number;
	description?: string;
};

export type LevelUpReward = {
	level: number;
	rewardType: "item" | "achievement" | "unlock";
	rewardId?: string;
	rewardName: string;
	rewardDescription?: string;
};

const LEVEL_THRESHOLDS = {
	expPerLevel: 100,
	maxLevel: 100,
	bonusExpMultiplier: {
		miniGamePerfect: 2.0,
		miniGameGood: 1.5,
		streakBonus: 1.2,
	},
};

export const calculateRequiredExp = (level: number): number => {
	return LEVEL_THRESHOLDS.expPerLevel * level;
};

export const calculateTotalRequiredExp = (level: number): number => {
	return (level * (level - 1) * LEVEL_THRESHOLDS.expPerLevel) / 2;
};

export const calculateLevelProgress = (
	currentExp: number,
	currentLevel: number,
): { percentage: number; current: number; required: number } => {
	const required = calculateRequiredExp(currentLevel);
	const percentage = Math.floor((currentExp / required) * 100);

	return {
		percentage: Math.min(percentage, 100),
		current: currentExp,
		required,
	};
};

export const calculateLevelFromTotalExp = (
	totalExp: number,
): {
	level: number;
	currentExp: number;
} => {
	let level = 1;
	let remainingExp = totalExp;

	while (
		remainingExp >= calculateRequiredExp(level) &&
		level < LEVEL_THRESHOLDS.maxLevel
	) {
		remainingExp -= calculateRequiredExp(level);
		level++;
	}

	return {
		level,
		currentExp: remainingExp,
	};
};

export const getActivityExperience = (
	activityType: ExperienceReward["activityType"],
	context?: {
		miniGameScore?: number;
		loginStreak?: number;
		achievementId?: string;
	},
): ExperienceReward => {
	switch (activityType) {
		case "login": {
			const baseExp = 10;
			const streakBonus =
				context?.loginStreak && context.loginStreak > 0
					? Math.min(context.loginStreak * 2, 20)
					: 0;
			return {
				activityType,
				baseExp,
				bonus: streakBonus,
				description:
					streakBonus > 0 && context?.loginStreak
						? `${context.loginStreak}日連続ログインボーナス`
						: undefined,
			};
		}
		case "roulette":
			return {
				activityType,
				baseExp: 20,
				description: "デイリールーレット完了",
			};
		case "miniGame": {
			const baseExp = 15;
			let bonus = 0;
			let description = "ミニゲーム完了";

			if (context?.miniGameScore) {
				if (context.miniGameScore >= 1000) {
					bonus =
						baseExp * (LEVEL_THRESHOLDS.bonusExpMultiplier.miniGamePerfect - 1);
					description = "パーフェクトスコア！";
				} else if (context.miniGameScore >= 700) {
					bonus =
						baseExp * (LEVEL_THRESHOLDS.bonusExpMultiplier.miniGameGood - 1);
					description = "高スコア達成！";
				}
			}

			return {
				activityType,
				baseExp,
				bonus,
				description,
			};
		}
		case "achievement":
			return {
				activityType,
				baseExp: 50,
				description: "実績達成",
			};
		default:
			return {
				activityType: "login",
				baseExp: 0,
			};
	}
};

export const getLevelUpRewards = (newLevel: number): LevelUpReward[] => {
	const rewards: LevelUpReward[] = [];

	if (newLevel % 5 === 0) {
		rewards.push({
			level: newLevel,
			rewardType: "item",
			rewardName: "レアアイテムパック",
			rewardDescription: "レア以上のアイテムが確定で入手できます",
		});
	}

	if (newLevel % 10 === 0) {
		rewards.push({
			level: newLevel,
			rewardType: "achievement",
			rewardName: `レベル${newLevel}到達`,
			rewardDescription: `レベル${newLevel}に到達しました！`,
		});
	}

	if (newLevel === 25) {
		rewards.push({
			level: newLevel,
			rewardType: "unlock",
			rewardName: "特別ミニゲーム解放",
			rewardDescription: "新しいミニゲームがプレイ可能になりました",
		});
	}

	if (newLevel === 50) {
		rewards.push({
			level: newLevel,
			rewardType: "item",
			rewardName: "レジェンダリーアイテム",
			rewardDescription: "最高レアリティのアイテムを獲得！",
		});
	}

	return rewards;
};

export const formatLevelInfo = (
	userLevel: UserLevel,
): {
	displayLevel: string;
	progressText: string;
	nextLevelExp: number;
	totalExpToNextLevel: number;
} => {
	const progress = calculateLevelProgress(
		userLevel.currentExp,
		userLevel.currentLevel,
	);
	const nextLevelExp = progress.required - progress.current;

	return {
		displayLevel: `Lv.${userLevel.currentLevel}`,
		progressText: `${progress.current} / ${progress.required} EXP`,
		nextLevelExp,
		totalExpToNextLevel: progress.required,
	};
};
