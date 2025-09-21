import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import fs from "fs";
import path from "path";

task("stakingUpgrade", "", async (_, hre) => {
    await hre.run("compile");

    const { ethers, upgrades, artifacts } = hre;
    const [owner] = await ethers.getSigners();

    const stakingAddr = "0x22b295bD528F08D89Eec7Cf9E11e20d95FD35929";

    console.log("Upgrading Staking");
    await upgrades.forceImport(
        stakingAddr,
        await ethers.getContractFactory("Staking", { signer: owner })
    );

    const newStaking = await upgrades.upgradeProxy(
        stakingAddr,
        await ethers.getContractFactory("Staking", { signer: owner }),
        {
            redeployImplementation: "always",
        }
    );
    console.log("✅ Staking upgraded at:", await newStaking.getAddress());

    // ---- Save deployment addresses ----
    const addresses = {
        staking: stakingAddr,
    };

    const deploymentsPaths = [
        "../../app/dapp/investors/mainnet-deployments/deployments.json",
        "../../app/ponder/mainnet-deployments/deployments.json",
    ];

    for (const deploymentsPath of deploymentsPaths) {
        const fullPath = path.join(__dirname, deploymentsPath);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });

        // Load existing data if it exists
        let existing = {};
        if (fs.existsSync(fullPath)) {
            try {
                existing = JSON.parse(fs.readFileSync(fullPath, "utf8"));
            } catch (err) {
                console.warn(
                    `Warning: Could not parse ${fullPath}, starting fresh.`
                );
            }
        }

        // Merge and write back
        const merged = { ...existing, ...addresses };
        fs.writeFileSync(fullPath, JSON.stringify(merged, null, 2));
    }

    // ---- Export ABIs ----
    const abisToExport = ["Staking"];
    const abiDirs = [
        "../../app/dapp/investors/mainnet-deployments/abis",
        "../../app/ponder/mainnet-deployments/abis",
    ];

    for (const name of abisToExport) {
        const artifact = await artifacts.readArtifact(name);
        for (const dir of abiDirs) {
            const fullDir = path.join(__dirname, dir);
            fs.mkdirSync(fullDir, { recursive: true });
            fs.writeFileSync(
                path.join(fullDir, `${name}.json`),
                JSON.stringify(artifact, null, 2)
            );
        }
    }

    console.log("✅ Upgrade complete. Artifacts and ABIs exported.");
});
