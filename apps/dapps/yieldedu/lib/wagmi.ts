import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain } from "@reown/appkit/networks";
// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
	throw new Error("PROJECT_ID environment variable is not defined");
}

export const eduTestnet = defineChain({
	id: 656476,
	name: "EDU Chain Testnet",
	chainNamespace: "eip155",
	caipNetworkId: "eip155:656476",
	nativeCurrency: {
		name: "EDU Chain Testnet",
		symbol: "EDU",
		decimals: 18,
	},

	testnet: true,
	rpcUrls: {
		default: {
			http: ["https://rpc.open-campus-codex.gelato.digital"],
		},
	},
	blockExplorers: {
		default: {
			name: "EDU Explorer",
			url: "https://edu-chain-testnet.blockscout.com",
		},
	},
});

export const networks = [eduTestnet];

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
