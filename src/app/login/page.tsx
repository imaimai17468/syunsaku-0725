"use client";

import { Calendar, Dices, Gamepad2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-black py-[10vh]">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4">
				{/* ヒーローセクション */}
				<div className="mb-12 text-center">
					<div className="mb-6 flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl" />
							<Sparkles className="relative h-24 w-24 text-white" />
						</div>
					</div>
					<h1 className="mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent">
						デイリーリワード
					</h1>
					<p className="mx-auto max-w-2xl text-gray-400 text-lg">
						毎日ログインして、豪華報酬をゲットしよう！
						RPGスタイルのゲームで楽しみながら報酬を獲得
					</p>
				</div>

				{/* ログインカード */}
				<Card className="mb-12 w-full max-w-md border-gray-800 bg-gray-900/50 backdrop-blur-sm">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl text-white">ログイン</CardTitle>
						<CardDescription className="text-gray-400">
							Googleアカウントでログインして、今すぐ始めよう
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							type="button"
							size="lg"
							className="w-full bg-white text-gray-900 hover:bg-gray-100"
							onClick={signInWithGoogle}
						>
							<svg
								className="mr-2 h-5 w-5"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Googleでログイン
						</Button>
					</CardContent>
				</Card>

				{/* 特徴セクション */}
				<div className="grid w-full max-w-4xl gap-6 md:grid-cols-3">
					<Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm transition-all hover:bg-gray-900/50">
						<CardContent className="flex flex-col items-center p-6 text-center">
							<div className="mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-3">
								<Calendar className="h-8 w-8 text-blue-400" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-white">
								デイリーログイン
							</h3>
							<p className="text-gray-400 text-sm">
								毎日ログインして連続ログインボーナスを獲得
							</p>
						</CardContent>
					</Card>

					<Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm transition-all hover:bg-gray-900/50">
						<CardContent className="flex flex-col items-center p-6 text-center">
							<div className="mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3">
								<Dices className="h-8 w-8 text-purple-400" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-white">
								ルーレット
							</h3>
							<p className="text-gray-400 text-sm">
								1日1回の運試しで豪華アイテムをゲット
							</p>
						</CardContent>
					</Card>

					<Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm transition-all hover:bg-gray-900/50">
						<CardContent className="flex flex-col items-center p-6 text-center">
							<div className="mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 p-3">
								<Gamepad2 className="h-8 w-8 text-green-400" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-white">
								ミニゲーム
							</h3>
							<p className="text-gray-400 text-sm">
								スキルを磨いて高スコアを目指そう
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
