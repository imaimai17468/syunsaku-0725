import { soundEffects } from "./sound-effects";
import {
	showAchievementToast,
	showItemToast,
	showLevelUpToast,
	showRewardToast,
	showStreakToast,
} from "./toast-styles";

export { type SoundEffectType, soundEffects } from "./sound-effects";
export {
	showAchievementToast,
	showItemToast,
	showLevelUpToast,
	showRewardToast,
	showStreakToast,
} from "./toast-styles";

interface NotifyOptions {
	icon?: string;
	duration?: number;
}

export const notifyReward = async (
	message: string,
	options?: NotifyOptions,
) => {
	await soundEffects.play("reward");
	showRewardToast(message, options);
};

export const notifyLevelUp = async (level: number, options?: NotifyOptions) => {
	await soundEffects.play("levelUp");
	showLevelUpToast(level, options);
};

export const notifyAchievement = async (
	title: string,
	options?: NotifyOptions,
) => {
	await soundEffects.play("achievement");
	showAchievementToast(title, options);
};

export const notifyStreak = async (streak: number, options?: NotifyOptions) => {
	await soundEffects.play("success");
	showStreakToast(streak, options);
};

export const notifyItem = async (
	itemName: string,
	rarity: "common" | "rare" | "epic" | "legendary",
	options?: NotifyOptions,
) => {
	await soundEffects.play("reward");
	showItemToast(itemName, rarity, options);
};
