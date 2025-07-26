import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
	// This `try/catch` block is only here for the interactive tutorial.
	// Feel free to remove once you have Supabase connected.
	try {
		// Create an unmodified response
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return request.cookies.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value }) =>
							request.cookies.set(name, value),
						);
						response = NextResponse.next({
							request,
						});
						cookiesToSet.forEach(({ name, value, options }) => {
							// セキュリティ属性を強制
							const secureOptions = {
								...options,
								httpOnly: true,
								sameSite: "lax" as const,
								secure: process.env.NODE_ENV === "production",
								path: "/",
							};
							response.cookies.set(name, value, secureOptions);
						});
					},
				},
			},
		);

		// This will refresh session if expired - required for Server Components
		// https://supabase.com/docs/guides/auth/server-side/nextjs
		const user = await supabase.auth.getUser();

		// 認証が必要なパスの保護
		const protectedPaths = [
			"/daily-login",
			"/roulette",
			"/mini-game",
			"/inventory",
			"/achievements",
			"/profile",
			"/player-profile",
		];

		const isProtectedPath = protectedPaths.some((path) =>
			request.nextUrl.pathname.startsWith(path),
		);

		if (isProtectedPath && user.error) {
			// 未認証の場合はログインページへリダイレクト
			return NextResponse.redirect(new URL("/login", request.url));
		}

		return response;
	} catch (_e) {
		// If you are here, a Supabase client could not be created!
		// This is likely because you have not set up environment variables.
		// Check out http://localhost:3000 for Next Steps.
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
