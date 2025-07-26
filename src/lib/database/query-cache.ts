import { unstable_cache } from "next/cache";

export type CacheConfig = {
	revalidate?: number | false;
	tags?: string[];
};

const DEFAULT_CACHE_TIME = 60; // 60秒

export const createCachedQuery = <
	T extends (...args: unknown[]) => Promise<unknown>,
>(
	queryFn: T,
	keyParts: string[],
	config?: CacheConfig,
): T => {
	const { revalidate = DEFAULT_CACHE_TIME, tags = [] } = config || {};

	return unstable_cache(queryFn, keyParts, {
		revalidate,
		tags,
	}) as T;
};

export const cacheKeys = {
	user: (userId: string) => ["user", userId],
	userLevel: (userId: string) => ["user-level", userId],
	loginStreak: (userId: string) => ["login-streak", userId],
	inventory: (userId: string) => ["inventory", userId],
	achievements: (userId: string) => ["achievements", userId],
	dailyActivity: (userId: string, date: string) => [
		"daily-activity",
		userId,
		date,
	],
	rewardItems: () => ["reward-items"],
};

export const cacheTags = {
	user: (userId: string) => `user:${userId}`,
	inventory: (userId: string) => `inventory:${userId}`,
	achievements: (userId: string) => `achievements:${userId}`,
	dailyRewards: (userId: string) => `daily-rewards:${userId}`,
};
