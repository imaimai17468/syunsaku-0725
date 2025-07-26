import { createError, isNetworkError, withRetry } from "@/lib/error-handling";

export type FetchWithRetryOptions = RequestInit & {
	maxAttempts?: number;
	retryDelay?: number;
	timeout?: number;
};

const DEFAULT_TIMEOUT = 30000; // 30秒

export const fetchWithTimeout = async (
	url: string,
	options: RequestInit & { timeout?: number },
): Promise<Response> => {
	const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...fetchOptions,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw createError("network", "リクエストがタイムアウトしました", {
				code: "NETWORK_TIMEOUT",
				canRetry: true,
			});
		}
		throw error;
	}
};

export const fetchWithRetry = async (
	url: string,
	options?: FetchWithRetryOptions,
): Promise<Response> => {
	const { maxAttempts = 3, retryDelay = 1000, ...fetchOptions } = options || {};

	return withRetry(
		async () => {
			const response = await fetchWithTimeout(url, fetchOptions);

			if (!response.ok) {
				if (response.status === 401) {
					throw createError("auth", "認証が必要です", {
						code: "AUTH_REQUIRED",
					});
				}

				if (response.status === 429) {
					throw createError("rateLimit", "レート制限に達しました", {
						code: "RATE_LIMIT_EXCEEDED",
						canRetry: true,
					});
				}

				if (response.status >= 500) {
					throw createError(
						"serverError",
						`サーバーエラー: ${response.status}`,
						{
							code: `SERVER_ERROR_${response.status}`,
							canRetry: true,
						},
					);
				}

				throw createError("unknown", `HTTPエラー: ${response.status}`, {
					code: `HTTP_ERROR_${response.status}`,
				});
			}

			return response;
		},
		{
			maxAttempts,
			initialDelay: retryDelay,
			shouldRetry: (error) => {
				const appError = error as ReturnType<typeof createError>;
				return (
					isNetworkError(error) ||
					appError.retry?.canRetry === true ||
					appError.type === "serverError"
				);
			},
			onRetry: (error, attempt) => {
				console.log(`リトライ ${attempt}/${maxAttempts}:`, error);
			},
		},
	);
};

export const apiRequest = async <T>(
	url: string,
	options?: FetchWithRetryOptions,
): Promise<T> => {
	const response = await fetchWithRetry(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	const contentType = response.headers.get("content-type");
	if (contentType?.includes("application/json")) {
		return response.json() as Promise<T>;
	}

	throw createError("validation", "レスポンスがJSON形式ではありません", {
		code: "INVALID_RESPONSE_FORMAT",
	});
};
