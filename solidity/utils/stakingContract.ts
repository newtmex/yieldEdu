import { ethers, upgrades } from "hardhat";

export default async function deployStakingContract({
    yldAddress,
    sTokenAddress,
    weduAddress,
}: {
    yldAddress: string;
    sTokenAddress: string;
    weduAddress?: string;
}) {
    const [owner] = await ethers.getSigners();

    const WEDUFactory = await ethers.getContractFactory("WEDU");
    const wedu = weduAddress
        ? WEDUFactory.attach(weduAddress)
        : await WEDUFactory.deploy();
    !weduAddress && (await wedu.waitForDeployment());

    const StakingFactory = await ethers.getContractFactory("Staking");
    const staking = await upgrades.deployProxy(
        StakingFactory,
        [await wedu.getAddress(), sTokenAddress, yldAddress, owner.address],
        { initializer: "initialize", kind: "uups" }
    );
    await staking.waitForDeployment();

    return { staking, wedu };
}
