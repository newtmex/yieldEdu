/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import yieldTokenConfig from "@/artifacts/contracts/YieldToken.sol/YieldToken.json";
// import yieldPoolConfig from "@/artifacts/contracts/YieldPool.sol/YieldPool.json";
import { Abi } from "viem";
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const yieldPoolConfig = { abi: "" as unknown as Abi };
const yieldTokenConfig = { abi: "" as unknown as Abi };

export const YieldTokenAddress =
	"0x235a61846Cc52410948E37B1d426Cb82F41f940e" as unknown as undefined; //to resolve ts error on page/tsx
export const YieldPoolAddress =
	"0xCbe4C05520F526FEFd0e0FC133bfA24a033546B8" as unknown as undefined;

export const getYieldPoolConfig = (functionName: string, args?: any[]) => {
	return {
		abi: (yieldPoolConfig?.abi as Abi) ?? "",
		address: YieldPoolAddress!,
		functionName: functionName,
		...(args && { args }),
	};
};
export const getYieldTokenConfig = (functionName: string, args?: any[]) => {
	return {
		abi: (yieldTokenConfig?.abi as Abi) ?? "",
		address: YieldTokenAddress,
		functionName: functionName,
		...(args && { args }),
	};
};
