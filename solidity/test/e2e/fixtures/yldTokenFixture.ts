import { ethers, upgrades } from "hardhat";

export default async function deployYLDTokenFixture() {
    const [owner] = await ethers.getSigners();

    const MockDEDUFactory = await ethers.getContractFactory("MockDEDU");
    const mockAsset = await MockDEDUFactory.deploy();
    await mockAsset.waitForDeployment();

    // Deploy the YLDToken contract as an upgradeable proxy
    const YLDTokenFactory = await ethers.getContractFactory("YLDToken");
    const yldToken = await upgrades.deployProxy(
        YLDTokenFactory,
        [
            "YieldEDU Token",
            "YLD",
            await owner.getAddress(),
            await mockAsset.getAddress(),
        ],
        { initializer: "initialize", kind: "uups" }
    );
    await yldToken.waitForDeployment();

    return { yldToken, mockAsset };
}
