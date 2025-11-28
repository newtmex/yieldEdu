import { ethers, upgrades } from "hardhat";
import { WEDU } from "../typechain-types";

export default async function deployStakingContract({
    yldAddress,
    sTokenAddress,
    weduAddress,
}: {
    yldAddress: string;
    sTokenAddress: string;
    weduAddress?: string;
}) {
    const [deployer] = await ethers.getSigners();
    console.log(
        `🔧 Deploying Staking contract with deployer: ${deployer.address}`
    );

    // ----------------------------------------
    // Deploy or attach WEDU token
    // ----------------------------------------
    const WEDUFactory = await ethers.getContractFactory("WEDU");
    let wedu: WEDU;

    if (weduAddress) {
        wedu = WEDUFactory.attach(weduAddress) as WEDU;
        console.log(
            `📌 Attached existing WEDU token at: ${await wedu.getAddress()}`
        );
    } else {
        wedu = (await WEDUFactory.deploy()) as WEDU;
        await wedu.waitForDeployment();
        console.log(
            `✅ Deployed new WEDU token at: ${await wedu.getAddress()}`
        );
    }

    // ----------------------------------------
    // Deploy Staking contract via UUPS proxy
    // ----------------------------------------
    console.log("🔧 Deploying Staking proxy contract...");

    const StakingFactory = await ethers.getContractFactory("Staking");
    const staking = await upgrades.deployProxy(
        StakingFactory,
        [await wedu.getAddress(), sTokenAddress, yldAddress, deployer.address],
        { initializer: "initialize", kind: "uups" }
    );
    await staking.waitForDeployment();

    console.log(
        `✅ Staking contract deployed at: ${await staking.getAddress()}`
    );
    console.log(`📌 WEDU token linked to staking: ${await wedu.getAddress()}`);
    console.log(`📌 SToken address linked to staking: ${sTokenAddress}`);
    console.log(`📌 YLD token address linked to staking: ${yldAddress}`);

    return { staking, wedu };
}
