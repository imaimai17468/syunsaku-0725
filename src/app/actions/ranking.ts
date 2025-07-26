"use server";

import type { RankingData, RankingType } from "@/entities/ranking";
import { fetchRanking } from "@/gateways/ranking";

export const fetchRankingAction = async (
	type: RankingType,
): Promise<RankingData> => {
	return fetchRanking(type);
};
