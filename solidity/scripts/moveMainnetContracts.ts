import path from "path";
import { exportDeployments } from "./utils";

async function main() {
    // Save deployment addresses
    const contracts = {
        YLDToken: "0x145D410f1c831F185B5815fe4fD76308c76240f9",
        MockDEDU: "0x597FFfA69e133Ee9b310bA13734782605C3549b7",
        SToken: "0x520357d4cB2F4C13420ac440d480CF423Caf8bBD",
        Staking: "0x22b295bD528F08D89Eec7Cf9E11e20d95FD35929",
        WEDU: "0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12",
    };

    const networkId = 41923;

    await Promise.all([
        exportDeployments(
            path.join(__dirname, "../../app/dapp/investors"),
            [],
            [],
            contracts,
            networkId
        ),
        exportDeployments(
            path.join(__dirname, "../../app/ponder"),
            [],
            [],
            contracts,
            networkId
        ),
        exportDeployments(
            path.join(__dirname, "../../app/investor-leaderboard/abis"),
            [],
            [],
            contracts,
            networkId
        ),
    ]);

    console.log("✅ All contracts moved and artifacts exported.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
