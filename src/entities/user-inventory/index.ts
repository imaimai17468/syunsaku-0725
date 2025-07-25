import { z } from "zod";

export const UserInventorySchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	rewardItemId: z.string().uuid(),
	quantity: z.number().int().min(1),
	acquiredAt: z.date(),
	usedAt: z.date().nullable(),
	isUsed: z.boolean(),
});

export const NewUserInventorySchema = UserInventorySchema.omit({
	id: true,
	acquiredAt: true,
}).partial({
	quantity: true,
	usedAt: true,
	isUsed: true,
});

export type UserInventory = z.infer<typeof UserInventorySchema>;
export type NewUserInventory = z.infer<typeof NewUserInventorySchema>;
