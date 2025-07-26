import { z } from "zod";
import { createError } from "@/lib/error-handling";

// 基本的なバリデーションスキーマ
export const securitySchemas = {
	// UUID形式のID
	uuid: z.string().uuid({
		message: "無効なID形式です",
	}),

	// ユーザー名（英数字とアンダースコアのみ）
	username: z
		.string()
		.min(3, "ユーザー名は3文字以上で入力してください")
		.max(20, "ユーザー名は20文字以内で入力してください")
		.regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ使用できます"),

	// メールアドレス
	email: z.string().email("有効なメールアドレスを入力してください"),

	// 数値（正の整数のみ）
	positiveInt: z.number().int().positive({
		message: "正の整数を入力してください",
	}),

	// 日付文字列（YYYY-MM-DD形式）
	dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
		message: "日付はYYYY-MM-DD形式で入力してください",
	}),

	// ページネーション
	pagination: z.object({
		page: z.number().int().min(1).default(1),
		limit: z.number().int().min(1).max(100).default(20),
	}),
};

// HTML/SQLインジェクション対策のためのサニタイゼーション
export const sanitize = {
	// HTMLエスケープ
	html: (input: string): string => {
		const htmlEscapes: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#x27;",
			"/": "&#x2F;",
		};

		return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
	},

	// SQLライクな文字列のエスケープ（LIKE句用）
	sqlLike: (input: string): string => {
		return input.replace(/[%_\\]/g, "\\$&");
	},

	// ファイル名のサニタイゼーション
	filename: (input: string): string => {
		// 危険な文字を除去
		return input
			.replace(/[^a-zA-Z0-9._-]/g, "_")
			.replace(/\.{2,}/g, "_")
			.substring(0, 255);
	},

	// URLパスのサニタイゼーション
	urlPath: (input: string): string => {
		// パストラバーサル攻撃を防ぐ
		return input
			.replace(/\.\./g, "")
			.replace(/\/\//g, "/")
			.replace(/[^a-zA-Z0-9/_-]/g, "");
	},
};

// 入力検証ヘルパー
export const validateInput = <T>(
	schema: z.ZodSchema<T>,
	input: unknown,
	options?: {
		sanitize?: boolean;
		errorMessage?: string;
	},
): T => {
	try {
		// 文字列の場合はトリミング
		if (typeof input === "string" && options?.sanitize !== false) {
			input = input.trim();
		}

		// オブジェクトの場合は各文字列フィールドをトリミング
		if (
			typeof input === "object" &&
			input !== null &&
			options?.sanitize !== false
		) {
			const sanitized = { ...input };
			for (const [key, value] of Object.entries(sanitized)) {
				if (typeof value === "string") {
					(sanitized as Record<string, unknown>)[key] = value.trim();
				}
			}
			input = sanitized;
		}

		return schema.parse(input);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw createError(
				"validation",
				options?.errorMessage || "入力値が不正です",
				{
					code: "INVALID_INPUT",
					details: error.issues,
				},
			);
		}
		throw error;
	}
};

// 配列の重複チェック
export const hasDuplicates = <T>(array: T[]): boolean => {
	return new Set(array).size !== array.length;
};

// 安全な数値変換
export const safeParseInt = (
	value: string | number,
	options?: {
		min?: number;
		max?: number;
		default?: number;
	},
): number => {
	const parsed = typeof value === "string" ? Number.parseInt(value, 10) : value;

	if (Number.isNaN(parsed)) {
		if (options?.default !== undefined) {
			return options.default;
		}
		throw createError("validation", "数値に変換できません", {
			code: "INVALID_NUMBER",
		});
	}

	if (options?.min !== undefined && parsed < options.min) {
		throw createError(
			"validation",
			`${options.min}以上の値を入力してください`,
			{
				code: "NUMBER_TOO_SMALL",
			},
		);
	}

	if (options?.max !== undefined && parsed > options.max) {
		throw createError(
			"validation",
			`${options.max}以下の値を入力してください`,
			{
				code: "NUMBER_TOO_LARGE",
			},
		);
	}

	return parsed;
};
