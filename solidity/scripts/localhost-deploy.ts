import { ethers } from "hardhat";
import path from "path";

import deployYLDToken from "../utils/yldToken";
import deploySToken from "../utils/sToken";
import deployStakingContract from "../utils/stakingContract";
import deployDEDUAggregator from "../utils/deduAggregator";
import deployContentController from "../utils/contentController";

import { exportDeployments } from "./utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔧 Starting deployment with account: ${deployer.address}`);

    // ----------------------------------------
    // Deploy Tokens
    // ----------------------------------------
    const { yldToken, mockAsset: dEDUToken } = await deployYLDToken();

    const { sToken } = await deploySToken();

    // ----------------------------------------
    // Deploy Staking
    // ----------------------------------------
    const { staking, wedu } = await deployStakingContract({
        yldAddress: await yldToken.getAddress(),
        sTokenAddress: await sToken.getAddress(),
    });

    // ----------------------------------------
    // Deploy Aggregator
    // ----------------------------------------
    const { deduAggregator } = await deployDEDUAggregator({
        gainzRouterAddr:
            process.env.GAINZ_ROUTER ??
            "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
        yldAddr: await yldToken.getAddress(),
    });

    // ----------------------------------------
    // Deploy Content Controller
    // ----------------------------------------
    const { contentController, beacon: contentBeacon } =
        await deployContentController({
            sTokenAddress: await sToken.getAddress(),
            yldAddress: await yldToken.getAddress(),
            feeCollector: await deduAggregator.getAddress(),
        });

    // ----------------------------------------
    // Assign Roles
    // ----------------------------------------
    console.log("🔐 Assigning roles...");

    await yldToken.grantRole(
        await yldToken.MINTER_ROLE(),
        await staking.getAddress()
    );

    await sToken.grantRole(
        await sToken.MINTER_ROLE(),
        await staking.getAddress()
    );

    await sToken.grantRole(
        await sToken.TRANSFER_ROLE(),
        await contentController.getAddress()
    );

    await sToken.grantRole(
        await sToken.BINDING_UPDATE_ROLE(),
        await contentController.getAddress()
    );

    // ----------------------------------------
    // Prepare Deployment Data
    // ----------------------------------------
    const contracts = {
        YLDToken: await yldToken.getAddress(),
        MockDEDU: await dEDUToken.getAddress(),
        SToken: await sToken.getAddress(),
        Staking: await staking.getAddress(),
        WEDU: await wedu.getAddress(),
        ContentController: await contentController.getAddress(),
        Content: await contentBeacon.getAddress(),
        DEDUAggregator: await deduAggregator.getAddress(),
    };

    const networkId = Number((await ethers.provider.getNetwork()).chainId);

    // ----------------------------------------
    // Export Deployments
    // ----------------------------------------
    console.log("📝 Exporting deployment artifacts...");

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

    console.log(
        "✅ Deployment completed successfully. All artifacts exported."
    );
}

// ------------------------------------------------------------
// Entrypoint
// ------------------------------------------------------------
main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
