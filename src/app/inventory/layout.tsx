import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata(
	"インベントリ",
	"獲得したアイテムを管理しよう。レアアイテムのコレクションを確認できます",
	"/inventory",
);

export default function InventoryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
