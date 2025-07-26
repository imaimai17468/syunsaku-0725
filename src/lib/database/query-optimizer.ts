import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type BatchQueryOptions = {
	parallel?: boolean;
	timeout?: number;
};

export const batchQuery = async <
	T extends Record<string, () => Promise<unknown>>,
>(
	queries: T,
	options?: BatchQueryOptions,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> => {
	const { parallel = true, timeout = 10000 } = options || {};

	if (parallel) {
		// 並列実行
		const entries = Object.entries(queries);
		const promises = entries.map(async ([key, queryFn]) => {
			try {
				const result = await Promise.race([
					queryFn(),
					new Promise((_, reject) =>
						setTimeout(
							() => reject(new Error(`Query ${key} timed out`)),
							timeout,
						),
					),
				]);
				return [key, result];
			} catch (error) {
				console.error(`Query ${key} failed:`, error);
				return [key, null];
			}
		});

		const results = await Promise.all(promises);
		return Object.fromEntries(results) as {
			[K in keyof T]: Awaited<ReturnType<T[K]>>;
		};
	} else {
		// 順次実行
		const results: Record<string, unknown> = {};
		for (const [key, queryFn] of Object.entries(queries)) {
			try {
				results[key] = await queryFn();
			} catch (error) {
				console.error(`Query ${key} failed:`, error);
				results[key] = null;
			}
		}
		return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
	}
};

type TableNames = keyof Database["public"]["Tables"];

export const createOptimizedFetch = <T>(
	tableName: TableNames,
	selectColumns?: string[],
) => {
	return async (
		filters: Record<string, unknown>,
		options?: {
			limit?: number;
			orderBy?: { column: string; ascending?: boolean };
			single?: boolean;
		},
	): Promise<T | T[] | null> => {
		const supabase = await createClient();

		let query = supabase
			.from(tableName)
			.select(selectColumns ? selectColumns.join(",") : "*");

		// フィルター適用
		Object.entries(filters).forEach(([column, value]) => {
			if (value !== undefined && value !== null) {
				query = query.eq(column, value);
			}
		});

		// オプション適用
		if (options?.orderBy) {
			query = query.order(options.orderBy.column, {
				ascending: options.orderBy.ascending ?? true,
			});
		}

		if (options?.limit) {
			query = query.limit(options.limit);
		}

		// 実行
		if (options?.single) {
			const { data, error } = await query.single();
			if (error) throw error;
			return data as T;
		} else {
			const { data, error } = await query;
			if (error) throw error;
			return data as T[];
		}
	};
};
