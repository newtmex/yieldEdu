import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import path from "path";

task(
    "contentsTokenisationUpgrade",
    "Upgrades contracts for content-tokenisation feature",
    async (_, hre) => {
        const deployContentController = (
            await import("../utils/contentController")
        ).default;

        const { exportDeployments, extractObjectFromTs } = await import(
            "./utils"
        );

        await hre.run("compile");

        const { ethers, upgrades, artifacts } = hre;
        const [owner] = await ethers.getSigners();

        const networkId = Number((await ethers.provider.getNetwork()).chainId);

        // ----- Load deployedContracts.ts -----
        const abiPaths = [
            path.join(__dirname, "../../app/dapp/investors"),
            path.join(__dirname, "../../app/ponder"),
            path.join(__dirname, "../../app/investor-leaderboard/abis"),
        ].map((dir) => path.join(dir, "deployedContracts.ts"));

        const deployedContracts = extractObjectFromTs(
            abiPaths[2],
            "deployedContracts"
        )[networkId];

        // ------- Define list of contracts to upgrade --------
        const contractsToUpgrade = [
            { key: "YLDToken", factory: "YLDToken" },
            { key: "SToken", factory: "SToken" },
            { key: "Staking", factory: "Staking" },
            { key: "DEDUAggregator", factory: "DEDUAggregator" },
        ];

        console.log(`\n🔧 Network: ${networkId}`);
        console.log("🔍 Loaded contract addresses:");
        console.log(
            Object.values(deployedContracts).map((c) => ` - ${c.address}`)
        );
        console.log("");

        // ------- Function to upgrade a single contract -------
        const contractMap: Record<string, string> = {};

        async function upgradeOne(
            name: string,
            address: string,
            factoryName: string
        ) {
            console.log(`\n🚀 Upgrading ${name}`);
            console.log(`   Address: ${address}`);

            const factory = await ethers.getContractFactory(factoryName, owner);

            try {
                // Ensure proxy is known to upgrades plugin
                await upgrades.forceImport(address, factory);
            } catch (err) {
                console.log(
                    `⚠️ forceImport failed for ${name}, trying upgrade anyway...`
                );
            }

            const instance = await upgrades.upgradeProxy(address, factory, {
                redeployImplementation: "always",
            });
            await instance.waitForDeployment();

            contractMap[name] = address;
            console.log(`✅ ${name} upgraded →`, await instance.getAddress());
        }

        // ------- Execute upgrades -------
        for (const c of contractsToUpgrade) {
            const info = deployedContracts[c.key];

            if (!info || !info.address) {
                console.log(
                    `⚠️ Skipping ${c.key}: no address found in deployedContracts`
                );
                continue;
            }

            await upgradeOne(c.key, info.address, c.factory);
        }

        // ----------------------------------------
        // Deploy Content Controller
        // ----------------------------------------
        const { contentController, beacon: contentBeacon } =
            await deployContentController({
                sTokenAddress: contractMap["SToken"],
                yldAddress: contractMap["YLDToken"],
                feeCollector: contractMap["DEDUAggregator"],
            });
        contractMap["ContentController"] = await contentController.getAddress();
        contractMap["Content"] = await contentBeacon.getAddress();

        const sToken = await ethers.getContractAt(
            "SToken",
            contractMap["SToken"],
            owner
        );

        const dEDUAggregator = await ethers.getContractAt(
            "DEDUAggregator",
            contractMap["DEDUAggregator"],
            owner
        );

        await dEDUAggregator
            .configureCoreContracts(
                contractMap["SToken"],
                contractMap["ContentController"],
                contractMap["Staking"]
            )
            .catch(console.error);

        // Grant roles to ContentController
        await sToken.grantRole(
            await sToken.TRANSFER_ROLE(),
            contractMap["ContentController"]
        );

        await sToken.grantRole(
            await sToken.BINDING_UPDATE_ROLE(),
            contractMap["ContentController"]
        );

        await exportDeployments(abiPaths, contractMap);

        console.log("\n🎉 Upgrade complete!");
    }
);
