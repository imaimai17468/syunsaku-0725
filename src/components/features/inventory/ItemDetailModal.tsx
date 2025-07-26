"use client";

import { Coins, Gem, Shield, Sparkles, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { InventoryItem } from "@/lib/inventory/inventory-service";

export interface ItemDetailModalProps {
	item: InventoryItem | null;
	isOpen: boolean;
	onClose: () => void;
	onUse?: (inventoryId: string) => void;
	onDelete?: (inventoryId: string) => void;
}

const getItemIcon = (itemType: string): ReactNode => {
	switch (itemType) {
		case "coin":
			return <Coins className="h-16 w-16 text-yellow-500" />;
		case "gem":
			return <Gem className="h-16 w-16 text-purple-500" />;
		case "boost":
			return <Zap className="h-16 w-16 text-blue-500" />;
		case "cosmetic":
			return <Sparkles className="h-16 w-16 text-pink-500" />;
		default:
			return <Shield className="h-16 w-16 text-slate-400" />;
	}
};

const getRarityColor = (rarity: string) => {
	switch (rarity) {
		case "common":
			return "text-slate-400 border-slate-400";
		case "rare":
			return "text-blue-400 border-blue-400";
		case "epic":
			return "text-purple-400 border-purple-400";
		case "legendary":
			return "text-amber-400 border-amber-400";
		default:
			return "text-slate-400 border-slate-400";
	}
};

export function ItemDetailModal({
	item,
	isOpen,
	onClose,
	onUse,
	onDelete,
}: ItemDetailModalProps) {
	if (!item) return null;

	const canUse = item.item.itemType === "boost" && !item.isUsed;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						{item.item.name}
						<Badge
							variant="outline"
							className={getRarityColor(item.item.rarity)}
						>
							{item.item.rarity.toUpperCase()}
						</Badge>
					</DialogTitle>
					<DialogDescription>
						{item.item.description || "A mysterious item with unknown powers."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Icon */}
					<div className="flex justify-center py-4">
						{getItemIcon(item.item.itemType)}
					</div>

					<Separator />

					{/* Item Details */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-slate-400">Type:</span>
							<span className="text-white capitalize">
								{item.item.itemType}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Quantity:</span>
							<span className="text-white">{item.quantity}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Value:</span>
							<span className="text-white">{item.item.value}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Acquired:</span>
							<span className="text-white">
								{new Date(item.acquiredAt).toLocaleDateString()}
							</span>
						</div>
						{item.isUsed && (
							<div className="flex justify-between">
								<span className="text-slate-400">Status:</span>
								<span className="text-red-400">Used</span>
							</div>
						)}
					</div>

					{/* Type-specific information */}
					{item.item.itemType === "boost" && (
						<div className="rounded-lg bg-blue-900/20 p-3">
							<p className="text-blue-400 text-sm">
								💡 Boost items can be used to enhance your performance in games!
							</p>
						</div>
					)}
					{item.item.itemType === "cosmetic" && (
						<div className="rounded-lg bg-purple-900/20 p-3">
							<p className="text-purple-400 text-sm">
								✨ Cosmetic items let you customize your appearance!
							</p>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					{canUse && onUse && (
						<Button
							variant="default"
							onClick={() => {
								onUse(item.inventoryId);
								onClose();
							}}
						>
							<Zap className="mr-2 h-4 w-4" />
							Use Item
						</Button>
					)}
					{onDelete && (
						<Button
							variant="destructive"
							onClick={() => {
								if (
									window.confirm("Are you sure you want to delete this item?")
								) {
									onDelete(item.inventoryId);
									onClose();
								}
							}}
						>
							Delete
						</Button>
					)}
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ItemDetailModal;
