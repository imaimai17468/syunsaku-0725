"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
	message?: string;
	fullScreen?: boolean;
	className?: string;
}

export function LoadingOverlay({
	message = "読み込み中...",
	fullScreen = false,
	className,
}: LoadingOverlayProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center bg-slate-900/80 backdrop-blur-sm",
				fullScreen ? "fixed inset-0 z-50" : "absolute inset-0 rounded-lg",
				className,
			)}
		>
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
				<p className="font-medium text-slate-300">{message}</p>
			</div>
		</div>
	);
}
