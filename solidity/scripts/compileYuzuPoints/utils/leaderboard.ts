import axios from "axios";
import { getAddress } from "ethers";

const API_URL = "https://api.yieldedu.xyz/leaderboard";

export interface IUserStat {
    pendingPoints: number;
    userPosition: number;
    walletAddress: string;
}

export interface ILeaderboardResponse {
    maxPoints: number;
    pointsAccrued: number;
    pointsAvailable: number;
    yuzuPoints: IUserStat[];
}

/**
 * Fetch leaderboard data with concurrent workers.
 */
export async function fetchLeaderboard(
    concurrency = 10,
    limit = 100,
    maxRetries = 5
) {
    let nextPage = 1;
    let totalPages: number | undefined;
    let maxPoints: number | undefined;
    let pointsAccrued: number | undefined;
    let pointsAvailable: number | undefined;
    const resultsByWorker: IUserStat[][] = [];

    async function fetchPage(page: number): Promise<IUserStat[]> {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const { data } = await axios.get<{
                    totalPages: number;
                    maxPoints: string;
                    pointsAccrued: string;
                    pointsAvailable: string;
                    result: IUserStat[];
                }>(`${API_URL}?page=${page}&limit=${limit}`);

                if (data.result.length > 0) {
                    console.log(
                        `✅ Page ${page} fetched (${data.result.length} items)`
                    );
                    totalPages = data.totalPages;

                    const cleanNumber = (str: string) =>
                        Math.floor(Number(str.replace(/,/g, "")));
                    if (maxPoints === undefined) {
                        maxPoints = cleanNumber(data.maxPoints);
                        pointsAccrued = cleanNumber(data.pointsAccrued);
                        pointsAvailable = cleanNumber(data.pointsAvailable);
                    }

                    return data.result.map((u) => ({
                        ...u,
                        pendingPoints: cleanNumber(u.pendingPoints.toString()),
                        walletAddress: getAddress(
                            u.walletAddress.toLowerCase()
                        ),
                    }));
                } else {
                    console.warn(`⚠️ Page ${page} returned empty result`);
                    return [];
                }
            } catch (err: any) {
                attempt++;
                const wait = Math.min(1000 * 2 ** attempt, 15_000);
                console.error(
                    `❌ Error fetching page ${page} (attempt ${attempt}/${maxRetries}):`,
                    err.message || err
                );
                if (attempt < maxRetries) {
                    console.log(`🔄 Retrying page ${page} after ${wait}ms...`);
                    await new Promise((res) => setTimeout(res, wait));
                } else {
                    console.error(`🚨 Giving up on page ${page}`);
                    return [];
                }
            }
        }
        return [];
    }

    function getNextPage() {
        return nextPage++;
    }

    async function worker(id: number) {
        const localResults: IUserStat[] = [];

        while (true) {
            const page = getNextPage();
            if (totalPages !== undefined && page > totalPages) break;

            const pageResults = await fetchPage(page);
            localResults.push(...pageResults);
        }

        console.log(`👷 Worker ${id} stopped`);
        resultsByWorker[id] = localResults;
    }

    await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));

    const allResults = resultsByWorker.flat();
    console.log("🎉 All users fetched:", allResults.length);

    if (!maxPoints || !pointsAccrued || !pointsAvailable) {
        throw new Error("Failed to fetch leaderboard metadata");
    }

    return {
        maxPoints,
        pointsAccrued,
        pointsAvailable,
        yuzuPoints: allResults,
    };
}
