import { createConfig } from "ponder";
import { Abi } from "viem";
import { contractAddresses, stakingAbi } from "./helpers/deployments";

const devMode = process.env.PUBLIC_DEVMODE === "contract";
export default createConfig({
	chains: {
		eduChain: {
			id: devMode ? 31337 : 41923,
			rpc: process.env.PONDER_RPC_URL_1!,
		},
	},
	contracts: {
		Staking: {
			chain: "eduChain",
			abi: stakingAbi.abi as Abi,
			address: contractAddresses.staking as `0x${string}`,
			startBlock: 0,
		},
	},
});
