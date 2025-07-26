import { z } from "zod";

export const RankingUserSchema = z.object({
	userId: z.string(),
	name: z.string(),
	avatarUrl: z.string().nullable(),
	score: z.number(),
	rank: z.number(),
});

export type RankingUser = z.infer<typeof RankingUserSchema>;

export const RankingTypeSchema = z.enum([
	"level",
	"loginStreak",
	"miniGameScore",
	"totalPoints",
]);

export type RankingType = z.infer<typeof RankingTypeSchema>;

export const RankingDataSchema = z.object({
	type: RankingTypeSchema,
	users: z.array(RankingUserSchema),
	currentUserRank: z.number().nullable(),
	updatedAt: z.string(),
});

export type RankingData = z.infer<typeof RankingDataSchema>;
