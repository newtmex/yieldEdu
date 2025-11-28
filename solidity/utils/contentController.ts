import { ethers, upgrades } from "hardhat";

export default async function deployContentController({
    sTokenAddress,
    yldAddress,
    feeCollector,
}: {
    sTokenAddress: string;
    yldAddress: string;
    feeCollector: string;
}) {
    const [owner] = await ethers.getSigners();

    // ------------------------------
    // 1️⃣ Deploy Content Implementation
    // ------------------------------
    const Content = await ethers.getContractFactory("Content");
    const contentImpl = await Content.deploy();
    const deployedContentImpl = await contentImpl.getAddress();
    console.log("Content Impl deployed at:", deployedContentImpl);

    // ------------------------------
    // 2️⃣ Deploy UpgradeableBeacon
    // ------------------------------
    const UpgradeableBeacon =
        await ethers.getContractFactory("UpgradeableBeacon");
    const beacon = await UpgradeableBeacon.deploy(
        deployedContentImpl,
        owner.address
    );
    const beaconAddress = await beacon.getAddress();
    console.log("Beacon deployed at:", beaconAddress);

    // ------------------------------
    // 3️⃣ Deploy ContentController via UUPS proxy
    // ------------------------------
    const ContentController =
        await ethers.getContractFactory("ContentController");
    const contentController = await upgrades.deployProxy(
        ContentController,
        [owner.address, sTokenAddress, yldAddress, feeCollector, beaconAddress],
        {
            initializer: "initialize",
            kind: "uups",
        }
    );
    await contentController.waitForDeployment();

    return { contentController, beacon, contentImpl };
}
