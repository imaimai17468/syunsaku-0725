import { z } from "zod";

export const AchievementConditionTypeSchema = z.enum([
	"login_streak",
	"total_logins",
	"roulette_wins",
	"mini_game_score",
	"items_collected",
	"level_reached",
]);

export const AchievementSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	description: z.string().nullable(),
	iconUrl: z.string().url().nullable(),
	conditionType: AchievementConditionTypeSchema,
	conditionValue: z.number().int().min(1),
	rewardExp: z.number().int().min(0),
	isActive: z.boolean(),
	createdAt: z.date(),
});

export const NewAchievementSchema = AchievementSchema.omit({
	id: true,
	createdAt: true,
}).partial({
	description: true,
	iconUrl: true,
	rewardExp: true,
	isActive: true,
});

export type AchievementConditionType = z.infer<
	typeof AchievementConditionTypeSchema
>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type NewAchievement = z.infer<typeof NewAchievementSchema>;
