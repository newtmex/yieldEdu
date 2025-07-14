import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import fs from "fs";
import path from "path";

task(
    "yieldAccrualUpgrade",
    "Deploys DEDUAggregator and upgrades YLDToken for yield accrual",
    async (_, hre) => {
        const { ethers, upgrades, artifacts } = hre;
        const [owner] = await ethers.getSigners();

        const yldTokenAddr = await ethers
            .getContract("YLDToken", owner)
            .then((contract) => contract.getAddress());

        const gainzSwapRouterAddr =
            "0xd35C85FbA82587c15D2fa255180146A046B67237";

        console.log("Upgrading YLDToken for yield accrual...");
        await upgrades.forceImport(
            yldTokenAddr,
            await ethers.getContractFactory("YLDToken", { signer: owner })
        );

        const newYldToken = await upgrades.upgradeProxy(
            yldTokenAddr,
            await ethers.getContractFactory("YLDToken", { signer: owner }),
            {
                redeployImplementation: "always",
            }
        );
        console.log("✅ YLDToken upgraded at:", await newYldToken.getAddress());

        const DEDUAggregatorFactory = await ethers.getContractFactory(
            "DEDUAggregator"
        );

        const dEDUAggregator = await upgrades.deployProxy(
            DEDUAggregatorFactory,
            [gainzSwapRouterAddr, yldTokenAddr, owner.address],
            { kind: "uups" }
        );
        await dEDUAggregator.waitForDeployment();

        const dEDUAggregatorAddr = await dEDUAggregator.getAddress();
        console.log("✅ DEDUAggregator deployed at:", dEDUAggregatorAddr);

        // ---- Save deployment addresses ----
        const addresses = {
            yldToken: yldTokenAddr,
            dEDUAggregator: dEDUAggregatorAddr,
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
        const abisToExport = ["YLDToken", "DEDUAggregator"];
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
    }
);
