/* eslint-disable @typescript-eslint/no-require-imports */
const network = process.env.NEXT_PUBLIC_DEVMODE || "mainnet";

export const contractAddresses = require(`@/${network}-deployments/deployments.json`);
export const yieldTokenAbi = require(`@/${network}-deployments/abis/YLDToken.json`);
export const weduTokenAbi = require(`@/${network}-deployments/abis/WEDU.json`);
export const sTokenAbi = require(`@/${network}-deployments/abis/SToken.json`);
export const deduTokenAbi = require(`@/${network}-deployments/abis/MockDEDU.json`);
export const stakingAbi = require(`@/${network}-deployments/abis/Staking.json`);
