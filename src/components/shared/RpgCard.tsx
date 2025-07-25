"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const rpgCardVariants = cva(
	"relative overflow-hidden border-2 backdrop-blur-sm transition-all duration-300",
	{
		variants: {
			variant: {
				default:
					"bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border-slate-600 shadow-lg shadow-slate-500/20",
				rare: "bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 border-blue-500 shadow-lg shadow-blue-500/30",
				epic: "bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 border-purple-500 shadow-lg shadow-purple-500/30",
				legendary:
					"bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 border-amber-500 shadow-lg shadow-amber-500/40",
			},
			animated: {
				true: "hover:scale-105 hover:shadow-xl",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			animated: true,
		},
	},
);

export interface RPGCardProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof rpgCardVariants> {
	children: ReactNode;
	glowEffect?: boolean;
}

const RPGCard = forwardRef<HTMLDivElement, RPGCardProps>(
	(
		{ className, variant, animated, glowEffect = true, children, ...props },
		ref,
	) => {
		return (
			<Card
				ref={ref}
				className={cn(
					rpgCardVariants({ variant, animated }),
					!glowEffect && "shadow-none",
					className,
				)}
				{...props}
			>
				{/* Inner glow effect */}
				<div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 via-transparent to-transparent" />

				{/* Animated border shimmer for legendary */}
				{variant === "legendary" && (
					<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
						<div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
					</div>
				)}

				{/* Content */}
				<div className="relative z-10 p-6">{children}</div>
			</Card>
		);
	},
);

RPGCard.displayName = "RPGCard";

export { RPGCard, rpgCardVariants };
