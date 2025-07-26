import type { AppError, ErrorSeverity, ErrorType } from "./types";

export const createError = (
	type: ErrorType,
	message?: string,
	options?: {
		code?: string;
		details?: unknown;
		severity?: ErrorSeverity;
		canRetry?: boolean;
		maxAttempts?: number;
	},
): AppError => {
	return {
		type,
		message: message || getDefaultMessage(type),
		code: options?.code,
		details: options?.details,
		severity: options?.severity || getSeverityForType(type),
		timestamp: new Date(),
		retry: options?.canRetry
			? {
					canRetry: true,
					maxAttempts: options.maxAttempts || 3,
					currentAttempt: 0,
				}
			: undefined,
	};
};

const getDefaultMessage = (type: ErrorType): string => {
	const messages: Record<ErrorType, string> = {
		network: "ネットワークエラーが発生しました",
		auth: "認証エラーが発生しました",
		validation: "入力エラーが発生しました",
		notFound: "リソースが見つかりませんでした",
		rateLimit: "レート制限に達しました",
		serverError: "サーバーエラーが発生しました",
		unknown: "エラーが発生しました",
	};
	return messages[type];
};

const getSeverityForType = (type: ErrorType): ErrorSeverity => {
	const severityMap: Record<ErrorType, ErrorSeverity> = {
		network: "warning",
		auth: "error",
		validation: "warning",
		notFound: "info",
		rateLimit: "warning",
		serverError: "error",
		unknown: "error",
	};
	return severityMap[type];
};

export const isNetworkError = (error: unknown): boolean => {
	if (error instanceof Error) {
		return (
			error.name === "NetworkError" ||
			error.message.toLowerCase().includes("network") ||
			error.message.toLowerCase().includes("fetch")
		);
	}
	return false;
};

export const isAuthError = (error: unknown): boolean => {
	if (error instanceof Error) {
		return (
			error.message.toLowerCase().includes("unauthorized") ||
			error.message.toLowerCase().includes("401") ||
			error.message.toLowerCase().includes("auth")
		);
	}
	return false;
};

export const parseError = (error: unknown): AppError => {
	if (error instanceof Error) {
		if (isNetworkError(error)) {
			return createError("network", error.message, { canRetry: true });
		}
		if (isAuthError(error)) {
			return createError("auth", error.message);
		}
		return createError("unknown", error.message);
	}

	if (typeof error === "string") {
		return createError("unknown", error);
	}

	return createError("unknown", "不明なエラーが発生しました", {
		details: error,
	});
};
