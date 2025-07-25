"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	claimDailyLoginBonus,
	getUserLoginStatus,
} from "@/app/actions/daily-login";
import { LoginBonusModal } from "@/components/features/daily-login/LoginBonusModal";
import { LoginStreakDisplay } from "@/components/features/daily-login/LoginStreakDisplay";
import { RPGCard } from "@/components/shared/RpgCard";

interface LoginStatus {
	hasLoggedInToday: boolean;
	currentStreak: number;
	canClaimBonus: boolean;
	longestStreak: number;
	totalLoginDays: number;
}

interface BonusResult {
	rewards: {
		coins: number;
		exp: number;
		specialReward?: {
			itemId: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		};
	};
	streakInfo: {
		currentStreak: number;
		isNewDay: boolean;
		streakBroken: boolean;
		bonusMultiplier: number;
	};
	levelUp?:
		| {
				previousLevel: number;
				currentLevel: number;
				rewards: Array<{
					level: number;
					rewardType: string;
					rewardName: string;
					rewardDescription?: string;
				}>;
		  }
		| {
				newLevel: number;
				leveledUp: boolean;
		  };
}

export default function DailyLoginPage() {
	const [loginStatus, setLoginStatus] = useState<LoginStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showBonusModal, setShowBonusModal] = useState(false);
	const [bonusResult, setBonusResult] = useState<BonusResult | null>(null);

	const fetchLoginStatus = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getUserLoginStatus();

			if (result.success && result.data) {
				setLoginStatus(result.data);
				setError(null);
			} else {
				setError(result.error || "Failed to fetch login status");
			}
		} catch (err) {
			setError("An unexpected error occurred");
			console.error("Error fetching login status:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleClaimBonus = async () => {
		if (!loginStatus?.canClaimBonus) return;

		try {
			const result = await claimDailyLoginBonus();

			if (result.success && result.streakInfo && result.rewards) {
				setBonusResult({
					rewards: result.rewards,
					streakInfo: result.streakInfo,
					levelUp: result.levelUp,
				});
				setShowBonusModal(true);

				// Update login status
				await fetchLoginStatus();
			} else {
				setError(result.error || "Failed to claim bonus");
			}
		} catch (err) {
			setError("An unexpected error occurred while claiming bonus");
			console.error("Error claiming bonus:", err);
		}
	};

	useEffect(() => {
		fetchLoginStatus();
	}, [fetchLoginStatus]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<RPGCard className="text-center">
					<Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
					<p className="text-slate-300">Loading your login status...</p>
				</RPGCard>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
				<RPGCard className="max-w-md border-red-500 bg-red-900/20 text-center">
					<h2 className="mb-4 font-bold text-red-300 text-xl">Error</h2>
					<p className="mb-4 text-red-200">{error}</p>
					<button
						type="button"
						onClick={fetchLoginStatus}
						className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Try Again
					</button>
				</RPGCard>
			</div>
		);
	}

	if (!loginStatus) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
				<RPGCard className="text-center">
					<p className="text-slate-300">No login data available</p>
				</RPGCard>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div className="mb-6 text-center sm:mb-8">
					<h1 className="mb-2 font-bold text-3xl text-white sm:text-4xl">
						Daily Login Rewards
					</h1>
					<p className="text-slate-400 text-sm sm:text-base">
						Keep your streak alive and earn amazing rewards!
					</p>
				</div>

				<LoginStreakDisplay
					currentStreak={loginStatus.currentStreak}
					longestStreak={loginStatus.longestStreak}
					totalLoginDays={loginStatus.totalLoginDays}
					hasLoggedInToday={loginStatus.hasLoggedInToday}
					canClaimBonus={loginStatus.canClaimBonus}
					onClaimBonus={handleClaimBonus}
					loading={loading}
				/>

				{/* Bonus Modal */}
				{showBonusModal && bonusResult && (
					<LoginBonusModal
						isOpen={showBonusModal}
						onClose={() => setShowBonusModal(false)}
						rewards={bonusResult.rewards}
						streakInfo={bonusResult.streakInfo}
						levelUp={bonusResult.levelUp}
					/>
				)}
			</div>
		</div>
	);
}
