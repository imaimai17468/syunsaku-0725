"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const rpgCardVariants = cva(
	"relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300",
	{
		variants: {
			variant: {
				default:
					"bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 border-gray-700 shadow-2xl shadow-black/50",
				rare: "bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/90 border-blue-600 shadow-2xl shadow-blue-950/50",
				epic: "bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90 border-purple-600 shadow-2xl shadow-purple-950/50",
				legendary:
					"bg-gradient-to-br from-amber-900/90 via-amber-800/90 to-amber-900/90 border-amber-600 shadow-2xl shadow-amber-950/50",
			},
			animated: {
				true: "hover:scale-[1.02] hover:shadow-3xl hover:border-opacity-80",
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
				<div className="relative z-10 p-4 sm:p-6">{children}</div>
			</Card>
		);
	},
);

RPGCard.displayName = "RPGCard";

export { RPGCard, rpgCardVariants };
