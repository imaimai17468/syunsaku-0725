import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), payment=()",
					},
				],
			},
			{
				source: "/:path*",
				has: [
					{
						type: "header",
						key: "x-forwarded-proto",
						value: "https",
					},
				],
				headers: [
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains; preload",
					},
				],
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/robots.txt",
				destination: "/api/robots",
			},
			{
				source: "/sitemap.xml",
				destination: "/api/sitemap",
			},
		];
	},
	images: {
		formats: ["image/avif", "image/webp"],
	},
};

export default bundleAnalyzer(nextConfig);