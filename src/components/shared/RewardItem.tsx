"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const rewardItemVariants = cva(
	"relative overflow-hidden border-2 backdrop-blur-sm transition-all duration-300",
	{
		variants: {
			rarity: {
				common:
					"bg-gradient-to-br from-slate-600 to-slate-800 border-slate-500 shadow-lg shadow-slate-500/20",
				rare: "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-lg shadow-blue-500/30",
				epic: "bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400 shadow-lg shadow-purple-500/30",
				legendary:
					"bg-gradient-to-br from-amber-600 to-amber-800 border-amber-400 shadow-lg shadow-amber-500/40",
			},
			clickable: {
				true: "cursor-pointer hover:scale-105 hover:shadow-xl hover:brightness-110",
				false: "",
			},
		},
		defaultVariants: {
			rarity: "common",
			clickable: false,
		},
	},
);

export interface RewardItemProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "onClick">,
		VariantProps<typeof rewardItemVariants> {
	name: string;
	description?: string;
	icon?: ReactNode;
	iconUrl?: string;
	value?: number;
	quantity?: number;
	onClick?: () => void;
	disabled?: boolean;
}

const RewardItem = forwardRef<HTMLDivElement, RewardItemProps>(
	(
		{
			name,
			description,
			rarity = "common",
			icon,
			iconUrl,
			value,
			quantity,
			className,
			onClick,
			disabled = false,
			clickable = !!onClick,
			...props
		},
		ref,
	) => {
		const content = (
			<Card
				ref={ref}
				className={cn(
					rewardItemVariants({ rarity, clickable: clickable && !disabled }),
					disabled && "cursor-not-allowed opacity-50",
					className,
				)}
				{...props}
			>
				{/* Quantity badge */}
				{quantity && quantity > 1 && (
					<Badge className="-right-2 -top-2 absolute h-6 w-6 rounded-full border-slate-600 bg-slate-900 p-0">
						<span className="font-bold text-white text-xs">{quantity}</span>
					</Badge>
				)}

				{/* Rarity indicator */}
				<div className="absolute top-2 right-2">
					<div
						className={cn(
							"h-2 w-2 rounded-full",
							rarity === "common" && "bg-slate-400",
							rarity === "rare" && "bg-blue-400",
							rarity === "epic" && "bg-purple-400",
							rarity === "legendary" && "animate-pulse bg-amber-400",
						)}
					/>
				</div>

				<CardHeader className="p-4 pb-0">
					{/* Icon */}
					<div className="mb-2 flex items-center justify-center">
						{iconUrl ? (
							<Image
								src={iconUrl}
								alt={name}
								width={48}
								height={48}
								className="h-12 w-12 object-contain"
							/>
						) : icon ? (
							<div className="flex h-12 w-12 items-center justify-center text-2xl">
								{icon}
							</div>
						) : (
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700">
								<span className="text-2xl">🎁</span>
							</div>
						)}
					</div>

					<CardTitle
						className={cn(
							"text-center text-sm",
							rarity === "common" && "text-slate-200",
							rarity === "rare" && "text-blue-100",
							rarity === "epic" && "text-purple-100",
							rarity === "legendary" && "text-amber-100",
						)}
					>
						{name}
					</CardTitle>
				</CardHeader>

				<CardContent className="p-4 pt-2 text-center">
					{description && (
						<CardDescription className="mb-2 line-clamp-2 text-xs">
							{description}
						</CardDescription>
					)}

					{value !== undefined && (
						<div className="flex items-center justify-center gap-1">
							<span className="text-slate-300 text-xs">Value:</span>
							<span
								className={cn(
									"font-bold text-xs",
									rarity === "common" && "text-slate-200",
									rarity === "rare" && "text-blue-100",
									rarity === "epic" && "text-purple-100",
									rarity === "legendary" && "text-amber-100",
								)}
							>
								{value}
							</span>
						</div>
					)}
				</CardContent>

				{/* Legendary shimmer effect */}
				{rarity === "legendary" && (
					<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
						<div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
					</div>
				)}

				{/* Inner glow */}
				<div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 via-transparent to-transparent" />
			</Card>
		);

		if (onClick) {
			return (
				<Button
					variant="ghost"
					className="h-auto p-0 hover:bg-transparent"
					onClick={!disabled ? onClick : undefined}
					disabled={disabled}
				>
					{content}
				</Button>
			);
		}

		return content;
	},
);

RewardItem.displayName = "RewardItem";

export { RewardItem, rewardItemVariants };
