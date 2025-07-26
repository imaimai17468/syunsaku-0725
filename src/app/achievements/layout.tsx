import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata(
	"実績",
	"達成した実績を確認しよう。様々な条件をクリアして全実績コンプリートを目指せ！",
	"/achievements",
);

export default function AchievementsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
