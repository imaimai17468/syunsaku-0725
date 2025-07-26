import { sql } from "drizzle-orm";
import {
	boolean,
	date,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// Supabaseで既に作成されているusersテーブルの定義
export const users = pgTable("users", {
	id: uuid("id").primaryKey(),
	name: text("name"),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ユーザーの日次活動記録
export const dailyActivities = pgTable(
	"daily_activities",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		activityDate: date("activity_date").notNull(),
		loginCount: integer("login_count").notNull().default(1),
		rouletteCompleted: boolean("roulette_completed").notNull().default(false),
		miniGameCompleted: boolean("mini_game_completed").notNull().default(false),
		miniGameScore: integer("mini_game_score").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`TIMEZONE('utc', NOW())`),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.default(sql`TIMEZONE('utc', NOW())`),
	},
	(table) => ({
		userDateUnique: unique().on(table.userId, table.activityDate),
	}),
);

export type DailyActivity = typeof dailyActivities.$inferSelect;
export type NewDailyActivity = typeof dailyActivities.$inferInsert;

// ユーザーの連続ログイン記録
export const loginStreaks = pgTable("login_streaks", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" })
		.unique(),
	currentStreak: integer("current_streak").notNull().default(0),
	longestStreak: integer("longest_streak").notNull().default(0),
	lastLoginDate: date("last_login_date"),
	totalLoginDays: integer("total_login_days").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
});

export type LoginStreak = typeof loginStreaks.$inferSelect;
export type NewLoginStreak = typeof loginStreaks.$inferInsert;

// 特典アイテムマスター
export const rewardItems = pgTable("reward_items", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	description: text("description"),
	rarity: text("rarity", { enum: ["common", "rare", "epic", "legendary"] })
		.notNull()
		.default("common"),
	iconUrl: text("icon_url"),
	itemType: text("item_type", { enum: ["coin", "gem", "boost", "cosmetic"] })
		.notNull()
		.default("coin"),
	value: integer("value").notNull().default(1),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
});

export type RewardItem = typeof rewardItems.$inferSelect;
export type NewRewardItem = typeof rewardItems.$inferInsert;

// ユーザーのインベントリ
export const userInventory = pgTable("user_inventory", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	rewardItemId: uuid("reward_item_id")
		.notNull()
		.references(() => rewardItems.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull().default(1),
	acquiredAt: timestamp("acquired_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
	usedAt: timestamp("used_at", { withTimezone: true }),
	isUsed: boolean("is_used").notNull().default(false),
});

export type UserInventory = typeof userInventory.$inferSelect;
export type NewUserInventory = typeof userInventory.$inferInsert;

// ユーザーレベル・経験値
export const userLevels = pgTable("user_levels", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" })
		.unique(),
	currentLevel: integer("current_level").notNull().default(1),
	currentExp: integer("current_exp").notNull().default(0),
	totalExp: integer("total_exp").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
});

export type UserLevel = typeof userLevels.$inferSelect;
export type NewUserLevel = typeof userLevels.$inferInsert;

// 実績システム
export const achievements = pgTable("achievements", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	description: text("description"),
	iconUrl: text("icon_url"),
	conditionType: text("condition_type").notNull(),
	conditionValue: integer("condition_value").notNull(),
	rewardExp: integer("reward_exp").notNull().default(0),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
});

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

// ユーザー実績達成記録
export const userAchievements = pgTable("user_achievements", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	achievementId: uuid("achievement_id")
		.notNull()
		.references(() => achievements.id, { onDelete: "cascade" }),
	achievedAt: timestamp("achieved_at", { withTimezone: true })
		.notNull()
		.default(sql`TIMEZONE('utc', NOW())`),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;

// レート制限テーブル
export const rateLimits = pgTable("rate_limits", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: uuid("user_id").notNull(),
	actionType: varchar("action_type", { length: 50 }).notNull(),
	attemptCount: integer("attempt_count").default(1),
	windowStart: timestamp("window_start", { withTimezone: true }).default(
		sql`NOW()`,
	),
	createdAt: timestamp("created_at", { withTimezone: true }).default(
		sql`NOW()`,
	),
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type NewRateLimit = typeof rateLimits.$inferInsert;
