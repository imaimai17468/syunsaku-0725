import { redirect } from "next/navigation";
import { createError } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";

export const requireAuth = async () => {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw createError("auth", "認証が必要です", {
			code: "AUTH_REQUIRED",
		});
	}

	return user;
};

export const withAuth = async <T>(
	fn: (userId: string) => Promise<T>,
): Promise<T> => {
	try {
		const user = await requireAuth();
		return await fn(user.id);
	} catch (error) {
		const appError = error as ReturnType<typeof createError>;
		if (appError.type === "auth") {
			redirect("/login");
		}
		throw error;
	}
};
