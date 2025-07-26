export const imageLoader = ({
	src,
	width,
	quality = 85,
}: {
	src: string;
	width: number;
	quality?: number;
}) => {
	// 外部URLの場合はそのまま返す
	if (src.startsWith("http://") || src.startsWith("https://")) {
		return src;
	}

	// ローカル画像の場合は最適化パラメータを追加
	const params = new URLSearchParams();
	params.set("w", width.toString());
	params.set("q", quality.toString());

	// WebP対応ブラウザかチェック（実際の実装では、User-Agentや Accept ヘッダーをチェック）
	const supportsWebP = typeof window !== "undefined" && "WebP" in window;
	if (supportsWebP) {
		params.set("fm", "webp");
	}

	return `${src}?${params.toString()}`;
};

export const generateBlurDataURL = (width = 10, height = 10): string => {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");

	if (ctx) {
		// グラデーション背景を生成
		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, "#1e293b");
		gradient.addColorStop(1, "#334155");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
	}

	return canvas.toDataURL();
};

export const getImageSizes = (breakpoints: {
	mobile?: number;
	tablet?: number;
	desktop?: number;
}) => {
	const { mobile = 640, tablet = 1024, desktop = 1920 } = breakpoints;

	return `(max-width: 640px) ${mobile}px, (max-width: 1024px) ${tablet}px, ${desktop}px`;
};
