import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { fetchRankingAction } from "@/app/actions/ranking";
import { RankingTabs } from "@/components/features/ranking/RankingTabs";
import { fetchRanking } from "@/gateways/ranking";
import { createClient } from "@/lib/supabase/server";

export default async function RankingPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// 初期データを取得
	const initialData = await fetchRanking("level");

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
						ランキング
					</h1>
					<p className="mx-auto max-w-2xl text-gray-400 text-lg">
						他の冒険者と競い合い、頂点を目指そう！
					</p>
				</div>

				{/* ランキングタブ */}
				<RankingTabs
					initialData={initialData}
					currentUserId={user.id}
					fetchRankingAction={fetchRankingAction}
				/>

				{/* 更新情報 */}
				<div className="mt-8 text-center">
					<p className="text-gray-500 text-sm">
						ランキングはリアルタイムで更新されます
					</p>
				</div>
			</div>
		</div>
	);
}
