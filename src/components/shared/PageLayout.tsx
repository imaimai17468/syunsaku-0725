"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}

const maxWidthClasses = {
	sm: "max-w-screen-sm",
	md: "max-w-screen-md",
	lg: "max-w-screen-lg",
	xl: "max-w-screen-xl",
	"2xl": "max-w-screen-2xl",
	"7xl": "max-w-7xl",
	full: "max-w-full",
};

export const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
	({ children, maxWidth = "7xl", className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4",
					className,
				)}
				{...props}
			>
				<div
					className={cn(
						"mx-auto px-4 sm:px-6 lg:px-8",
						maxWidthClasses[maxWidth],
					)}
				>
					{children}
				</div>
			</div>
		);
	},
);

PageLayout.displayName = "PageLayout";
