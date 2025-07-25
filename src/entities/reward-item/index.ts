import { z } from "zod";

export const RewardItemRaritySchema = z.enum([
	"common",
	"rare",
	"epic",
	"legendary",
]);
export const RewardItemTypeSchema = z.enum([
	"coin",
	"gem",
	"boost",
	"cosmetic",
]);

export const RewardItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	description: z.string().nullable(),
	rarity: RewardItemRaritySchema,
	iconUrl: z.string().url().nullable(),
	itemType: RewardItemTypeSchema,
	value: z.number().int().min(1),
	isActive: z.boolean(),
	createdAt: z.date(),
});

export const NewRewardItemSchema = RewardItemSchema.omit({
	id: true,
	createdAt: true,
}).partial({
	description: true,
	rarity: true,
	iconUrl: true,
	itemType: true,
	value: true,
	isActive: true,
});

export type RewardItemRarity = z.infer<typeof RewardItemRaritySchema>;
export type RewardItemType = z.infer<typeof RewardItemTypeSchema>;
export type RewardItem = z.infer<typeof RewardItemSchema>;
export type NewRewardItem = z.infer<typeof NewRewardItemSchema>;
