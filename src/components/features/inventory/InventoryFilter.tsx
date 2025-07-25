"use client";

import { useId } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { RewardItem } from "@/entities/reward-item";

interface InventoryFilterProps {
	onFilterChange: (filter: {
		rarity?: RewardItem["rarity"];
		type?: RewardItem["itemType"];
		showUsed?: boolean;
	}) => void;
	stats?: {
		itemsByRarity: {
			common: number;
			rare: number;
			epic: number;
			legendary: number;
		};
		itemsByType: {
			coin: number;
			gem: number;
			boost: number;
			cosmetic: number;
		};
	};
}

export function InventoryFilter({
	onFilterChange,
	stats,
}: InventoryFilterProps) {
	const showUsedId = useId();

	const handleRarityChange = (value: string) => {
		if (value === "all") {
			onFilterChange({ rarity: undefined });
		} else {
			onFilterChange({ rarity: value as RewardItem["rarity"] });
		}
	};

	const handleTypeChange = (value: string) => {
		if (value === "all") {
			onFilterChange({ type: undefined });
		} else {
			onFilterChange({ type: value as RewardItem["itemType"] });
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4">
				{/* Rarity Filter */}
				<div className="space-y-2">
					<Label>Filter by Rarity</Label>
					<Select onValueChange={handleRarityChange} defaultValue="all">
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Rarities" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Rarities</SelectItem>
							<SelectItem value="common">
								Common {stats && `(${stats.itemsByRarity.common})`}
							</SelectItem>
							<SelectItem value="rare">
								Rare {stats && `(${stats.itemsByRarity.rare})`}
							</SelectItem>
							<SelectItem value="epic">
								Epic {stats && `(${stats.itemsByRarity.epic})`}
							</SelectItem>
							<SelectItem value="legendary">
								Legendary {stats && `(${stats.itemsByRarity.legendary})`}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Type Filter */}
				<div className="space-y-2">
					<Label>Filter by Type</Label>
					<Select onValueChange={handleTypeChange} defaultValue="all">
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="coin">
								Coins {stats && `(${stats.itemsByType.coin})`}
							</SelectItem>
							<SelectItem value="gem">
								Gems {stats && `(${stats.itemsByType.gem})`}
							</SelectItem>
							<SelectItem value="boost">
								Boosts {stats && `(${stats.itemsByType.boost})`}
							</SelectItem>
							<SelectItem value="cosmetic">
								Cosmetics {stats && `(${stats.itemsByType.cosmetic})`}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Show Used Toggle */}
				<div className="flex items-center space-x-2">
					<Switch
						id={showUsedId}
						onCheckedChange={(checked) => onFilterChange({ showUsed: checked })}
					/>
					<Label htmlFor={showUsedId}>Show used items</Label>
				</div>
			</div>

			{/* Quick Filters */}
			{stats && (
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onFilterChange({ rarity: "legendary" })}
					>
						<Badge className="mr-2 border-amber-500 bg-amber-900/20 text-amber-400">
							{stats.itemsByRarity.legendary}
						</Badge>
						Legendary
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onFilterChange({ rarity: "epic" })}
					>
						<Badge className="mr-2 border-purple-500 bg-purple-900/20 text-purple-400">
							{stats.itemsByRarity.epic}
						</Badge>
						Epic
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onFilterChange({ type: "boost" })}
					>
						<Badge className="mr-2 border-blue-500 bg-blue-900/20 text-blue-400">
							{stats.itemsByType.boost}
						</Badge>
						Boosts
					</Button>
				</div>
			)}
		</div>
	);
}
