import { ethers, network } from "hardhat";
import path from "path";
import deployYLDToken from "../utils/yldToken";
import deploySToken from "../utils/sToken";
import deployStakingContract from "../utils/stakingContract";
import { exportDeployments } from "./utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const { yldToken, mockAsset: dEDUToken } = await deployYLDToken();

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

    // Mint dEDU and deposit WEDU to deployer

    const amount = ethers.parseEther("1000");

    // 1. Mint dEDU tokens directly to your wallet
    await dEDUToken.mint(deployer.address, amount);
    console.log(`Minted ${amount} dEDU to ${deployer.address}`);

    // 2. Deposit native token (ETH) to get WEDU tokens (wrapped dEDU)
    const wrapAmount = ethers.parseEther("500");

    // Make sure your deployer wallet has enough ETH for wrapping
    await network.provider.send("hardhat_setBalance", [
        deployer.address,
        "0x10000000000000000000000", // large ETH balance
    ]);

    await wedu.connect(deployer).deposit({ value: wrapAmount });
    console.log(`Wrapped ${wrapAmount} ETH into WEDU for ${deployer.address}`);

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
