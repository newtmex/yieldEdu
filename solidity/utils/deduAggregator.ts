import { ethers, upgrades } from "hardhat";

export default async function deployDEDUAggregator({
    gainzRouterAddr,
    yldAddr,
}: {
    gainzRouterAddr: string;
    yldAddr: string;
}) {
    const [owner] = await ethers.getSigners();
    const DEDUAggregatorFactory =
        await ethers.getContractFactory("DEDUAggregator");
    const deduAggregator = await upgrades.deployProxy(
        DEDUAggregatorFactory,
        [gainzRouterAddr, yldAddr, owner.address],
        { initializer: "initialize", kind: "uups" }
    );
    await deduAggregator.waitForDeployment();

    return { deduAggregator };
}
