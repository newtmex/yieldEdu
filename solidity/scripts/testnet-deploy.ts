import { ethers } from "hardhat";
import path from "path";
import deployYLDToken from "../utils/yldToken";
import deploySToken from "../utils/sToken";
import deployStakingContract from "../utils/stakingContract";
import { exportDeployments } from "./utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const { yldToken, mockAsset: dEDUToken } = await deployYLDToken({
        dEDUAddress: "0xe14cbeD222D6044E993773daa0C54B3B8a63A8E3",
    });

    const { sToken } = await deploySToken();
    const { staking, wedu } = await deployStakingContract({
        yldAddress: await yldToken.getAddress(),
        sTokenAddress: await sToken.getAddress(),
        weduAddress: "0x345E902846aC3805719483d80D664ABa0B6aF40C",
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

    const networkId = 656476;

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
