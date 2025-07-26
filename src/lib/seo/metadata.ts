import type { Metadata } from "next";

const DEFAULT_TITLE = "デイリーリワード - RPGスタイルの報酬システム";
const DEFAULT_DESCRIPTION =
	"毎日ログインして報酬をゲット！ルーレットやミニゲームで特別なアイテムを獲得しよう。レベルアップして実績を解除！";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const defaultMetadata: Metadata = {
	title: {
		default: DEFAULT_TITLE,
		template: "%s | デイリーリワード",
	},
	description: DEFAULT_DESCRIPTION,
	keywords: [
		"デイリーリワード",
		"ログインボーナス",
		"RPGゲーム",
		"ルーレット",
		"ミニゲーム",
		"実績システム",
		"レベルアップ",
		"報酬システム",
	],
	authors: [{ name: "デイリーリワード開発チーム" }],
	creator: "デイリーリワード",
	publisher: "デイリーリワード",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(SITE_URL),
	openGraph: {
		type: "website",
		locale: "ja_JP",
		url: SITE_URL,
		siteName: "デイリーリワード",
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		images: [
			{
				url: DEFAULT_OG_IMAGE,
				width: 1200,
				height: 630,
				alt: "デイリーリワード - RPGスタイルの報酬システム",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		images: [DEFAULT_OG_IMAGE],
		creator: "@dailyrewards",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: SITE_URL,
		languages: {
			"ja-JP": SITE_URL,
		},
	},
};

export const generatePageMetadata = (
	title: string,
	description: string,
	path?: string,
	image?: string,
): Metadata => {
	const url = path ? `${SITE_URL}${path}` : SITE_URL;
	const ogImage = image || DEFAULT_OG_IMAGE;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			title,
			description,
			images: [ogImage],
		},
		alternates: {
			canonical: url,
		},
	};
};
