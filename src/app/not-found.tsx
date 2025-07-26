import { Calendar, Home, Search } from "lucide-react";
import Link from "next/link";
import { GameButton } from "@/components/shared/GameButton";
import { RPGCard } from "@/components/shared/RpgCard";

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black p-4 py-[10vh]">
			<RPGCard className="max-w-md border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/20">
				<div className="flex flex-col items-center text-center">
					<div className="mb-4 rounded-full bg-purple-500/20 p-3">
						<Search className="h-8 w-8 text-purple-400" />
					</div>
					<h1 className="mb-2 font-bold text-2xl text-purple-400">
						404 - ページが見つかりません
					</h1>
					<p className="mb-6 text-slate-300">
						お探しのページは存在しないか、移動した可能性があります。
					</p>
					<div className="space-y-3">
						<Link href="/" className="block">
							<GameButton
								icon={<Home className="mr-2 h-4 w-4" />}
								variant="primary"
								className="w-full"
							>
								ホームに戻る
							</GameButton>
						</Link>
						<Link href="/daily-login" className="block">
							<GameButton
								icon={<Calendar className="mr-2 h-4 w-4" />}
								variant="secondary"
								className="w-full"
							>
								デイリーログインへ
							</GameButton>
						</Link>
					</div>
				</div>
			</RPGCard>
		</div>
	);
}
