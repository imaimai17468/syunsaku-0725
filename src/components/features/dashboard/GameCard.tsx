"use client";

import type { ReactNode } from "react";
import { RPGCard } from "@/components/shared/RpgCard";
import { cn } from "@/lib/utils";

interface GameCardProps {
	icon: ReactNode;
	title: string;
	description: string;
	variant?: "default" | "primary" | "secondary";
	disabled?: boolean;
	small?: boolean;
}

export function GameCard({
	icon,
	title,
	description,
	variant = "default",
	disabled = false,
	small = false,
}: GameCardProps) {
	const variantStyles = {
		default: "hover:border-slate-500",
		primary: "hover:border-blue-500 hover:shadow-blue-500/20",
		secondary: "hover:border-purple-500 hover:shadow-purple-500/20",
	};

	const disabledStyles = disabled
		? "opacity-50 cursor-not-allowed"
		: "cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-lg";

	return (
		<RPGCard
			className={cn(
				"h-full transition-all",
				variantStyles[variant],
				disabledStyles,
				small ? "p-4" : "p-6",
			)}
		>
			<div className={cn("flex gap-4", small ? "items-center" : "")}>
				{/* アイコン */}
				<div
					className={cn(
						"flex items-center justify-center rounded-lg",
						small ? "h-12 w-12" : "h-16 w-16",
						variant === "primary"
							? "bg-blue-500/20 text-blue-400"
							: variant === "secondary"
								? "bg-purple-500/20 text-purple-400"
								: "bg-slate-700/50 text-slate-400",
					)}
				>
					{icon}
				</div>

				{/* テキスト */}
				<div className="flex-1">
					<h3
						className={cn(
							"font-bold text-white",
							small ? "text-base" : "mb-1 text-lg",
						)}
					>
						{title}
					</h3>
					<p className={cn("text-slate-400", small ? "text-xs" : "text-sm")}>
						{description}
					</p>
				</div>
			</div>

			{/* 完了マーク */}
			{disabled && (
				<div className="absolute top-2 right-2 rounded-full bg-green-500/20 p-2">
					<svg
						className="h-4 w-4 text-green-500"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="3"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<title>完了</title>
						<path d="M5 13l4 4L19 7" />
					</svg>
				</div>
			)}
		</RPGCard>
	);
}
