"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { GameButton } from "@/components/shared/GameButton";
import { RPGCard } from "@/components/shared/RpgCard";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// エラーをログサービスに送信（本番環境）
		if (process.env.NODE_ENV === "production") {
			console.error("Error:", error);
		}
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
			<RPGCard className="max-w-md border-red-500/30 bg-gradient-to-br from-red-900/20 to-red-800/20">
				<div className="flex flex-col items-center text-center">
					<div className="mb-4 rounded-full bg-red-500/20 p-3">
						<AlertTriangle className="h-8 w-8 text-red-400" />
					</div>
					<h1 className="mb-2 font-bold text-2xl text-red-400">
						エラーが発生しました
					</h1>
					<p className="mb-6 text-slate-300">
						申し訳ございません。予期しないエラーが発生しました。
					</p>
					<div className="space-y-3">
						<GameButton onClick={reset} variant="primary">
							もう一度試す
						</GameButton>
						<Link href="/" className="block">
							<GameButton variant="secondary" className="w-full">
								ホームに戻る
							</GameButton>
						</Link>
					</div>
				</div>
			</RPGCard>
		</div>
	);
}
