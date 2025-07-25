import { z } from "zod";

export const UserLevelSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	currentLevel: z.number().int().min(1),
	currentExp: z.number().int().min(0),
	totalExp: z.number().int().min(0),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const NewUserLevelSchema = UserLevelSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial({
	currentLevel: true,
	currentExp: true,
	totalExp: true,
});

export type UserLevel = z.infer<typeof UserLevelSchema>;
export type NewUserLevel = z.infer<typeof NewUserLevelSchema>;
