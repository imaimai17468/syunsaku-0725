"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const progressBarVariants = cva("", {
	variants: {
		variant: {
			default:
				"[&>div>div]:bg-gradient-to-r [&>div>div]:from-blue-500 [&>div>div]:to-blue-600",
			exp: "[&>div>div]:bg-gradient-to-r [&>div>div]:from-amber-500 [&>div>div]:to-amber-600",
			health:
				"[&>div>div]:bg-gradient-to-r [&>div>div]:from-red-500 [&>div>div]:to-red-600",
			mana: "[&>div>div]:bg-gradient-to-r [&>div>div]:from-cyan-500 [&>div>div]:to-cyan-600",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface ProgressBarProps
	extends VariantProps<typeof progressBarVariants> {
	value: number;
	max: number;
	showText?: boolean;
	animated?: boolean;
	className?: string;
	label?: string;
}

export function ProgressBar({
	value,
	max,
	variant,
	showText = true,
	animated = true,
	className,
	label,
}: ProgressBarProps) {
	const [displayValue, setDisplayValue] = useState(0);
	const percentage = Math.min((value / max) * 100, 100);

	useEffect(() => {
		if (animated) {
			const timer = setTimeout(() => {
				setDisplayValue(percentage);
			}, 100);
			return () => clearTimeout(timer);
		}
		setDisplayValue(percentage);
	}, [percentage, animated]);

	return (
		<div className={cn("w-full", className)}>
			{label && (
				<div className="mb-2 flex items-center justify-between">
					<span className="font-medium text-gray-200 text-sm">{label}</span>
					{showText && (
						<span className="text-gray-400 text-sm">
							{value}/{max}
						</span>
					)}
				</div>
			)}

			<div className="relative">
				<Progress
					value={displayValue}
					className={cn(
						"h-4 border border-gray-700 bg-gray-900/50 shadow-inner",
						progressBarVariants({ variant }),
						animated &&
							"[&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-out",
						"[&>div>div]:shadow-black/50 [&>div>div]:shadow-lg",
					)}
				/>

				{/* Animated shine effect */}
				{animated && displayValue > 0 && (
					<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
						<div className="absolute inset-0 h-full animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
					</div>
				)}

				{/* Percentage text overlay */}
				{showText && !label && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="font-bold text-white text-xs drop-shadow-lg">
							{Math.round(percentage)}%
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
