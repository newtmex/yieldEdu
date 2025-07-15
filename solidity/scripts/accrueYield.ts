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

        const yld = await ethers.getContractAt(
            "YLDToken",
            "0x145D410f1c831F185B5815fe4fD76308c76240f9"
        );

        await yld.grantRole(
            await yld.CLAIMER_ROLE(),
            "0x02f506f1b5f951541D60B8Ca742537b80b85E30B"
        );

        const aggregator = await ethers.getContractAt(
            "DEDUAggregator",
            args.aggregator || "0x02f506f1b5f951541D60B8Ca742537b80b85E30B"
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
        console.log("Calling claimAndSwapToDEDU with:");
        console.log(" - path:", path);
        console.log(" - amountOutMin:", amountOutMin.toString());
        console.log(" - deadline:", deadline.toString());

        const tx = await aggregator
            .connect(executor)
            .claimAndSwapToDEDU(path, amountOutMin, deadline);

        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block", receipt?.blockNumber);
    });
