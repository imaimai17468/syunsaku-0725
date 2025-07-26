import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist_Mono } from "next/font/google";
import { Header } from "@/components/shared/header/Header";
import { Toaster } from "@/components/ui/sonner";
import { defaultMetadata } from "@/lib/seo/metadata";

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	...defaultMetadata,
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f172a" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`dark antialiased ${geistMono.className}`}>
				<Header />
				<div className="flex min-h-screen w-full justify-center px-6 md:px-0">
					<div className="w-full max-w-7xl">{children}</div>
				</div>
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
