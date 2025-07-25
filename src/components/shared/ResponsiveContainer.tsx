"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
	padding?: "none" | "small" | "medium" | "large";
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

const paddingClasses = {
	none: "",
	small: "px-2 sm:px-4",
	medium: "px-4 sm:px-6 lg:px-8",
	large: "px-4 sm:px-8 lg:px-12",
};

export const ResponsiveContainer = forwardRef<
	HTMLDivElement,
	ResponsiveContainerProps
>(
	(
		{ children, maxWidth = "7xl", padding = "medium", className, ...props },
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					"mx-auto w-full",
					maxWidthClasses[maxWidth],
					paddingClasses[padding],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);

ResponsiveContainer.displayName = "ResponsiveContainer";
