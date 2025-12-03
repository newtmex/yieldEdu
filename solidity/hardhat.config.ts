import "dotenv/config";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import "./scripts/yieldAccrualUpgrade";
import "./scripts/accrueYield";
import "./scripts/stakingUpgrade";
import "./scripts/stake";
import "./scripts/compileYuzuPoints";

// import "@nomicfoundation/hardhat-foundry"; remove for now, as it causes issues with hardhat compile command

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200, // try 50–200 for small bytecode
            },
            metadata: {
                bytecodeHash: "none", // reduces bytecode size
            },
        },
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
        educhain: {
            url: process.env.EDUCHAIN_RPC!,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
        },
    },
};

export default config;
