"use client";

import { Coins, Gem, Shield, Sparkles, Trash2, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { RewardItem } from "@/components/shared/RewardItem";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InventoryItem as InventoryItemType } from "@/lib/inventory/inventory-service";

interface InventoryItemProps {
	item: InventoryItemType;
	onUse?: (inventoryId: string) => void;
	onDelete?: (inventoryId: string) => void;
	onView?: (item: InventoryItemType) => void;
}

const getItemIcon = (itemType: string): ReactNode => {
	switch (itemType) {
		case "coin":
			return <Coins className="h-8 w-8 text-yellow-500" />;
		case "gem":
			return <Gem className="h-8 w-8 text-purple-500" />;
		case "boost":
			return <Zap className="h-8 w-8 text-blue-500" />;
		case "cosmetic":
			return <Sparkles className="h-8 w-8 text-pink-500" />;
		default:
			return <Shield className="h-8 w-8 text-slate-400" />;
	}
};

export function InventoryItem({
	item,
	onUse,
	onDelete,
	onView,
}: InventoryItemProps) {
	const canUse = item.item.itemType === "boost" && !item.isUsed;

	return (
		<div className="relative">
			<RewardItem
				name={item.item.name}
				description={item.item.description || undefined}
				rarity={item.item.rarity}
				icon={getItemIcon(item.item.itemType)}
				value={item.item.value}
				quantity={item.quantity}
				onClick={onView ? () => onView(item) : undefined}
				disabled={item.isUsed}
			/>

			{/* Action Menu */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-2 right-2 h-6 w-6"
					>
						<span className="sr-only">Options</span>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Options menu</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
							/>
						</svg>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{canUse && onUse && (
						<DropdownMenuItem onClick={() => onUse(item.inventoryId)}>
							<Zap className="mr-2 h-4 w-4" />
							Use Item
						</DropdownMenuItem>
					)}
					{onDelete && (
						<DropdownMenuItem
							onClick={() => onDelete(item.inventoryId)}
							className="text-red-600"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Used Badge */}
			{item.isUsed && (
				<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
					<span className="font-bold text-lg text-white">USED</span>
				</div>
			)}
		</div>
	);
}
