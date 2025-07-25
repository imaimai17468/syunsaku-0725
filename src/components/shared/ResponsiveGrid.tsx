"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	columns?: {
		mobile?: 1 | 2;
		tablet?: 2 | 3 | 4;
		desktop?: 2 | 3 | 4 | 5 | 6;
	};
	gap?: "small" | "medium" | "large";
}

const gapClasses = {
	small: "gap-2 sm:gap-3 lg:gap-4",
	medium: "gap-3 sm:gap-4 lg:gap-6",
	large: "gap-4 sm:gap-6 lg:gap-8",
};

const getColumnClasses = (columns: ResponsiveGridProps["columns"]) => {
	const mobile = columns?.mobile || 1;
	const tablet = columns?.tablet || 2;
	const desktop = columns?.desktop || 3;

	const mobileClass = mobile === 1 ? "grid-cols-1" : "grid-cols-2";
	const tabletClass = `sm:grid-cols-${tablet}`;
	const desktopClass = `lg:grid-cols-${desktop}`;

	return `${mobileClass} ${tabletClass} ${desktopClass}`;
};

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
	({ children, columns, gap = "medium", className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"grid",
					getColumnClasses(columns),
					gapClasses[gap],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);

ResponsiveGrid.displayName = "ResponsiveGrid";
