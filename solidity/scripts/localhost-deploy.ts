import { ethers, network, upgrades } from "hardhat";

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

    const DEDUAggregatorFactory = await ethers.getContractFactory(
        "DEDUAggregator",
        { signer: deployer }
    );

    const dEDUAggregator = await upgrades.deployProxy(
        DEDUAggregatorFactory,
        [
            "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
            await yldToken.getAddress(),
            deployer.address,
        ],
        { kind: "uups" }
    );
    await dEDUAggregator.waitForDeployment();

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
        DEDUAggregator: await dEDUAggregator.getAddress(),
    };

    const networkId = await ethers.provider
        .getNetwork()
        .then((n) => Number(n.chainId));

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
