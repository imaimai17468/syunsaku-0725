import Link from "next/link";
import { fetchCurrentUser } from "@/gateways/user";
import { AuthNavigation } from "./auth-navigation/AuthNavigation";

export const Header = async () => {
	const user = await fetchCurrentUser();

	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-slate-800 border-b bg-black/90 backdrop-blur-sm">
			<div className="flex items-center justify-between px-6 py-6">
				<div>
					<h1 className="font-medium text-2xl text-white">
						<Link href="/">デイリーリワード</Link>
					</h1>
				</div>
				<div className="flex items-center gap-5">
					<Link
						href="/daily-login"
						className="text-gray-400 text-sm transition-colors hover:text-white"
					>
						ログインボーナス
					</Link>
					<Link
						href="/roulette"
						className="text-gray-400 text-sm transition-colors hover:text-white"
					>
						ルーレット
					</Link>
					<Link
						href="/mini-game"
						className="text-gray-400 text-sm transition-colors hover:text-white"
					>
						ミニゲーム
					</Link>
					<AuthNavigation user={user} />
				</div>
			</div>
		</header>
	);
};
