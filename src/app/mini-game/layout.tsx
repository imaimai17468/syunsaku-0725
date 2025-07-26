import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata(
	"ミニゲーム",
	"クリックスピードを競うミニゲーム！高スコアを目指して特別な報酬を獲得しよう",
	"/mini-game",
);

export default function MiniGameLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
