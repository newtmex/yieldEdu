import "dotenv/config";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import "./scripts/yieldAccrualUpgrade";

// import "@nomicfoundation/hardhat-foundry"; remove for now, as it causes issues with hardhat compile command

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        educhain: {
            url: process.env.EDUCHAIN_RPC,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
        },
    },
};

export default config;
