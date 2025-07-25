import { z } from "zod";

export const UserAchievementSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	achievementId: z.string().uuid(),
	achievedAt: z.date().nullable(), // 未達成の場合はnull
	progress: z.number().int().min(0), // 現在の進捗
	notified: z.boolean(), // 通知済みかどうか
});

export const NewUserAchievementSchema = UserAchievementSchema.omit({
	id: true,
	achievedAt: true,
}).partial({
	progress: true,
	notified: true,
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;
export type NewUserAchievement = z.infer<typeof NewUserAchievementSchema>;
