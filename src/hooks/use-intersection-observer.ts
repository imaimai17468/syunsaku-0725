"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
	threshold?: number | number[];
	rootMargin?: string;
	triggerOnce?: boolean;
}

export const useIntersectionObserver = <T extends HTMLElement>(
	options: UseIntersectionObserverOptions = {},
) => {
	const { threshold = 0, rootMargin = "0px", triggerOnce = false } = options;
	const [isInView, setIsInView] = useState(false);
	const [hasTriggered, setHasTriggered] = useState(false);
	const ref = useRef<T>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element || (triggerOnce && hasTriggered)) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				const inView = entry.isIntersecting;
				setIsInView(inView);

				if (inView && triggerOnce) {
					setHasTriggered(true);
					observer.unobserve(element);
				}
			},
			{
				threshold,
				rootMargin,
			},
		);

		observer.observe(element);

		return () => {
			observer.unobserve(element);
		};
	}, [threshold, rootMargin, triggerOnce, hasTriggered]);

	return { ref, isInView };
};
