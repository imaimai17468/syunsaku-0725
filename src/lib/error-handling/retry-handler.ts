export type RetryOptions = {
	maxAttempts?: number;
	initialDelay?: number;
	maxDelay?: number;
	backoffFactor?: number;
	shouldRetry?: (error: unknown, attempt: number) => boolean;
	onRetry?: (error: unknown, attempt: number) => void;
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxAttempts: 3,
	initialDelay: 1000,
	maxDelay: 30000,
	backoffFactor: 2,
	shouldRetry: () => true,
	onRetry: () => {},
};

export const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

export const calculateDelay = (
	attempt: number,
	initialDelay: number,
	backoffFactor: number,
	maxDelay: number,
): number => {
	const delay = initialDelay * backoffFactor ** (attempt - 1);
	return Math.min(delay, maxDelay);
};

export const withRetry = async <T>(
	fn: () => Promise<T>,
	options?: RetryOptions,
): Promise<T> => {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	let lastError: unknown;

	for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (attempt === opts.maxAttempts || !opts.shouldRetry(error, attempt)) {
				throw error;
			}

			opts.onRetry(error, attempt);

			const delay = calculateDelay(
				attempt,
				opts.initialDelay,
				opts.backoffFactor,
				opts.maxDelay,
			);
			await sleep(delay);
		}
	}

	throw lastError;
};

export const createRetryableFunction = <
	T extends (...args: never[]) => Promise<unknown>,
>(
	fn: T,
	options?: RetryOptions,
): T => {
	return (async (...args: Parameters<T>) => {
		return withRetry(() => fn(...args), options);
	}) as T;
};
