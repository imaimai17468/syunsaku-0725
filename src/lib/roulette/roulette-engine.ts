export interface RouletteReward {
	id: string;
	name: string;
	rarity: "common" | "rare" | "epic" | "legendary";
	probability: number; // 0-100の確率
	coins?: number;
	exp?: number;
	itemId?: string;
	icon?: string;
}

export interface RouletteResult {
	reward: RouletteReward;
	spinAngle: number; // 回転角度（度）
	spinDuration: number; // 回転時間（ミリ秒）
}

// デフォルトのルーレット報酬設定
export const DEFAULT_ROULETTE_REWARDS: RouletteReward[] = [
	{
		id: "coins-small",
		name: "50 Coins",
		rarity: "common",
		probability: 30,
		coins: 50,
		icon: "🪙",
	},
	{
		id: "coins-medium",
		name: "100 Coins",
		rarity: "common",
		probability: 25,
		coins: 100,
		icon: "🪙",
	},
	{
		id: "exp-small",
		name: "25 EXP",
		rarity: "common",
		probability: 20,
		exp: 25,
		icon: "⭐",
	},
	{
		id: "coins-large",
		name: "200 Coins",
		rarity: "rare",
		probability: 15,
		coins: 200,
		icon: "💰",
	},
	{
		id: "exp-medium",
		name: "75 EXP",
		rarity: "rare",
		probability: 7,
		exp: 75,
		icon: "✨",
	},
	{
		id: "rare-chest",
		name: "Rare Chest",
		rarity: "epic",
		probability: 2.5,
		itemId: "rare-chest",
		icon: "📦",
	},
	{
		id: "legendary-chest",
		name: "Legendary Chest",
		rarity: "legendary",
		probability: 0.5,
		itemId: "legendary-chest",
		icon: "🎁",
	},
];

/**
 * ルーレットの抽選を実行
 */
export function spinRoulette(
	rewards: RouletteReward[] = DEFAULT_ROULETTE_REWARDS,
	seed?: number,
): RouletteResult {
	// 確率の合計を確認
	const totalProbability = rewards.reduce(
		(sum, reward) => sum + reward.probability,
		0,
	);
	if (Math.abs(totalProbability - 100) > 0.01) {
		console.warn(`Total probability is ${totalProbability}, should be 100`);
	}

	// 乱数生成（シード指定可能）
	const random = seed !== undefined ? seededRandom(seed) : Math.random();
	const roll = random * 100;

	// 累積確率で当選報酬を決定
	let cumulativeProbability = 0;
	let selectedReward = rewards[0]; // フォールバック

	for (const reward of rewards) {
		cumulativeProbability += reward.probability;
		if (roll <= cumulativeProbability) {
			selectedReward = reward;
			break;
		}
	}

	// 回転角度を計算（報酬の位置に合わせる）
	const rewardIndex = rewards.indexOf(selectedReward);
	const segmentAngle = 360 / rewards.length;
	const targetAngle = rewardIndex * segmentAngle;

	// 複数回転 + ランダムな追加回転で演出効果
	const baseRotations = 3 + Math.floor(Math.random() * 3); // 3-5回転
	const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8); // セグメント内でのランダム位置
	const finalAngle = baseRotations * 360 + targetAngle + randomOffset;

	// 回転時間（レアリティに応じて調整）
	const baseDuration = 3000; // 3秒
	const rarityMultiplier = {
		common: 1,
		rare: 1.2,
		epic: 1.5,
		legendary: 2,
	};
	const spinDuration = baseDuration * rarityMultiplier[selectedReward.rarity];

	return {
		reward: selectedReward,
		spinAngle: finalAngle,
		spinDuration,
	};
}

/**
 * シード値を使った疑似乱数生成
 */
function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * ルーレットの報酬を角度順にソート
 */
export function sortRewardsByAngle(
	rewards: RouletteReward[],
): RouletteReward[] {
	// レアリティと確率を考慮してバランス良く配置
	const sorted = [...rewards];

	// レアな報酬を均等に分散させる
	const legendary = sorted.filter((r) => r.rarity === "legendary");
	const epic = sorted.filter((r) => r.rarity === "epic");
	const rare = sorted.filter((r) => r.rarity === "rare");
	const common = sorted.filter((r) => r.rarity === "common");

	const result: RouletteReward[] = [];
	const totalSlots = rewards.length;

	// 各レアリティを均等に配置
	for (let i = 0; i < totalSlots; i++) {
		if (i < legendary.length) {
			result.push(legendary[i]);
		} else if (i < legendary.length + epic.length) {
			result.push(epic[i - legendary.length]);
		} else if (i < legendary.length + epic.length + rare.length) {
			result.push(rare[i - legendary.length - epic.length]);
		} else {
			result.push(common[i - legendary.length - epic.length - rare.length]);
		}
	}

	return result;
}

/**
 * 今日の日付をシードとして使用（日替わりで結果が変わる）
 */
export function getTodaySeed(): number {
	const today = new Date();
	const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
	return dateString
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
