import { NextResponse } from "next/server";
import type { RankingType } from "@/entities/ranking";
import { fetchRanking } from "@/gateways/ranking";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const type = (searchParams.get("type") || "totalPoints") as RankingType;

	try {
		const data = await fetchRanking(type);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Debug ranking error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch ranking", details: error },
			{ status: 500 },
		);
	}
}
