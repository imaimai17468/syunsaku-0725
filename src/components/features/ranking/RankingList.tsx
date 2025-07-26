"use client";

import { Crown, Medal } from "lucide-react";
import { RPGCard } from "@/components/shared/RpgCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RankingUser } from "@/entities/ranking";
import { cn } from "@/lib/utils";

type RankingListProps = {
	users: RankingUser[];
	currentUserId?: string;
	scoreLabel: string;
	formatScore?: (score: number) => string;
};

export const RankingList = ({
	users,
	currentUserId,
	scoreLabel,
	formatScore = (score) => score.toLocaleString(),
}: RankingListProps) => {
	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Crown className="h-5 w-5 text-amber-400" />;
			case 2:
				return <Medal className="h-5 w-5 text-gray-300" />;
			case 3:
				return <Medal className="h-5 w-5 text-amber-600" />;
			default:
				return null;
		}
	};

	const getRankVariant = (rank: number) => {
		switch (rank) {
			case 1:
				return "legendary";
			case 2:
				return "epic";
			case 3:
				return "rare";
			default:
				return "default";
		}
	};

	return (
		<div className="space-y-3">
			{users.map((user) => {
				const isCurrentUser = user.userId === currentUserId;
				const variant = getRankVariant(user.rank);

				return (
					<RPGCard
						key={user.userId}
						variant={variant}
						className={cn(
							"transition-all duration-300",
							isCurrentUser &&
								"ring-2 ring-blue-500 ring-offset-2 ring-offset-black",
						)}
					>
						<div className="flex items-center gap-4">
							{/* ランク */}
							<div className="flex min-w-[60px] items-center justify-center">
								{getRankIcon(user.rank) || (
									<span className="font-bold text-gray-400 text-xl">
										{user.rank}
									</span>
								)}
							</div>

							{/* アバター */}
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={user.avatarUrl || undefined}
									alt={user.name}
								/>
								<AvatarFallback>
									{user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>

							{/* ユーザー情報 */}
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<p className="font-semibold text-white">{user.name}</p>
									{isCurrentUser && (
										<span className="rounded-full bg-blue-500/20 px-2 py-0.5 font-medium text-blue-400 text-xs">
											You
										</span>
									)}
								</div>
								<p className="text-gray-400 text-sm">{scoreLabel}</p>
							</div>

							{/* スコア */}
							<div className="text-right">
								<p className="font-bold text-white text-xl">
									{formatScore(user.score)}
								</p>
							</div>
						</div>
					</RPGCard>
				);
			})}
		</div>
	);
};
