/* eslint-disable @typescript-eslint/no-require-imports */
const network = process.env.PUBLIC_DEVMODE || "mainnet";
export const contractAddresses = require(`../${network}-deployments/deployments.json`);
export const stakingAbi = require(`../${network}-deployments/abis/Staking.json`);
