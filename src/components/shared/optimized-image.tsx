"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	priority?: boolean;
	className?: string;
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	placeholder?: "blur" | "empty";
	blurDataURL?: string;
	onLoad?: () => void;
	sizes?: string;
}

export function OptimizedImage({
	src,
	alt,
	width,
	height,
	priority = false,
	className,
	objectFit = "cover",
	placeholder = "empty",
	blurDataURL,
	onLoad,
	sizes,
}: OptimizedImageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const handleLoad = () => {
		setIsLoading(false);
		onLoad?.();
	};

	const handleError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	if (hasError) {
		return (
			<div
				className={cn(
					"flex items-center justify-center bg-slate-800 text-slate-500",
					className,
				)}
				style={{ width, height }}
			>
				<span className="text-sm">画像の読み込みに失敗しました</span>
			</div>
		);
	}

	return (
		<div className={cn("relative overflow-hidden", className)}>
			{isLoading && (
				<div className="absolute inset-0 animate-pulse bg-slate-800" />
			)}
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				priority={priority}
				className={cn(
					"transition-opacity duration-300",
					isLoading ? "opacity-0" : "opacity-100",
					className,
				)}
				style={{ objectFit }}
				placeholder={placeholder}
				blurDataURL={blurDataURL}
				onLoad={handleLoad}
				onError={handleError}
				sizes={sizes}
				quality={85}
			/>
		</div>
	);
}
