import { z } from "zod";

export const DailyActivitySchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	loginCount: z.number().int().min(1),
	rouletteCompleted: z.boolean(),
	miniGameCompleted: z.boolean(),
	miniGameScore: z.number().int().min(0),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const NewDailyActivitySchema = DailyActivitySchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial({
	loginCount: true,
	rouletteCompleted: true,
	miniGameCompleted: true,
	miniGameScore: true,
});

export type DailyActivity = z.infer<typeof DailyActivitySchema>;
export type NewDailyActivity = z.infer<typeof NewDailyActivitySchema>;
