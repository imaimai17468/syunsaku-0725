import { redirect } from "next/navigation";
import { CheckAchievementsButton } from "@/components/features/profile-page/CheckAchievementsButton";
import { RPGCard } from "@/components/shared/RpgCard";
import { createClient } from "@/lib/supabase/server";

export default async function CheckAchievementsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-black py-[10vh]">
			<div className="mx-auto max-w-4xl px-4">
				<h1 className="mb-8 text-center font-bold text-3xl text-white">
					実績の再チェック
				</h1>

				<RPGCard className="mx-auto max-w-md p-8">
					<div className="text-center">
						<h2 className="mb-4 font-bold text-white text-xl">実績を再計算</h2>
						<p className="mb-6 text-gray-400">
							これまでの活動履歴から実績を再チェックします。
							獲得できていなかった実績があれば付与されます。
						</p>
						<CheckAchievementsButton />
					</div>
				</RPGCard>

				<div className="mt-8 text-center">
					<a
						href="/achievements"
						className="text-purple-400 hover:text-purple-300"
					>
						実績ページに戻る
					</a>
				</div>
			</div>
		</div>
	);
}
