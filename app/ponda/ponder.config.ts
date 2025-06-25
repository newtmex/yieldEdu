import { createConfig } from "ponder";

import stakingAbi from "./contract-deployments/abis/Staking.json";
import addresses from "./contract-deployments/deployments.json";
import { Abi } from "viem";

export default createConfig({
	chains: {
		// eduChain: {
		// 	id: 41923,
		// 	rpc: process.env.PONDER_RPC_URL_1!,
		// },
		localhost: {
			id: 31337,
			rpc: "http://127.0.0.1:8545/",
		},
	},
	contracts: {
		Staking: {
			chain: "localhost",
			abi: stakingAbi.abi as Abi,
			address: addresses.staking as `0x${string}`,
			startBlock: 0,
		},
	},
});
