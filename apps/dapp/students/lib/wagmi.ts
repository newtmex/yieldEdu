import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain } from "@reown/appkit/networks";
// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const devmode = process.env.NODE_ENV === "development";

if (!projectId) {
	throw new Error("PROJECT_ID environment variable is not defined");
}

export const educhain = defineChain({
	id: 41923,
	name: "EDU Chain",
	chainNamespace: "eip155",
	caipNetworkId: "eip155:41923",
	nativeCurrency: {
		name: "EDU",
		symbol: "EDU",
		decimals: 18,
	},

	testnet: false,
	rpcUrls: {
		default: {
			http: ["https://rpc.edu-chain.raas.gelato.cloud"],
			webSocket: ["wss://ws.edu-chain.raas.gelato.cloud"],
		},
	},
	blockExplorers: {
		default: {
			name: "EDUChain Explorer",
			url: "https://educhain.blockscout.com",
		},
	},
});
export const localhost = defineChain({
	id: 31337,
	name: "localhost",
	chainNamespace: "eip155",
	caipNetworkId: "eip155:31337",
	nativeCurrency: {
		name: "localhost",
		symbol: "LH",
		decimals: 18,
	},

	testnet: true,
	rpcUrls: {
		default: {
			http: ["http://127.0.0.1:8545"],
		},
	},
});

export const networks = devmode ? [educhain, localhost] : [educhain];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
	storage: createStorage({
		storage: cookieStorage,
	}),
	ssr: true,
	projectId,
	networks,
});

export const config = wagmiAdapter.wagmiConfig;
