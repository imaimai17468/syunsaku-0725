export type GameState = "idle" | "ready" | "waiting" | "active" | "finished";

export interface ClickGameData {
	state: GameState;
	startTime: number | null;
	reactionTime: number | null;
	score: number;
	round: number;
	totalRounds: number;
	history: number[];
}

export interface GameConfig {
	totalRounds: number;
	minWaitTime: number; // ミリ秒
	maxWaitTime: number; // ミリ秒
	maxReactionTime: number; // ミリ秒（これ以上かかったら0点）
}

const DEFAULT_CONFIG: GameConfig = {
	totalRounds: 5,
	minWaitTime: 1000,
	maxWaitTime: 4000,
	maxReactionTime: 1000,
};

export const createInitialGameData = (
	config?: Partial<GameConfig>,
): ClickGameData => {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };
	return {
		state: "idle",
		startTime: null,
		reactionTime: null,
		score: 0,
		round: 0,
		totalRounds: finalConfig.totalRounds,
		history: [],
	};
};

export const startGame = (data: ClickGameData): ClickGameData => {
	return {
		...data,
		state: "ready",
		round: 1,
		score: 0,
		history: [],
		reactionTime: null,
		startTime: null,
	};
};

export const startRound = (data: ClickGameData): ClickGameData => {
	return {
		...data,
		state: "waiting",
		reactionTime: null,
		startTime: null,
	};
};

export const activateTarget = (data: ClickGameData): ClickGameData => {
	return {
		...data,
		state: "active",
		startTime: Date.now(),
	};
};

export const recordClick = (data: ClickGameData): ClickGameData => {
	if (data.state !== "active" || !data.startTime) {
		return data;
	}

	const reactionTime = Date.now() - data.startTime;
	const roundScore = calculateScore(reactionTime);
	const newHistory = [...data.history, reactionTime];
	const newScore = data.score + roundScore;

	const isLastRound = data.round >= data.totalRounds;

	return {
		...data,
		state: isLastRound ? "finished" : "ready",
		reactionTime,
		score: newScore,
		round: isLastRound ? data.round : data.round + 1,
		history: newHistory,
	};
};

export const calculateScore = (reactionTime: number): number => {
	const { maxReactionTime } = DEFAULT_CONFIG;

	if (reactionTime >= maxReactionTime) {
		return 0;
	}

	// 反応時間が短いほど高得点
	// 100ms以下: 1000点
	// 200ms: 900点
	// 300ms: 800点
	// ...
	// 1000ms以上: 0点
	if (reactionTime <= 100) {
		return 1000;
	}

	const score = Math.max(
		0,
		1000 - Math.floor((reactionTime - 100) / 100) * 100,
	);
	return score;
};

export const getWaitTime = (config?: Partial<GameConfig>): number => {
	const { minWaitTime, maxWaitTime } = { ...DEFAULT_CONFIG, ...config };
	return Math.random() * (maxWaitTime - minWaitTime) + minWaitTime;
};

export const calculateAverageReactionTime = (history: number[]): number => {
	if (history.length === 0) return 0;
	const sum = history.reduce((acc, time) => acc + time, 0);
	return Math.round(sum / history.length);
};

export const getRank = (score: number, rounds: number): string => {
	const averageScore = score / rounds;

	if (averageScore >= 900) return "S";
	if (averageScore >= 800) return "A";
	if (averageScore >= 700) return "B";
	if (averageScore >= 600) return "C";
	if (averageScore >= 500) return "D";
	return "F";
};

export const getRankColor = (rank: string): string => {
	switch (rank) {
		case "S":
			return "text-amber-500";
		case "A":
			return "text-purple-500";
		case "B":
			return "text-blue-500";
		case "C":
			return "text-green-500";
		case "D":
			return "text-orange-500";
		case "F":
			return "text-red-500";
		default:
			return "text-slate-500";
	}
};

export const getScoreMessage = (rank: string): string => {
	switch (rank) {
		case "S":
			return "Legendary reflexes! You're a true gaming master!";
		case "A":
			return "Excellent performance! Your reflexes are sharp!";
		case "B":
			return "Great job! You have good reflexes!";
		case "C":
			return "Not bad! Keep practicing to improve!";
		case "D":
			return "You can do better! Try again!";
		case "F":
			return "Don't give up! Practice makes perfect!";
		default:
			return "Keep trying!";
	}
};
