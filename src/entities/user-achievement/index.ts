import { z } from "zod";

export const UserAchievementSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	achievementId: z.string().uuid(),
	achievedAt: z.date(),
});

export const NewUserAchievementSchema = UserAchievementSchema.omit({
	id: true,
	achievedAt: true,
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;
export type NewUserAchievement = z.infer<typeof NewUserAchievementSchema>;
