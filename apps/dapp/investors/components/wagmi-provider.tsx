"use client";

import { wagmiAdapter, educhain, localhost } from "@/lib/wagmi";
import { createAppKit } from "@reown/appkit/react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
// import { arbitrum } from "@reown/appkit/networks";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const devmode = process.env.NEXT_PUBLIC_DEVMODE === "contract";

if (!projectId) {
	throw new Error("Project ID is not defined");
}

const clientFromReactQuery = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnReconnect: true, // refetch when network reconnects
			refetchOnWindowFocus: true, // refetch when user switches back to tab
			refetchOnMount: true, // refetch when component mounts
			retry: 3, // retry failed queries 3 times
			staleTime: 1000 * 60 * 5, // data is fresh for 5 minutes
			gcTime: 1000 * 60 * 10, // garbage collect data
		},
	},
});

const metadata = {
	name: "YieldEdu",
	description:
		"A decentralized education and a fixed-yield protocol that earns users guaranteed yields on their EDU tokens.",
	url: "https://edu-chain-hackathon.vercel.app/",
	icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// the modal
createAppKit({
	adapters: [wagmiAdapter],
	projectId,
	networks: devmode ? [educhain, localhost] : [educhain],
	defaultNetwork: educhain,
	metadata,
	features: {
		analytics: false, // Optional - defaults to Cloud configuration
		socials: ["google", "x", "discord"],
		swaps: false,
		onramp: true,
		receive: true,
		connectMethodsOrder: ["social", "wallet"],
	},

	themeMode: "dark",
	allWallets: "SHOW",
	themeVariables: {
		"--w3m-accent": "#00ff00",
	},
});

const WagmiContextProvider = ({
	children,
	cookies,
}: {
	children: React.ReactNode;
	cookies: string | null;
}) => {
	const initialState = cookieToInitialState(
		wagmiAdapter.wagmiConfig as Config,
		cookies
	);

	return (
		<>
			<WagmiProvider
				config={wagmiAdapter.wagmiConfig as Config}
				initialState={initialState}
			>
				<QueryClientProvider client={clientFromReactQuery}>
					{children}
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</WagmiProvider>
		</>
	);
};

export default WagmiContextProvider;
