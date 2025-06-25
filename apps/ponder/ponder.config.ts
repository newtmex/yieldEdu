import { createConfig } from "ponder";
import { Abi } from "viem";
import { contractAddresses, stakingAbi } from "./helpers/deployments";

export default createConfig({
	chains: {
		eduChain: {
			id: 41923,
			rpc: process.env.PONDER_RPC_URL_1!,
		},
		// localhost: {
		// 	id: 31337,
		// 	rpc: "http://127.0.0.1:8545/",
		// },
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
