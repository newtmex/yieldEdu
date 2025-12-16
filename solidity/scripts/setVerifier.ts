import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { ContentController } from "../typechain-types";

task("setVerifier")
    .addParam("verifier")
    .addOptionalParam("content")
    .setAction(async ({ content, verifier }, hre) => {
        verifier = hre.ethers.getAddress(verifier);
        let contents = [];

        if (content) {
            contents.push(hre.ethers.getAddress(content));
        } else {
            const controller =
                await hre.ethers.getContract<ContentController>(
                    "ContentController"
                );
            contents = await controller.contents();
        }

        for (const address of contents) {
            const contentContract = await hre.ethers.getContractAt(
                "Content",
                address
            );

            await contentContract.setVerifier(verifier);
        }
    });
