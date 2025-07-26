import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata(
	"ルーレット",
	"毎日1回無料でルーレットを回して豪華報酬をゲット！レア度の高いアイテムを狙おう",
	"/roulette",
);

export default function RouletteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
