#!/usr/bin/env node
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("node:path");

// .env.localファイルを読み込む
const envPath = path.join(__dirname, "../.env.local");
console.log(`📁 環境変数を読み込み中: ${envPath}`);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`🔍 Supabase URL: ${supabaseUrl ? "設定済み" : "未設定"}`);
console.log(`🔍 Service Key: ${supabaseServiceKey ? "設定済み" : "未設定"}`);

if (!supabaseUrl || !supabaseServiceKey) {
	console.error("❌ Supabase環境変数が設定されていません");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

async function restoreAchievements() {
	console.log("🔄 既存ユーザーの実績を復元中...");

	try {
		// 全ユーザーを取得
		const { data: users, error: usersError } = await supabase
			.from("users")
			.select("id");

		if (usersError) throw usersError;

		console.log(`👥 ${users.length}人のユーザーを処理します`);

		for (const user of users) {
			console.log(`\n📊 ユーザー ${user.id} の実績を計算中...`);

			// ユーザーの統計情報を収集
			const stats = await collectUserStats(user.id);

			// 実績をチェック
			await checkAndRestoreAchievements(user.id, stats);
		}

		console.log("\n✅ 実績の復元が完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
		process.exit(1);
	}
}

async function collectUserStats(userId) {
	const stats = {
		loginDays: 0,
		consecutiveLoginDays: 0,
		rouletteSpins: 0,
		miniGamesPlayed: 0,
		miniGameHighScore: 0,
		totalExp: 0,
		currentLevel: 1,
		itemsCollected: 0,
		rareItemsCollected: 0,
	};

	// ログイン統計
	const { data: loginStreak } = await supabase
		.from("login_streaks")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (loginStreak) {
		stats.loginDays = loginStreak.total_login_days || 0;
		stats.consecutiveLoginDays = loginStreak.current_streak || 0;
	}

	// ルーレット回数
	const { data: rouletteActivities } = await supabase
		.from("daily_activities")
		.select("*")
		.eq("user_id", userId)
		.eq("roulette_completed", true);

	stats.rouletteSpins = rouletteActivities?.length || 0;

	// ミニゲーム統計
	const { data: miniGameActivities } = await supabase
		.from("daily_activities")
		.select("mini_game_score")
		.eq("user_id", userId)
		.eq("mini_game_completed", true)
		.not("mini_game_score", "is", null);

	if (miniGameActivities) {
		stats.miniGamesPlayed = miniGameActivities.length;
		stats.miniGameHighScore = Math.max(
			0,
			...miniGameActivities.map((a) => a.mini_game_score || 0)
		);
	}

	// レベルと経験値
	const { data: userLevel } = await supabase
		.from("user_levels")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (userLevel) {
		stats.currentLevel = userLevel.current_level || 1;
		stats.totalExp = userLevel.total_exp || 0;
	}

	// アイテム収集
	const { data: inventory } = await supabase
		.from("user_inventory")
		.select("quantity, reward_items!inner(rarity)")
		.eq("user_id", userId);

	if (inventory) {
		stats.itemsCollected = inventory.reduce((sum, item) => sum + item.quantity, 0);
		stats.rareItemsCollected = inventory
			.filter((item) => ["rare", "epic", "legendary"].includes(item.reward_items.rarity))
			.reduce((sum, item) => sum + item.quantity, 0);
	}

	return stats;
}

async function checkAndRestoreAchievements(userId, stats) {
	// 実績の定義（achievement-data.tsと同じ）
	const achievementChecks = [
		// ログイン系
		{ type: "firstLogin", value: 1, stat: stats.loginDays },
		{ type: "loginDays", value: 7, stat: stats.loginDays },
		{ type: "loginDays", value: 30, stat: stats.loginDays },
		{ type: "loginDays", value: 100, stat: stats.loginDays },
		{ type: "consecutiveLogin", value: 7, stat: stats.consecutiveLoginDays },
		{ type: "consecutiveLogin", value: 30, stat: stats.consecutiveLoginDays },
		
		// ゲーム系
		{ type: "rouletteSpins", value: 10, stat: stats.rouletteSpins },
		{ type: "rouletteSpins", value: 50, stat: stats.rouletteSpins },
		{ type: "rouletteSpins", value: 100, stat: stats.rouletteSpins },
		{ type: "miniGamesPlayed", value: 10, stat: stats.miniGamesPlayed },
		{ type: "miniGamesPlayed", value: 50, stat: stats.miniGamesPlayed },
		{ type: "miniGameScore", value: 5000, stat: stats.miniGameHighScore },
		{ type: "miniGameScore", value: 10000, stat: stats.miniGameHighScore },
		
		// レベル系
		{ type: "reachLevel", value: 10, stat: stats.currentLevel },
		{ type: "reachLevel", value: 25, stat: stats.currentLevel },
		{ type: "reachLevel", value: 50, stat: stats.currentLevel },
		{ type: "totalExp", value: 10000, stat: stats.totalExp },
		{ type: "totalExp", value: 50000, stat: stats.totalExp },
		
		// コレクション系
		{ type: "collectItems", value: 10, stat: stats.itemsCollected },
		{ type: "collectItems", value: 50, stat: stats.itemsCollected },
		{ type: "collectItems", value: 100, stat: stats.itemsCollected },
		{ type: "collectRareItems", value: 5, stat: stats.rareItemsCollected },
		{ type: "collectRareItems", value: 20, stat: stats.rareItemsCollected },
	];

	// 既存の実績を取得
	const { data: existingAchievements } = await supabase
		.from("user_achievements")
		.select("achievement_id")
		.eq("user_id", userId);

	const existingIds = new Set(existingAchievements?.map(a => a.achievement_id) || []);

	// 実績マスターデータを取得
	const { data: achievements } = await supabase
		.from("achievements")
		.select("*")
		.eq("is_active", true);

	if (!achievements) return;

	let restoredCount = 0;

	for (const achievement of achievements) {
		// 既に獲得済みならスキップ
		if (existingIds.has(achievement.id)) continue;

		// 条件をチェック
		const check = achievementChecks.find(
			c => c.type === achievement.condition_type && 
			c.value === achievement.condition_value
		);

		if (check && check.stat >= check.value) {
			// 実績を付与
			const { error } = await supabase
				.from("user_achievements")
				.insert({
					user_id: userId,
					achievement_id: achievement.id,
					achieved_at: new Date().toISOString(),
				});

			if (!error) {
				console.log(`  ✅ 実績「${achievement.name}」を復元`);
				restoredCount++;
			}
		}
	}

	if (restoredCount > 0) {
		console.log(`  📊 ${restoredCount}個の実績を復元しました`);
		
		// 経験値も更新
		const totalExp = restoredCount * 100; // 各実績100EXPと仮定
		await supabase
			.from("user_levels")
			.update({
				current_exp: stats.totalExp + totalExp,
				total_exp: stats.totalExp + totalExp,
			})
			.eq("user_id", userId);
	} else {
		console.log(`  ℹ️  復元する実績はありませんでした`);
	}
}

// スクリプトを実行
restoreAchievements();