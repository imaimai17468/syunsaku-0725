export type ErrorType =
	| "network"
	| "auth"
	| "validation"
	| "notFound"
	| "rateLimit"
	| "serverError"
	| "unknown";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export type AppError = {
	type: ErrorType;
	message: string;
	code?: string;
	details?: unknown;
	severity: ErrorSeverity;
	timestamp: Date;
	retry?: {
		canRetry: boolean;
		maxAttempts?: number;
		currentAttempt?: number;
		nextRetryAt?: Date;
	};
};

export type ErrorHandlerOptions = {
	showToast?: boolean;
	logToConsole?: boolean;
	redirect?: string;
	fallbackMessage?: string;
	onRetry?: () => Promise<void>;
};

export const ERROR_MESSAGES: Record<ErrorType, string> = {
	network:
		"ネットワーク接続に問題があります。しばらくしてから再度お試しください。",
	auth: "認証エラーが発生しました。再度ログインしてください。",
	validation: "入力内容に誤りがあります。確認して再度お試しください。",
	notFound: "お探しのページが見つかりませんでした。",
	rateLimit: "アクセスが制限されています。しばらくしてから再度お試しください。",
	serverError:
		"サーバーエラーが発生しました。しばらくしてから再度お試しください。",
	unknown: "予期しないエラーが発生しました。",
};

export const ERROR_CODES = {
	NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
	NETWORK_OFFLINE: "NETWORK_OFFLINE",
	AUTH_EXPIRED: "AUTH_EXPIRED",
	AUTH_INVALID: "AUTH_INVALID",
	VALIDATION_FAILED: "VALIDATION_FAILED",
	NOT_FOUND: "NOT_FOUND",
	RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
	SERVER_ERROR: "SERVER_ERROR",
} as const;
