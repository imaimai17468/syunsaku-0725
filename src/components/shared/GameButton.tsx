"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const gameButtonVariants = cva(
	"relative overflow-hidden font-bold transition-all duration-200 shadow-lg active:scale-95 touch-manipulation select-none",
	{
		variants: {
			variant: {
				primary:
					"bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white border-2 border-blue-400 shadow-blue-500/30",
				secondary:
					"bg-gradient-to-b from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600 text-white border-2 border-slate-400 shadow-slate-500/30",
				success:
					"bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white border-2 border-green-400 shadow-green-500/30",
				danger:
					"bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white border-2 border-red-400 shadow-red-500/30",
				legendary:
					"bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white border-2 border-amber-400 shadow-amber-500/40",
			},
			size: {
				sm: "h-9 px-3 text-sm min-h-[36px] min-w-[44px]",
				md: "h-11 px-4 text-base min-h-[44px] min-w-[44px]",
				lg: "h-14 px-6 text-lg min-h-[56px] min-w-[56px]",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export interface GameButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof gameButtonVariants> {
	icon?: ReactNode;
	loading?: boolean;
}

const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
	(
		{ className, variant, size, icon, loading, children, disabled, ...props },
		ref,
	) => {
		return (
			<Button
				ref={ref}
				disabled={disabled || loading}
				className={cn(gameButtonVariants({ variant, size }), className)}
				{...props}
			>
				{/* 3D effect - top highlight */}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-md bg-gradient-to-b from-white/20 to-transparent" />

				{/* 3D effect - bottom shadow */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-md bg-gradient-to-t from-black/20 to-transparent" />

				{/* Content */}
				<span className="relative z-10 flex items-center justify-center gap-2">
					{loading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						icon && <span>{icon}</span>
					)}
					{children}
				</span>

				{/* Legendary pulse effect */}
				{variant === "legendary" && !disabled && !loading && (
					<div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-transparent via-amber-300/20 to-transparent" />
				)}
			</Button>
		);
	},
);

GameButton.displayName = "GameButton";

export { GameButton, gameButtonVariants };
