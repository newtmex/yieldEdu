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
        dEDUAddress: "0x597FFfA69e133Ee9b310bA13734782605C3549b7",
    });

    const { sToken } = await deploySToken();
    const { staking, wedu } = await deployStakingContract({
        yldAddress: await yldToken.getAddress(),
        sTokenAddress: await sToken.getAddress(),
        weduAddress: "0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12",
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
    const addresses = {
        yldToken: await yldToken.getAddress(),
        dEDUToken: await dEDUToken.getAddress(),
        sToken: await sToken.getAddress(),
        staking: await staking.getAddress(),
        wedu: await wedu.getAddress(),
    };

    const contractNames = ["Staking", "YLDToken", "SToken", "MockDEDU", "WEDU"];

    await Promise.all([
        exportDeployments(
            path.join(__dirname, "../../apps/dapp/investors"),
            addresses,
            contractNames
        ),

        exportDeployments(
            path.join(__dirname, "../../apps/ponder"),
            addresses,
            contractNames
        ),
    ]);

    console.log("✅ All contracts deployed and artifacts exported.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
