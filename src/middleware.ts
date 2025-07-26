import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
	// CSPヘッダーの設定
	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: ${
			process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"
		};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://api.github.com;
  `
		.replace(/\s{2,}/g, " ")
		.trim();

	// セッションの更新とCSPヘッダーの設定を組み合わせる
	const supabaseResponse = await updateSession(request);

	// nonceをヘッダーに追加
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-nonce", nonce);
	requestHeaders.set("Content-Security-Policy", cspHeader);

	// Supabaseのレスポンスがある場合はそれを使用、なければ新しいレスポンスを作成
	const response =
		supabaseResponse ||
		NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});

	// CSPヘッダーを設定
	response.headers.set("Content-Security-Policy", cspHeader);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
