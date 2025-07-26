"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import type { ErrorHandlerOptions } from "@/lib/error-handling";
import { ERROR_MESSAGES, parseError } from "@/lib/error-handling";
import { soundEffects } from "@/lib/notifications";

export const useErrorHandler = () => {
	const router = useRouter();

	const handleError = useCallback(
		(error: unknown, options?: ErrorHandlerOptions) => {
			const appError = parseError(error);
			const {
				showToast = true,
				logToConsole = true,
				redirect,
				fallbackMessage,
				onRetry,
			} = options || {};

			if (logToConsole) {
				console.error("Error handled:", appError);
			}

			if (showToast) {
				const message =
					fallbackMessage || ERROR_MESSAGES[appError.type] || appError.message;

				soundEffects.play("error", 0.3);

				if (appError.retry?.canRetry && onRetry) {
					toast.error(message, {
						action: {
							label: "再試行",
							onClick: () => {
								onRetry();
							},
						},
						duration: 5000,
					});
				} else {
					toast.error(message, {
						duration: 4000,
					});
				}
			}

			if (appError.type === "auth" || redirect === "/login") {
				router.push("/login");
			} else if (redirect) {
				router.push(redirect);
			}

			return appError;
		},
		[router],
	);

	const handleAsyncError = useCallback(
		async <T>(
			fn: () => Promise<T>,
			options?: ErrorHandlerOptions,
		): Promise<T | null> => {
			try {
				return await fn();
			} catch (error) {
				handleError(error, options);
				return null;
			}
		},
		[handleError],
	);

	return {
		handleError,
		handleAsyncError,
	};
};
