import { ethers, upgrades } from "hardhat";
import { MockDEDU } from "../typechain-types";

export default async function deployYLDToken({
    dEDUAddress,
}: { dEDUAddress?: string } = {}) {
    const [owner] = await ethers.getSigners();

    const MockDEDUFactory = await ethers.getContractFactory("MockDEDU");
    const mockAsset = dEDUAddress
        ? (MockDEDUFactory.attach(dEDUAddress) as MockDEDU)
        : await MockDEDUFactory.deploy();
    !dEDUAddress && (await mockAsset.waitForDeployment());

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
