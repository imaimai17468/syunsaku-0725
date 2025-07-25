import {
	Award,
	Calendar,
	Dices,
	Gamepad2,
	Package,
	Trophy,
	User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDailyProgress } from "@/app/actions/daily-login";
import { GameCard } from "@/components/features/dashboard/GameCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RPGCard } from "@/components/shared/RpgCard";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// 今日の進捗状況を取得
	const progress = await getDailyProgress(user.id);

	// 獲得可能な報酬のプレビューを計算
	const nextStreakReward = getNextStreakReward(progress.loginStreak);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
			<div className="mx-auto max-w-7xl">
				{/* ヘッダー */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-white">
						デイリーリワード
					</h1>
					<p className="text-slate-400">
						毎日ログインして、豪華報酬をゲットしよう！
					</p>
				</div>

				{/* 連続ログイン情報 */}
				<RPGCard className="mb-8 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-amber-800/20">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="mb-2 flex items-center gap-2 font-bold text-2xl text-amber-400">
								<Calendar className="h-6 w-6" />
								連続ログイン
							</h2>
							<p className="mb-4 text-slate-300">
								{progress.loginStreak}日連続でログイン中！
							</p>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-5xl text-amber-400">
								{progress.loginStreak}
							</div>
							<div className="text-slate-400 text-sm">日目</div>
						</div>
					</div>

					{/* 次の報酬まで */}
					{nextStreakReward && (
						<div className="mt-4 rounded-lg bg-slate-800/50 p-4">
							<p className="mb-2 text-slate-400 text-sm">
								次のマイルストーン報酬まで
							</p>
							<ProgressBar
								value={progress.loginStreak}
								max={nextStreakReward.days}
								className="mb-2"
								variant="exp"
								animated
							/>
							<p className="text-amber-400 text-sm">
								{nextStreakReward.days}日連続ログインで{nextStreakReward.reward}
								を獲得！
							</p>
						</div>
					)}
				</RPGCard>

				{/* 今日の進捗状況 */}
				<div className="mb-8">
					<h2 className="mb-4 font-bold text-2xl text-white">今日の進捗</h2>
					<div className="grid gap-4 md:grid-cols-3">
						{/* デイリーログイン */}
						<RPGCard
							className={
								progress.dailyLogin ? "border-green-500/50 bg-green-900/20" : ""
							}
						>
							<div className="mb-4 flex items-center justify-between">
								<h3 className="font-bold text-lg text-white">
									デイリーログイン
								</h3>
								{progress.dailyLogin ? (
									<div className="rounded-full bg-green-500 p-1">
										<Trophy className="h-4 w-4 text-white" />
									</div>
								) : (
									<div className="h-6 w-6 rounded-full border-2 border-slate-600" />
								)}
							</div>
							<p className="text-slate-400 text-sm">
								{progress.dailyLogin
									? "完了！報酬を獲得しました"
									: "ログインボーナスが待っています"}
							</p>
						</RPGCard>

						{/* ルーレット */}
						<RPGCard
							className={
								progress.rouletteCompleted
									? "border-green-500/50 bg-green-900/20"
									: ""
							}
						>
							<div className="mb-4 flex items-center justify-between">
								<h3 className="font-bold text-lg text-white">ルーレット</h3>
								{progress.rouletteCompleted ? (
									<div className="rounded-full bg-green-500 p-1">
										<Trophy className="h-4 w-4 text-white" />
									</div>
								) : (
									<div className="h-6 w-6 rounded-full border-2 border-slate-600" />
								)}
							</div>
							<p className="text-slate-400 text-sm">
								{progress.rouletteCompleted
									? "完了！また明日挑戦しよう"
									: "1日1回運試しができます"}
							</p>
						</RPGCard>

						{/* ミニゲーム */}
						<RPGCard
							className={
								progress.miniGameCompleted
									? "border-green-500/50 bg-green-900/20"
									: ""
							}
						>
							<div className="mb-4 flex items-center justify-between">
								<h3 className="font-bold text-lg text-white">ミニゲーム</h3>
								{progress.miniGameCompleted ? (
									<div className="rounded-full bg-green-500 p-1">
										<Trophy className="h-4 w-4 text-white" />
									</div>
								) : (
									<div className="h-6 w-6 rounded-full border-2 border-slate-600" />
								)}
							</div>
							<p className="text-slate-400 text-sm">
								{progress.miniGameCompleted
									? `完了！スコア: ${progress.miniGameHighScore || 0}`
									: "スコアに応じて報酬ゲット"}
							</p>
						</RPGCard>
					</div>
				</div>

				{/* ゲームメニュー */}
				<div className="mb-8">
					<h2 className="mb-4 font-bold text-2xl text-white">ゲームメニュー</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Link
							href="/daily-login"
							className={progress.dailyLogin ? "pointer-events-none" : ""}
						>
							<GameCard
								icon={<Calendar className="h-8 w-8" />}
								title="デイリーログイン"
								description="毎日ログインして報酬を獲得"
								variant="default"
								disabled={progress.dailyLogin}
							/>
						</Link>
						<Link
							href="/roulette"
							className={
								progress.rouletteCompleted ? "pointer-events-none" : ""
							}
						>
							<GameCard
								icon={<Dices className="h-8 w-8" />}
								title="ルーレット"
								description="1日1回の運試し"
								variant="primary"
								disabled={progress.rouletteCompleted}
							/>
						</Link>
						<Link
							href="/mini-game"
							className={
								progress.miniGameCompleted ? "pointer-events-none" : ""
							}
						>
							<GameCard
								icon={<Gamepad2 className="h-8 w-8" />}
								title="ミニゲーム"
								description="クリックゲームに挑戦"
								variant="secondary"
								disabled={progress.miniGameCompleted}
							/>
						</Link>
						<Link href="/inventory">
							<GameCard
								icon={<Package className="h-8 w-8" />}
								title="インベントリ"
								description="獲得したアイテムを確認"
								variant="default"
							/>
						</Link>
					</div>
				</div>

				{/* その他のメニュー */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Link href="/profile">
						<GameCard
							icon={<User className="h-6 w-6" />}
							title="プロフィール"
							description="レベルと統計情報"
							variant="default"
							small
						/>
					</Link>
					<Link href="/achievements">
						<GameCard
							icon={<Award className="h-6 w-6" />}
							title="実績"
							description="チャレンジと報酬"
							variant="default"
							small
						/>
					</Link>
					<Link href="/rpg-components-demo">
						<GameCard
							icon={<Trophy className="h-6 w-6" />}
							title="コンポーネントデモ"
							description="UIコンポーネントの確認"
							variant="default"
							small
						/>
					</Link>
				</div>
			</div>
		</div>
	);
}

// 次のストリーク報酬を計算するヘルパー関数
function getNextStreakReward(currentStreak: number): {
	days: number;
	reward: string;
} | null {
	const milestones = [
		{ days: 3, reward: "レアアイテム" },
		{ days: 7, reward: "エピックアイテム" },
		{ days: 14, reward: "レジェンダリーアイテム" },
		{ days: 30, reward: "特別な実績とアイテム" },
		{ days: 50, reward: "超レアアイテム" },
		{ days: 100, reward: "限定称号と報酬" },
	];

	// 現在のストリークより大きい最初のマイルストーンを探す
	const nextMilestone = milestones.find((m) => m.days > currentStreak);
	return nextMilestone || null;
}
