import { ethers, network } from "hardhat";

import path from "path";
import deployYLDToken from "../utils/yldToken";
import deploySToken from "../utils/sToken";
import deployStakingContract from "../utils/stakingContract";
import { exportDeployments } from "./utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const { yldToken, mockAsset: dEDUToken } = await deployYLDToken({
        dEDUAddress: "0x1881d02D05a44713a69d6eDDE3e7167792A636d6",
    });

    const { sToken } = await deploySToken();
    const { staking, wedu } = await deployStakingContract({
        yldAddress: await yldToken.getAddress(),
        sTokenAddress: await sToken.getAddress(),
    });

    // Grant MINTER_ROLE to staking contract
    await yldToken.grantRole(
        await yldToken.MINTER_ROLE(),
        await staking.getAddress()
    );
    await sToken.grantRole(
        await sToken.MINTER_ROLE(),
        await staking.getAddress()
    );

    // Save deployment addresses
    const contracts = {
        YLDToken: await yldToken.getAddress(),
        MockDEDU: await dEDUToken.getAddress(),
        SToken: await sToken.getAddress(),
        Staking: await staking.getAddress(),
        WEDU: await wedu.getAddress(),
    };

    const networkId =
        network.name === "mainnet"
            ? 1
            : network.name === "localhost"
            ? 31337
            : 41923;

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

    console.log("✅ All contracts deployed and artifacts exported.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
