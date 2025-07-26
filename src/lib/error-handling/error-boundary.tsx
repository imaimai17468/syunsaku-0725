"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { GameButton } from "@/components/shared/game-button";
import { RPGCard } from "@/components/shared/rpg-card";

interface ErrorBoundaryProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
	useEffect(() => {
		console.error("ErrorBoundary caught:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
			<RPGCard className="max-w-md">
				<div className="flex flex-col items-center text-center">
					<div className="mb-4 rounded-full bg-red-500/20 p-4">
						<AlertTriangle className="h-12 w-12 text-red-500" />
					</div>

					<h1 className="mb-2 font-bold text-2xl text-white">
						エラーが発生しました
					</h1>

					<p className="mb-6 text-slate-400">
						申し訳ございません。予期しないエラーが発生しました。
						<br />
						問題が解決しない場合は、サポートまでお問い合わせください。
					</p>

					{error.digest && (
						<p className="mb-4 font-mono text-slate-500 text-sm">
							エラーID: {error.digest}
						</p>
					)}

					<div className="flex gap-3">
						<GameButton
							variant="primary"
							icon={<RefreshCw className="h-4 w-4" />}
							onClick={reset}
						>
							再試行
						</GameButton>
						<GameButton
							variant="secondary"
							onClick={() => {
								window.location.href = "/";
							}}
						>
							ホームに戻る
						</GameButton>
					</div>
				</div>
			</RPGCard>
		</div>
	);
}
