import type { LoginStreak } from "@/entities/login-streak";

export interface StreakCalculationResult {
	newStreak: number;
	isNewDay: boolean;
	streakBroken: boolean;
	bonusMultiplier: number;
}

/**
 * ログインストリークを計算する
 */
export function calculateLoginStreak(
	currentStreak: LoginStreak | null,
	loginDate: string, // YYYY-MM-DD format
): StreakCalculationResult {
	const today = new Date(loginDate);

	// 初回ログインの場合
	if (!currentStreak || !currentStreak.lastLoginDate) {
		return {
			newStreak: 1,
			isNewDay: true,
			streakBroken: false,
			bonusMultiplier: 1,
		};
	}

	const lastLogin = new Date(currentStreak.lastLoginDate);
	const daysDiff = Math.floor(
		(today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
	);

	// 同日ログインの場合
	if (daysDiff === 0) {
		return {
			newStreak: currentStreak.currentStreak,
			isNewDay: false,
			streakBroken: false,
			bonusMultiplier: getStreakBonusMultiplier(currentStreak.currentStreak),
		};
	}

	// 連続ログイン（1日後）
	if (daysDiff === 1) {
		const newStreak = currentStreak.currentStreak + 1;
		return {
			newStreak,
			isNewDay: true,
			streakBroken: false,
			bonusMultiplier: getStreakBonusMultiplier(newStreak),
		};
	}

	// ストリーク途切れ（2日以上空いた）
	return {
		newStreak: 1,
		isNewDay: true,
		streakBroken: true,
		bonusMultiplier: 1,
	};
}

/**
 * ストリーク日数に応じたボーナス倍率を取得
 */
export function getStreakBonusMultiplier(streakDays: number): number {
	if (streakDays >= 30) return 3.0; // 30日以上: 3倍
	if (streakDays >= 14) return 2.5; // 14日以上: 2.5倍
	if (streakDays >= 7) return 2.0; // 7日以上: 2倍
	if (streakDays >= 3) return 1.5; // 3日以上: 1.5倍
	return 1.0; // 1-2日: 等倍
}

/**
 * ストリーク日数に応じた連続ログインボーナスを計算
 */
export function calculateLoginBonus(streakDays: number): {
	coins: number;
	exp: number;
	specialReward?: {
		itemId: string;
		rarity: "common" | "rare" | "epic" | "legendary";
	};
} {
	const baseCoins = 100;
	const baseExp = 50;
	const multiplier = getStreakBonusMultiplier(streakDays);

	const bonus = {
		coins: Math.floor(baseCoins * multiplier),
		exp: Math.floor(baseExp * multiplier),
	};

	// 特別報酬（特定の日数で付与）
	if (streakDays === 7) {
		return {
			...bonus,
			specialReward: {
				itemId: "weekly-chest",
				rarity: "rare",
			},
		};
	}

	if (streakDays === 30) {
		return {
			...bonus,
			specialReward: {
				itemId: "monthly-chest",
				rarity: "legendary",
			},
		};
	}

	if (streakDays % 10 === 0 && streakDays >= 10) {
		return {
			...bonus,
			specialReward: {
				itemId: "milestone-chest",
				rarity: "epic",
			},
		};
	}

	return bonus;
}

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export function getTodayString(): string {
	return new Date().toISOString().split("T")[0];
}
