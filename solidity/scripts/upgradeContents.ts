import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import path from "path";
import { ContentController } from "../typechain-types";

task(
    "upgradeContents",
    "Upgrades Content implementation via the Content Beacon"
).setAction(async (_, hre) => {
    await hre.run("compile");

    const { ethers, upgrades, deployments } = hre;
    const [owner] = await ethers.getSigners();
    const { exportDeployments } = await import("./utils");

    const beaconAddress = (await deployments.get("Content")).address;

    console.log("\n🔧 Content Beacon:", beaconAddress);

    // Get the new implementation factory
    const ContentFactory = await ethers.getContractFactory("Content", owner);

    /**
     * Force-import the BEACON (not a proxy)
     */
    console.log("📦 Importing Content beacon into upgrades manifest...");
    await upgrades.forceImport(beaconAddress, ContentFactory, {
        kind: "beacon",
    });

    /**
     * Upgrade the beacon ONCE
     * All BeaconProxy instances are upgraded automatically
     */
    console.log("🚀 Upgrading Content beacon...");
    await upgrades.upgradeBeacon(beaconAddress, ContentFactory, {
        redeployImplementation: "always",
    });

    console.log("✅ Content beacon upgraded successfully.");

    const abiPaths = [
        path.join(__dirname, "../../app/dapp/investors"),
        path.join(__dirname, "../../app/ponder"),
        path.join(__dirname, "../../app/investor-leaderboard/abis"),
    ].map((dir) => path.join(dir, "deployedContracts.ts"));
    await exportDeployments(abiPaths, { Content: beaconAddress });

    const controller =
        await hre.ethers.getContract<ContentController>("ContentController");
    const contents = await controller.contents();

    for (const address of contents) {
        const contentContract = await hre.ethers.getContractAt(
            "Content",
            address
        );

        await contentContract.grantRole(
            await contentContract.MANAGER_ROLE(),
            owner
        );

        await contentContract.setMinBindAmount(
            await contentContract.MIN_BIND()
        );
    }

    console.log("\n🎉 Content upgrade complete.");
});
