import { createClient } from "./supabase/client";
import { getURL } from "./utils/url";

export const signInWithGithub = async () => {
	const supabase = createClient();

	const { error } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			redirectTo: `${getURL()}auth/callback`,
		},
	});

	if (error) {
		console.error("Error signing in with GitHub:", error);
	}
};

export const signInWithGoogle = async () => {
	const supabase = createClient();

	const { error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${getURL()}auth/callback`,
		},
	});

	if (error) {
		console.error("Error signing in with Google:", error);
	}
};

// signOut関数はサーバーアクション（/app/actions/auth.ts）を使用してください
