import { z } from "zod";

export const LoginStreakSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	currentStreak: z.number().int().min(0),
	longestStreak: z.number().int().min(0),
	lastLoginDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.nullable(),
	totalLoginDays: z.number().int().min(0),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const NewLoginStreakSchema = LoginStreakSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial({
	currentStreak: true,
	longestStreak: true,
	lastLoginDate: true,
	totalLoginDays: true,
});

export type LoginStreak = z.infer<typeof LoginStreakSchema>;
export type NewLoginStreak = z.infer<typeof NewLoginStreakSchema>;
