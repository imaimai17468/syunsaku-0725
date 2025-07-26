"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { soundEffects } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const gameButtonVariants = cva(
	"relative overflow-hidden font-semibold transition-all duration-300 shadow-2xl shadow-black/50 active:scale-[0.98] touch-manipulation select-none rounded-xl backdrop-blur-sm",
	{
		variants: {
			variant: {
				primary:
					"bg-gradient-to-b from-blue-600/90 to-blue-800/90 hover:from-blue-500/90 hover:to-blue-700/90 text-white border border-blue-500/50 hover:border-blue-400/70",
				secondary:
					"bg-gradient-to-b from-gray-700/90 to-gray-900/90 hover:from-gray-600/90 hover:to-gray-800/90 text-white border border-gray-600/50 hover:border-gray-500/70",
				success:
					"bg-gradient-to-b from-green-600/90 to-green-800/90 hover:from-green-500/90 hover:to-green-700/90 text-white border border-green-500/50 hover:border-green-400/70",
				danger:
					"bg-gradient-to-b from-red-600/90 to-red-800/90 hover:from-red-500/90 hover:to-red-700/90 text-white border border-red-500/50 hover:border-red-400/70",
				legendary:
					"bg-gradient-to-b from-amber-600/90 to-amber-800/90 hover:from-amber-500/90 hover:to-amber-700/90 text-white border border-amber-500/50 hover:border-amber-400/70",
			},
			size: {
				sm: "h-9 px-4 text-sm min-h-[36px] min-w-[44px]",
				md: "h-11 px-5 text-base min-h-[44px] min-w-[44px]",
				lg: "h-14 px-8 text-lg min-h-[56px] min-w-[56px]",
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
		{
			className,
			variant,
			size,
			icon,
			loading,
			children,
			disabled,
			onClick,
			...props
		},
		ref,
	) => {
		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			if (!disabled && !loading) {
				soundEffects.play("button", 0.3);
			}
			onClick?.(e);
		};

		return (
			<Button
				ref={ref}
				disabled={disabled || loading}
				className={cn(gameButtonVariants({ variant, size }), className)}
				onClick={handleClick}
				{...props}
			>
				{/* Subtle top highlight */}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-xl bg-gradient-to-b from-white/10 to-transparent" />

				{/* Content */}
				<span className="relative z-10 flex items-center justify-center gap-2">
					{loading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						icon && <span>{icon}</span>
					)}
					{children}
				</span>

				{/* Legendary shimmer effect */}
				{variant === "legendary" && !disabled && !loading && (
					<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
						<div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
					</div>
				)}
			</Button>
		);
	},
);

GameButton.displayName = "GameButton";

export { GameButton, gameButtonVariants };
