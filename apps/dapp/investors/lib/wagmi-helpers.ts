import { contractAddresses, stakingAbi } from "@/helpers/deployments";

import { Abi } from "viem";
import { STokenType } from "@/components/invest";

const stakingConfig = stakingAbi.abi;
export const stakingContractAddress =
	contractAddresses.staking as `0x${string}`;

export const getStakingConfig = (
	functionName: string,
	args?: [STokenType, string] | number[] | string[]
) => {
	return {
		abi: stakingConfig as unknown as Abi,
		address: stakingContractAddress,
		functionName: functionName,
		...(args && { args }),
	};
};
