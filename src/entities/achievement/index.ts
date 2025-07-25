import { z } from "zod";

export const AchievementCategorySchema = z.enum([
	"login",
	"game",
	"collection",
	"level",
	"special",
]);

export const AchievementConditionTypeSchema = z.enum([
	"login_streak",
	"total_logins",
	"roulette_plays",
	"roulette_legendary",
	"mini_game_score",
	"mini_game_plays",
	"mini_game_perfect",
	"items_collected",
	"items_collected_rarity",
	"level_reached",
	"exp_earned",
]);

export const AchievementSchema = z.object({
	id: z.string().uuid(),
	category: AchievementCategorySchema,
	name: z.string().min(1),
	description: z.string(),
	iconUrl: z.string().url().nullable(),
	conditionType: AchievementConditionTypeSchema,
	conditionValue: z.number().int().min(1),
	conditionSubValue: z.string().nullable(), // レアリティなどの追加条件
	rewardExp: z.number().int().min(0),
	points: z.number().int().min(0),
	sortOrder: z.number().int(),
	isActive: z.boolean(),
	createdAt: z.date(),
});

export const NewAchievementSchema = AchievementSchema.omit({
	id: true,
	createdAt: true,
}).partial({
	iconUrl: true,
	conditionSubValue: true,
	rewardExp: true,
	points: true,
	sortOrder: true,
	isActive: true,
});

export type AchievementCategory = z.infer<typeof AchievementCategorySchema>;
export type AchievementConditionType = z.infer<
	typeof AchievementConditionTypeSchema
>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type NewAchievement = z.infer<typeof NewAchievementSchema>;
