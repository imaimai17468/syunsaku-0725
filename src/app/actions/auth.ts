"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const signOut = async () => {
	const supabase = await createClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		console.error("Error signing out:", error);
	}

	// すべてのキャッシュをクリア
	revalidatePath("/", "layout");

	// ログインページにリダイレクト
	redirect("/login");
};
