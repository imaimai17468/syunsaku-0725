import type { MotionProps } from "framer-motion";

export const GPU_ACCELERATED_PROPS = {
	transformTemplate: ({
		x,
		y,
		scale,
	}: {
		x?: string;
		y?: string;
		scale?: number;
	}) => `translate3d(${x || 0}, ${y || 0}, 0) scale(${scale || 1})`,
};

export const PERFORMANCE_TRANSITION = {
	type: "spring" as const,
	damping: 25,
	stiffness: 300,
	mass: 0.5,
};

export const createGPUAcceleratedAnimation = (
	props: MotionProps,
): MotionProps => ({
	...props,
	style: {
		...props.style,
		willChange: "transform",
		transform: "translateZ(0)",
	},
	transition: {
		...PERFORMANCE_TRANSITION,
		...props.transition,
	},
});

export const useReducedMotion = () => {
	if (typeof window === "undefined") return false;

	const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	return mediaQuery.matches;
};

export const createScrollOptimizedVariants = () => ({
	hidden: {
		opacity: 0,
		y: 20,
		transform: "translateZ(0)",
	},
	visible: {
		opacity: 1,
		y: 0,
		transform: "translateZ(0)",
		transition: PERFORMANCE_TRANSITION,
	},
});

export const debounce = <T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number,
): T => {
	let timeout: NodeJS.Timeout;

	return ((...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	}) as T;
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
	func: T,
	limit: number,
): T => {
	let inThrottle: boolean;

	return ((...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	}) as T;
};
