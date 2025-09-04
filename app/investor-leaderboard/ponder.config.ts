import { createConfig } from "ponder";
import { deployedContracts as _deployedContracts } from "./abis/deployedContracts";

// ---------------------------------------------------------------------------
// 🔒 Environment variable helpers
// ---------------------------------------------------------------------------
function requireEnv(key: string): string {
    const value = process.env[key]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function requireIntEnv(key: string): number {
    const value = parseInt(requireEnv(key), 10);
    if (isNaN(value)) {
        throw new Error(`Invalid integer for environment variable: ${key}`);
    }
    return value;
}

// ---------------------------------------------------------------------------
// 🌐 Env bindings
// ---------------------------------------------------------------------------
export const API_KEY = requireEnv("API_KEY");

const startBlock = requireIntEnv("START_BLOCK");

const chainID = requireEnv("CHAIN_ID") as keyof typeof _deployedContracts;
const rpc = requireEnv("RPC_URL");

const deployedContracts = _deployedContracts[chainID];
if (!deployedContracts) {
    throw new Error(`No deployedContracts found for chain ID: ${chainID}`);
}

// ---------------------------------------------------------------------------
// ⚙️ Ponder config
// ---------------------------------------------------------------------------
export default createConfig({
    chains: {
        eduChain: {
            id: Number(chainID), // ensures numeric ID
            rpc,
        },
    },
    contracts: {
        YLDToken: {
            chain: "eduChain",
            abi: deployedContracts.YLDToken.abi,
            address: deployedContracts.YLDToken.address,
            startBlock,
        },
    },
    blocks: {
        cron: {
            chain: "eduChain",
            startBlock: "latest", // run cron from current head
            interval: 1, // every block
        },
    },
});
