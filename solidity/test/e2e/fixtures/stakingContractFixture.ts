import { ethers, upgrades } from "hardhat";

export default async function deployStakingContractFixture({
    yldAddress,
    sTokenAddress,
}: {
    yldAddress: string;
    sTokenAddress: string;
}) {
    const [owner] = await ethers.getSigners();

    const WEDUFactory = await ethers.getContractFactory("WEDU");
    const wedu = await WEDUFactory.deploy();
    await wedu.waitForDeployment();

    const StakingFactory = await ethers.getContractFactory("Staking");
    const staking = await upgrades.deployProxy(
        StakingFactory,
        [await wedu.getAddress(), sTokenAddress, yldAddress, owner.address],
        { initializer: "initialize", kind: "uups" }
    );
    await staking.waitForDeployment();

    return { staking, wedu };
}
