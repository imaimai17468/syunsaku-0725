import { toast } from "sonner";

interface ToastOptions {
	icon?: string;
	duration?: number;
}

export const showRewardToast = (message: string, options?: ToastOptions) => {
	toast.success(message, {
		icon: options?.icon || "🎁",
		duration: options?.duration || 4000,
		className: "bg-gradient-to-r from-amber-900 to-amber-800 border-amber-600",
		description: "報酬を獲得しました！",
		style: {
			background: "linear-gradient(to right, rgb(120 53 15), rgb(146 64 14))",
			border: "1px solid rgb(217 119 6)",
			color: "rgb(254 243 199)",
		},
	});
};

export const showLevelUpToast = (level: number, options?: ToastOptions) => {
	toast.success(`レベル ${level} に到達！`, {
		icon: options?.icon || "⭐",
		duration: options?.duration || 5000,
		className:
			"bg-gradient-to-r from-purple-900 to-purple-800 border-purple-600",
		description: "おめでとうございます！",
		style: {
			background: "linear-gradient(to right, rgb(88 28 135), rgb(107 33 168))",
			border: "1px solid rgb(147 51 234)",
			color: "rgb(243 232 255)",
		},
	});
};

export const showAchievementToast = (title: string, options?: ToastOptions) => {
	toast.success(title, {
		icon: options?.icon || "🏆",
		duration: options?.duration || 5000,
		className: "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600",
		description: "実績を達成しました！",
		style: {
			background: "linear-gradient(to right, rgb(30 58 138), rgb(29 78 216))",
			border: "1px solid rgb(37 99 235)",
			color: "rgb(219 234 254)",
		},
	});
};

export const showStreakToast = (streak: number, options?: ToastOptions) => {
	toast.success(`${streak}日連続ログイン達成！`, {
		icon: options?.icon || "🔥",
		duration: options?.duration || 4000,
		className:
			"bg-gradient-to-r from-orange-900 to-orange-800 border-orange-600",
		description: "素晴らしい継続力です！",
		style: {
			background: "linear-gradient(to right, rgb(124 45 18), rgb(154 52 18))",
			border: "1px solid rgb(234 88 12)",
			color: "rgb(255 237 213)",
		},
	});
};

export const showItemToast = (
	itemName: string,
	rarity: "common" | "rare" | "epic" | "legendary",
	options?: ToastOptions,
) => {
	const rarityConfig = {
		common: {
			icon: "📦",
			gradient: "from-slate-900 to-slate-800",
			border: "border-slate-600",
			style: {
				background: "linear-gradient(to right, rgb(15 23 42), rgb(30 41 59))",
				border: "1px solid rgb(71 85 105)",
				color: "rgb(226 232 240)",
			},
		},
		rare: {
			icon: "💎",
			gradient: "from-blue-900 to-blue-800",
			border: "border-blue-600",
			style: {
				background: "linear-gradient(to right, rgb(30 58 138), rgb(29 78 216))",
				border: "1px solid rgb(37 99 235)",
				color: "rgb(219 234 254)",
			},
		},
		epic: {
			icon: "✨",
			gradient: "from-purple-900 to-purple-800",
			border: "border-purple-600",
			style: {
				background:
					"linear-gradient(to right, rgb(88 28 135), rgb(107 33 168))",
				border: "1px solid rgb(147 51 234)",
				color: "rgb(243 232 255)",
			},
		},
		legendary: {
			icon: "🌟",
			gradient: "from-amber-900 to-amber-800",
			border: "border-amber-600",
			style: {
				background: "linear-gradient(to right, rgb(120 53 15), rgb(146 64 14))",
				border: "1px solid rgb(217 119 6)",
				color: "rgb(254 243 199)",
			},
		},
	};

	const config = rarityConfig[rarity];

	toast.success(`${itemName} を獲得！`, {
		icon: options?.icon || config.icon,
		duration: options?.duration || 4000,
		className: `bg-gradient-to-r ${config.gradient} ${config.border}`,
		description: `${rarity.toUpperCase()} アイテム`,
		style: config.style,
	});
};
