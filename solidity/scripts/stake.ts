import { task } from "hardhat/config";
import { formatEther, parseEther } from "ethers";

task("stake", "Stake ETH, WEDU, or dEDU into the Staking contract")
    .addParam("staking", "Address of the Staking contract")
    .addParam("tokenType", "Token type enum (0 = Learner, 1 = Scholar)")
    .addOptionalParam(
        "type",
        "Type of asset to stake: edu | wedu | dedu",
        "edu"
    )
    .addOptionalParam(
        "amount",
        "Amount of WEDU/dEDU to stake (in wei, required if not using native ETH)"
    )
    .setAction(async ({ staking, tokenType, type, amount }, hre) => {
        amount = parseEther(amount);
        const [signer] = await hre.ethers.getSigners();
        const stakingContract = await hre.ethers.getContractAt(
            "Staking",
            staking,
            signer
        );

        let tx;

        switch (type.toLowerCase()) {
            case "wedu":
                if (!amount)
                    throw new Error("Amount is required for WEDU staking");
                console.log(`Staking ${formatEther(amount)} WEDU...`);

                const weduAddress = await stakingContract.callStatic
                    ._getStakingStorage()
                    .then((s) => s[0]);
                const WEDU = await hre.ethers.getContractAt(
                    "IERC20",
                    weduAddress,
                    signer
                );
                await WEDU.approve(staking, amount);
                tx = await stakingContract.stakeWEDU(tokenType, amount);
                break;

            case "dedu":
                if (!amount)
                    throw new Error("Amount is required for dEDU staking");
                console.log(`Staking ${formatEther(amount)} dEDU...`);

                const dEDU = await stakingContract.callStatic
                    ._getStakingStorage()
                    .then((s) => s[1]);
                const dEDUToken = await hre.ethers.getContractAt(
                    "IERC20",
                    dEDU,
                    signer
                );
                await dEDUToken.approve(staking, amount);
                tx = await stakingContract.stakeDEDU(tokenType, amount);
                break;

            default:
                console.log(
                    `Staking ${formatEther(amount || "0")} ETH as ${
                        tokenType == 0 ? "Learner" : "Scholar"
                    }...`
                );
                tx = await stakingContract.stakeEDU(tokenType, {
                    value: amount || parseEther("1"),
                });
        }

        const receipt = await tx.wait();
        console.log("Transaction mined:", receipt?.hash);
    });
