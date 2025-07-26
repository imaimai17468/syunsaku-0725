import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const getDatabaseUrl = () => {
	if (process.env.DATABASE_URL) {
		return process.env.DATABASE_URL;
	}

	if (
		!process.env.NEXT_PUBLIC_SUPABASE_URL ||
		!process.env.SUPABASE_SERVICE_ROLE_KEY
	) {
		throw new Error(
			"Missing Supabase environment variables for database connection",
		);
	}

	const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
	const projectRef = supabaseUrl.hostname.split(".")[0];

	// Supabaseのプーラー接続文字列を構築
	// 注意: この方法は、SUPABASE_SERVICE_ROLE_KEYがある場合のみ機能します
	// 本番環境では、DATABASE_URL環境変数を直接設定することを推奨します
	return `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
};

const connectionString = getDatabaseUrl();

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
