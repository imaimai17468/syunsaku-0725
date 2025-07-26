import { z } from "zod";
import { createError } from "@/lib/error-handling";

export const safeParse = <T>(
	schema: z.ZodSchema<T>,
	data: unknown,
	options?: {
		errorMessage?: string;
		context?: string;
	},
): T => {
	try {
		return schema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const details = error.issues.map((e: z.ZodIssue) => ({
				path: e.path.join("."),
				message: e.message,
			}));

			throw createError(
				"validation",
				options?.errorMessage || "データの検証に失敗しました",
				{
					code: "VALIDATION_FAILED",
					details: {
						context: options?.context,
						errors: details,
						originalError: error,
					},
				},
			);
		}
		throw error;
	}
};

export const safeParseAsync = async <T>(
	schema: z.ZodSchema<T>,
	data: unknown,
	options?: {
		errorMessage?: string;
		context?: string;
	},
): Promise<T> => {
	try {
		return await schema.parseAsync(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const details = error.issues.map((e: z.ZodIssue) => ({
				path: e.path.join("."),
				message: e.message,
			}));

			throw createError(
				"validation",
				options?.errorMessage || "データの検証に失敗しました",
				{
					code: "VALIDATION_FAILED",
					details: {
						context: options?.context,
						errors: details,
						originalError: error,
					},
				},
			);
		}
		throw error;
	}
};
