import { parseEther } from "ethers";
import { task } from "hardhat/config";

task("accrueYield", "Claims GAINZ and swaps to dEDU via DEDUAggregator")
    .addOptionalParam("aggregator", "Address of the DEDUAggregator contract")
    .addOptionalParam(
        "path",
        "Comma-separated swap path (e.g. token1,token2,dEDU)"
    )
    .addParam("minOut", "Minimum amount of dEDU to receive")
    .addOptionalParam("deadline", "Deadline timestamp (default: now + 10 mins)")
    .setAction(async (args, hre) => {
        const { ethers } = hre;
        const [executor] = await ethers.getSigners();

        const aggregator = await ethers.getContractAt(
            "DEDUAggregator",
            args.aggregator || "0xe2e1E9fd9149Fa801A344504f454b1a552b0668C"
        );

        const path: string[] = args?.path?.split(",") || [
            "0x32eDd6f3453f4b1F7Ad9DC4CEAF3Cff861f1080F",
            "0x597FFfA69e133Ee9b310bA13734782605C3549b7",
        ];
        const amountOutMin = parseEther(args.minOut);
        const deadline = await ethers.provider
            .getBlock("latest")
            .then((block) => {
                return (block?.timestamp || 0) + 60000;
            });

        console.log("Executor:", executor.address);
        console.log("Calling accumulateRewards with:");
        console.log(" - path:", path);
        console.log(" - amountOutMin:", amountOutMin.toString());
        console.log(" - deadline:", deadline.toString());

        const tx = await aggregator
            .connect(executor)
            .accumulateRewards(path, amountOutMin, deadline);

        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block", receipt?.blockNumber);
    });
