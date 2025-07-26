"use client";

import { Loader2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const CheckAchievementsButton = () => {
	const [isChecking, setIsChecking] = useState(false);
	const router = useRouter();

	const handleCheck = async () => {
		setIsChecking(true);

		try {
			const response = await fetch("/api/check-achievements", {
				method: "POST",
			});

			const data = await response.json();

			if (data.success) {
				if (data.newlyUnlocked > 0) {
					toast.success(`${data.newlyUnlocked}個の新しい実績を獲得しました！`, {
						description: data.achievements
							.map((a: { name: string }) => a.name)
							.join("、"),
					});
					// 実績ページにリダイレクト
					setTimeout(() => {
						router.push("/achievements");
					}, 2000);
				} else {
					toast.info("新しく獲得できる実績はありませんでした");
				}
			} else {
				toast.error("実績のチェック中にエラーが発生しました");
			}
		} catch (error) {
			console.error("Error checking achievements:", error);
			toast.error("実績のチェック中にエラーが発生しました");
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<Button
			onClick={handleCheck}
			disabled={isChecking}
			size="lg"
			className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
		>
			{isChecking ? (
				<>
					<Loader2 className="mr-2 h-5 w-5 animate-spin" />
					チェック中...
				</>
			) : (
				<>
					<Trophy className="mr-2 h-5 w-5" />
					実績を再チェック
				</>
			)}
		</Button>
	);
};
