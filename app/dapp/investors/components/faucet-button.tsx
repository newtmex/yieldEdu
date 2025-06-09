"use client";

// import { useSimulateContract, useWriteContract } from "wagmi";
// import { getYieldTokenConfig } from "@/lib/utils";
// import { toast } from "@/hooks/use-toast";
// import { parseEther } from "viem";
// import { useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
import { Button } from "./ui/button";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FaucetButton = ({ userAddress }: { userAddress?: string }) => {
	// const { data: mintSimulator, error: simulateError } = useSimulateContract({
	// 	...getYieldTokenConfig("mint", [userAddress, parseEther("1.0")]),
	// 	query: {
	// 		enabled: !!userAddress,
	// 	},
	// });

	// const queryClient = useQueryClient();

	// const {
	// 	writeContract: mint,
	// 	error: mintError,
	// 	isPending,
	// } = useWriteContract();

	// const handleMint = async () => {
	// 	if (!userAddress) return;

	// 	try {
	// 		if (mintSimulator?.request) {
	// 			mint(mintSimulator.request, {
	// 				onSuccess: () => {
	// 					toast({
	// 						title: "Mint Successful",
	// 						description: "Tokens have been minted successfully",
	// 					});
	// 					queryClient.invalidateQueries();
	// 				},
	// 				onError: (error) => {
	// 					console.error("Mint error:", error);
	// 					if (error.message.includes("User rejected the request")) {
	// 						toast({
	// 							variant: "destructive",
	// 							title: "Transaction Rejected",
	// 							description: "You rejected the transaction",
	// 						});
	// 						return;
	// 					}
	// 					toast({
	// 						variant: "destructive",
	// 						title: "Transaction Failed",
	// 						description: "An error Occurred when Minting",
	// 					});
	// 				},
	// 			});
	// 		}
	// 	} catch (error) {
	// 		console.error("Mint error:", error);
	// 		console.error("Contract error:", mintError);
	// 		toast({
	// 			variant: "destructive",
	// 			title: "Error",
	// 			description: "An error Occurred when Minting",
	// 		});
	// 	}
	// };

	// Log any simulation errors
	// useEffect(() => {
	// 	if (simulateError) {
	// 		console.warn("Simulation error:", simulateError.cause);
	// 	}
	// }, [simulateError]);

	return (
		<Button
			// onClick={handleMint}
			// disabled={!userAddress || isPending || !!simulateError?.cause}
			variant="outline"
			className="disabled:bg-green-700 text-xs text-white hover:text-white bg-green-500 hover:bg-green-600 border-none font-semibold enabled:active:bg-green-600"
		>
			{/* {isPending
				? "Minting... approve from metamask"
				: !userAddress
				? "Waiting for address"
				: simulateError?.cause
				? "Try again tomorrow"
				: "Get Test Tokens"} */}
			Get Test Tokens
		</Button>
	);
};

export default FaucetButton;
