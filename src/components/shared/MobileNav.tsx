"use client";

import {
	Award,
	Calendar,
	Dices,
	Gamepad2,
	Home,
	Menu,
	Package,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/", label: "ホーム", icon: Home },
	{ href: "/daily-login", label: "デイリーログイン", icon: Calendar },
	{ href: "/roulette", label: "ルーレット", icon: Dices },
	{ href: "/mini-game", label: "ミニゲーム", icon: Gamepad2 },
	{ href: "/inventory", label: "インベントリ", icon: Package },
	{ href: "/achievements", label: "実績", icon: Award },
	{ href: "/profile", label: "プロフィール", icon: User },
];

export const MobileNav = () => {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	return (
		<div className="fixed top-0 z-50 w-full border-slate-700 border-b bg-slate-900/95 backdrop-blur sm:hidden">
			<div className="flex h-14 items-center justify-between px-4">
				<Link href="/" className="font-bold text-white text-xl">
					デイリーリワード
				</Link>
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="text-white">
							<Menu className="h-6 w-6" />
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-64 bg-slate-900 p-0">
						<div className="flex h-14 items-center justify-between border-slate-700 border-b px-4">
							<span className="font-bold text-white">メニュー</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setOpen(false)}
								className="text-white"
							>
								<X className="h-5 w-5" />
							</Button>
						</div>
						<nav className="flex flex-col">
							{navItems.map(({ href, label, icon: Icon }) => (
								<Link
									key={href}
									href={href}
									onClick={() => setOpen(false)}
									className={cn(
										"flex items-center gap-3 border-slate-800 border-b px-4 py-3 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white",
										pathname === href && "bg-slate-800 text-white",
									)}
								>
									<Icon className="h-5 w-5" />
									<span>{label}</span>
								</Link>
							))}
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
};
