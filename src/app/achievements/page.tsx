import { Award, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { getAchievementsWithProgress } from "@/app/actions/achievement";
import { AchievementCategory } from "@/components/features/achievement/AchievementCategory";
import { RPGCard } from "@/components/shared/RpgCard";
import type { AchievementCategory as AchievementCategoryType } from "@/entities/achievement";
import { createClient } from "@/lib/supabase/server";

export default async function AchievementsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// 実績データを取得
	const achievements = await getAchievementsWithProgress(user.id);

	// カテゴリー別に分類
	const achievementsByCategory = {
		login: achievements.filter((a) => a.category === "login"),
		game: achievements.filter((a) => a.category === "game"),
		collection: achievements.filter((a) => a.category === "collection"),
		level: achievements.filter((a) => a.category === "level"),
		special: achievements.filter((a) => a.category === "special"),
	};

	// 統計情報
	const totalAchievements = achievements.length;
	const unlockedAchievements = achievements.filter(
		(a) => a.userProgress?.achievedAt,
	).length;
	const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
	const earnedPoints = achievements
		.filter((a) => a.userProgress?.achievedAt)
		.reduce((sum, a) => sum + a.points, 0);

	const completionPercentage = Math.round(
		(unlockedAchievements / totalAchievements) * 100,
	);

	return (
		<div className="min-h-screen bg-black py-[10vh]">
			<div className="mx-auto max-w-6xl px-4">
				{/* ヒーローセクション */}
				<div className="mb-12 text-center">
					<div className="mb-6 flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl" />
							<Trophy className="relative h-24 w-24 text-white" />
						</div>
					</div>
					<h1 className="mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent">
						実績
					</h1>
					<p className="mx-auto max-w-2xl text-gray-400 text-lg">
						チャレンジを達成して報酬を獲得しよう！
					</p>
				</div>

				{/* 統計カード */}
				<div className="mb-6 grid gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
					<RPGCard className="text-center">
						<div className="mb-2 flex justify-center">
							<Trophy className="h-8 w-8 text-amber-500" />
						</div>
						<p className="font-bold text-2xl text-white">
							{unlockedAchievements}
						</p>
						<p className="text-slate-400 text-sm">獲得実績</p>
					</RPGCard>

					<RPGCard className="text-center">
						<div className="mb-2 flex justify-center">
							<Award className="h-8 w-8 text-blue-500" />
						</div>
						<p className="font-bold text-2xl text-white">{totalAchievements}</p>
						<p className="text-slate-400 text-sm">総実績数</p>
					</RPGCard>

					<RPGCard className="text-center">
						<div className="mb-2 flex justify-center">
							<span className="text-2xl">🏅</span>
						</div>
						<p className="font-bold text-2xl text-amber-400">{earnedPoints}</p>
						<p className="text-slate-400 text-sm">獲得ポイント</p>
					</RPGCard>

					<RPGCard className="text-center">
						<div className="mb-2 flex justify-center">
							<span className="text-2xl">📊</span>
						</div>
						<p className="font-bold text-2xl text-green-400">
							{completionPercentage}%
						</p>
						<p className="text-slate-400 text-sm">達成率</p>
					</RPGCard>
				</div>

				{/* 全体プログレス */}
				<RPGCard className="mb-6 sm:mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-bold text-lg text-white">全体の進捗</h3>
							<p className="text-slate-400 text-sm">
								{unlockedAchievements} / {totalAchievements} 実績を達成
							</p>
						</div>
						<div className="text-right">
							<p className="font-bold text-2xl text-amber-400">
								{earnedPoints}
							</p>
							<p className="text-slate-500 text-sm">/ {totalPoints} pts</p>
						</div>
					</div>
					<div className="mt-4">
						<div className="h-4 w-full overflow-hidden rounded-full bg-slate-700">
							<div
								className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000"
								style={{ width: `${completionPercentage}%` }}
							/>
						</div>
					</div>
				</RPGCard>

				{/* カテゴリー別実績 */}
				<div className="space-y-6">
					{Object.entries(achievementsByCategory).map(
						([category, categoryAchievements]) => {
							if (categoryAchievements.length === 0) return null;
							return (
								<AchievementCategory
									key={category}
									category={category as AchievementCategoryType}
									achievements={categoryAchievements}
									showAll={true}
								/>
							);
						},
					)}
				</div>
			</div>
		</div>
	);
}
