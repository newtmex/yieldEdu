import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";

// import "@nomicfoundation/hardhat-foundry"; remove for now, as it causes issues with hardhat compile command

const config: HardhatUserConfig = {
    solidity: "0.8.28",
};

export default config;
