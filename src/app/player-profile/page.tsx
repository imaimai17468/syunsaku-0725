import { Award, BarChart3, User } from "lucide-react";
import { redirect } from "next/navigation";
import { fetchUserStats, getUserLevel } from "@/app/actions/user-level";
import { UserLevelDisplay } from "@/components/features/profile/UserLevelDisplay";
import { UserStatsDisplay } from "@/components/features/profile/UserStatsDisplay";
import { RPGCard } from "@/components/shared/RpgCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCurrentUser } from "@/gateways/user";

export default async function PlayerProfilePage() {
	const user = await fetchCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const [userLevel, userStats] = await Promise.all([
		getUserLevel(),
		fetchUserStats(),
	]);

	return (
		<div className="min-h-screen bg-black py-[10vh]">
			<div className="mx-auto max-w-6xl px-4">
				{/* ヒーローセクション */}
				<div className="mb-12 text-center">
					<div className="mb-6 flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl" />
							<User className="relative h-24 w-24 text-white" />
						</div>
					</div>
					<h1 className="mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent">
						プレイヤープロフィール
					</h1>
					<p className="mx-auto max-w-2xl text-gray-400 text-lg">
						{user.name || "冒険者"}の冒険の記録とステータス
					</p>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="overview">
							<User className="mr-2 h-4 w-4" />
							概要
						</TabsTrigger>
						<TabsTrigger value="stats">
							<BarChart3 className="mr-2 h-4 w-4" />
							統計
						</TabsTrigger>
						<TabsTrigger value="achievements">
							<Award className="mr-2 h-4 w-4" />
							実績
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						{/* Level Display */}
						{userLevel && <UserLevelDisplay userLevel={userLevel} />}

						{/* Quick Stats */}
						{userStats && (
							<div className="grid gap-4 md:grid-cols-2">
								<RPGCard variant="rare">
									<div className="p-4">
										<h3 className="mb-2 font-semibold text-lg text-white">
											ログイン情報
										</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-slate-400">総ログイン日数</span>
												<span className="font-semibold text-white">
													{userStats.totalLoginDays}日
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">
													現在の連続ログイン
												</span>
												<span className="font-semibold text-green-400">
													{userStats.currentStreak}日
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">最長記録</span>
												<span className="font-semibold text-yellow-400">
													{userStats.longestStreak}日
												</span>
											</div>
										</div>
									</div>
								</RPGCard>

								<RPGCard variant="rare">
									<div className="p-4">
										<h3 className="mb-2 font-semibold text-lg text-white">
											ゲーム成績
										</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-slate-400">
													ミニゲーム最高スコア
												</span>
												<span className="font-semibold text-white">
													{userStats.miniGameHighScore.toLocaleString()}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">
													ルーレット完了回数
												</span>
												<span className="font-semibold text-white">
													{userStats.rouletteWins}回
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">達成実績</span>
												<span className="font-semibold text-amber-400">
													{userStats.achievements}個
												</span>
											</div>
										</div>
									</div>
								</RPGCard>
							</div>
						)}
					</TabsContent>

					<TabsContent value="stats" className="space-y-6">
						{userStats && <UserStatsDisplay stats={userStats} />}
					</TabsContent>

					<TabsContent value="achievements" className="space-y-6">
						<RPGCard variant="epic">
							<div className="p-6 text-center">
								<Award className="mx-auto mb-4 h-16 w-16 text-amber-400" />
								<h3 className="mb-2 font-bold text-white text-xl">
									実績システム
								</h3>
								<p className="text-slate-300">
									実績システムは現在開発中です。
									<br />
									様々な条件を達成して、特別な報酬を獲得しましょう！
								</p>
							</div>
						</RPGCard>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
