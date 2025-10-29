import "@nomicfoundation/hardhat-toolbox";
import fs from "fs";
import { stringify } from "csv-stringify/sync";
import { task } from "hardhat/config";
import { fetchLeaderboard, ILeaderboardResponse } from "./utils/leaderboard";
import { getAddress } from "ethers";

// --- Configuration ---
const TEAM_WALLET_ENV = process.env.TEAM_YUZU_WALLET;
if (!TEAM_WALLET_ENV)
    throw new Error("❌ Missing environment variable: TEAM_YUZU_WALLET");

const TEAM_WALLET = getAddress(TEAM_WALLET_ENV);
const TOTAL_DISTRIBUTION = 1_511_618;

// --- Types ---
type YuzuPointEntry = {
    address: string;
    amount: number;
    reasonCode: string;
};

// --- Hardhat Task ---
task("compileYuzuPoints", "Compile and generate Yuzu point distributions")
    .addParam("sem", "Semester number (integer >= 1)")
    .addFlag("update", "Force update from remote leaderboard")
    .setAction(async ({ sem, update }) => {
        const SEM = Number(sem);
        if (isNaN(SEM) || SEM < 1)
            throw new Error("❌ Invalid SEM value. Must be an integer >= 1.");

        const LEADERBOARD_FILE = `leaderboard_sem${SEM}.json`;
        let leaderboardData: ILeaderboardResponse;

        // --- Load or Fetch Leaderboard ---
        if (fs.existsSync(LEADERBOARD_FILE) && !update) {
            console.log(
                `📂 Loading cached leaderboard from ${LEADERBOARD_FILE}...`
            );
            leaderboardData = JSON.parse(
                fs.readFileSync(LEADERBOARD_FILE, "utf8")
            );
        } else {
            console.log("🌐 Fetching leaderboard data from remote source...");
            leaderboardData = await fetchLeaderboard();
            fs.writeFileSync(
                LEADERBOARD_FILE,
                JSON.stringify(leaderboardData, null, 2)
            );
            console.log(`💾 Leaderboard saved to ${LEADERBOARD_FILE}.`);
        }

        const { yuzuPoints, maxPoints, pointsAccrued, pointsAvailable } =
            leaderboardData;

        // --- Include Team Wallet Allocation ---
        yuzuPoints.push({
            walletAddress: TEAM_WALLET,
            userPosition: 0,
            pendingPoints: TOTAL_DISTRIBUTION - maxPoints,
        });

        let totalYuzuDistributed = 0;

        // --- Calculate Distribution ---
        const pointsRecord = yuzuPoints.reduce<Record<string, YuzuPointEntry>>(
            (acc, user) => {
                let points = Math.floor(user.pendingPoints);

                if (user.walletAddress !== TEAM_WALLET) {
                    const bonus = Math.floor(
                        (points * pointsAvailable) / pointsAccrued
                    );
                    points += bonus;
                }

                acc[user.walletAddress] ??= {
                    address: user.walletAddress,
                    amount: 0,
                    reasonCode: `YieldEDU_sem_${SEM}`,
                };

                acc[user.walletAddress].amount += points;
                totalYuzuDistributed += points;

                return acc;
            },
            {}
        );

        // --- Summary ---
        console.log("📊 Distribution Summary");
        console.table({
            maxPoints,
            pointsAccrued,
            pointsAvailable,
            totalYuzuDistributed,
            totalUsers: yuzuPoints.length,
        });

        // --- Write CSV Outputs ---
        const sortedRecords = Object.values(pointsRecord).sort(
            (a, b) => b.amount - a.amount
        );
        const csvOutputs = [
            {
                filename: `yuzu_distribution_sem${SEM}.csv`,
                data: stringify(sortedRecords, { header: true }),
            },
            {
                filename: `yuzu_points_sem${SEM}.csv`,
                data: stringify(yuzuPoints, { header: true }),
            },
        ];

        await Promise.all(
            csvOutputs.map(({ filename, data }) =>
                fs.promises
                    .writeFile(filename, data)
                    .then(() => console.log(`✅ File saved: ${filename}`))
            )
        );

        console.log("🏁 Distribution compilation complete.");
    });
