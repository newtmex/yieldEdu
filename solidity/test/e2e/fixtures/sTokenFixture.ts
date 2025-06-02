import { ethers, upgrades } from "hardhat";

export default async function deploySTokenFixture() {
    const [owner] = await ethers.getSigners();

    const STokenFactory = await ethers.getContractFactory("SToken");
    const sToken = await upgrades.deployProxy(
        STokenFactory,
        ["YieldEDU SFT", "sYLD", owner.address],
        { initializer: "initialize", kind: "uups" }
    );

    await sToken.waitForDeployment();

    return { sToken };
}
