import { ethers, artifacts, network } from "hardhat";
import fs from "fs";
import path from "path";
import deployYLDTokenFixture from "../test/e2e/fixtures/yldTokenFixture";
import deploySTokenFixture from "../test/e2e/fixtures/sTokenFixture";
import deployStakingContractFixture from "../test/e2e/fixtures/stakingContractFixture";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const { yldToken, mockAsset: dEDUToken } = await deployYLDTokenFixture({
        dEDUAddress: "0x597FFfA69e133Ee9b310bA13734782605C3549b7",
    });

    const { sToken } = await deploySTokenFixture();
    const { staking, wedu } = await deployStakingContractFixture({
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

    const deploymentsPath = path.join(
        __dirname,
        "../../app/dapp/investors/mainnet-deployments/deployments.json"
    );

    const deploymentsPath2 = path.join(
        __dirname,
        "../../app/ponder/mainnet-deployments/deployments.json"
    );
    fs.mkdirSync(path.dirname(deploymentsPath), { recursive: true });
    fs.writeFileSync(deploymentsPath, JSON.stringify(addresses, null, 2));

    fs.mkdirSync(path.dirname(deploymentsPath2), { recursive: true });
    fs.writeFileSync(deploymentsPath2, JSON.stringify(addresses, null, 2));

    // export ABIs for frontend
    const abiDir = path.join(
        __dirname,
        "../../app/dapp/investors/mainnet-deployments/abis"
    );
    const abiDir2 = path.join(
        __dirname,
        "../../app/ponder/mainnet-deployments/abis"
    );
    fs.mkdirSync(abiDir, { recursive: true });
    fs.mkdirSync(abiDir2, { recursive: true });

    for (const name of ["Staking", "YLDToken", "SToken", "MockDEDU", "WEDU"]) {
        const artifact = await artifacts.readArtifact(name);
        fs.writeFileSync(
            path.join(abiDir, `${name}.json`),
            JSON.stringify(artifact, null, 2)
        );
        fs.writeFileSync(
            path.join(abiDir2, `${name}.json`),
            JSON.stringify(artifact, null, 2)
        );
    }

    console.log("✅ All contracts deployed and artifacts exported.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
