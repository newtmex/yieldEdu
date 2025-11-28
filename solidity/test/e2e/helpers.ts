import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import deployStakingContract from "../../utils/stakingContract";
import deploySToken from "../../utils/sToken";
import deployYLDToken from "../../utils/yldToken";
import { ethers } from "hardhat";
import { formatEther, parseEther } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

import deployDEDUAggregator from "../../utils/deduAggregator";
import deployContentController from "../../utils/contentController";
import { Content } from "../../typechain-types";

export enum StakeType {
    Learner = 0,
    Scholar = 1,
}

export async function loadStakingFixtures() {
    const { yldToken, mockAsset: dEDUToken } =
        await loadFixture(deployYLDToken);
    const { sToken } = await loadFixture(deploySToken);

    const yldAddress = await yldToken.getAddress();
    const sTokenAddress = await sToken.getAddress();

    const { staking, wedu } = await loadFixture(
        function stakingFixtureWithArgs() {
            return deployStakingContract({
                yldAddress,
                sTokenAddress,
            });
        }
    );

    await yldToken.grantRole(
        await yldToken.MINTER_ROLE(),
        staking.getAddress()
    );
    await sToken.grantRole(await sToken.MINTER_ROLE(), staking.getAddress());

    const [, user, ...otherUsers] = await ethers.getSigners();

    // ------------------------------
    // Convenience staking functions
    // ------------------------------

    async function stakeNative(
        signer: HardhatEthersSigner,

        amountEth: string | number,
        stakeType: StakeType = 0
    ) {
        const value = parseEther(amountEth.toString());
        return staking.connect(signer).stakeEDU(stakeType, { value });
    }

    async function stakeWEDU(
        signer: HardhatEthersSigner,
        amountEth: string | number,
        stakeType: StakeType = 1
    ) {
        const amt = parseEther(amountEth.toString());
        await wedu.connect(signer).deposit({ value: amt });
        await wedu.connect(signer).approve(staking, amt);
        return staking.connect(signer).stakeWEDU(stakeType, amt);
    }

    async function stakeDEDU(
        signer: HardhatEthersSigner,
        amount: string | number,
        stakeType: StakeType = 0
    ) {
        const amt = parseEther(amount.toString());
        await dEDUToken.connect(signer).mint(signer.address, amt);
        await dEDUToken.connect(signer).approve(staking, amt);
        return staking.connect(signer).stakeDEDU(stakeType, amt);
    }

    async function unstake(
        signer: HardhatEthersSigner,
        tokenId: number,
        shares?: bigint
    ) {
        const signerShares = await (shares ?? yldToken.balanceOf(signer));
        await yldToken.connect(signer).approve(staking, signerShares);
        return staking.connect(signer).unStake(tokenId, signerShares);
    }

    return {
        user,
        otherUsers,
        yldToken,
        sToken,
        staking,
        wedu,
        dEDUToken,

        // export convenience methods
        stakeNative,
        stakeWEDU,
        stakeDEDU,
        unstake,
    };
}

export async function loadContentYieldsFixtures() {
    const {
        sToken,
        yldToken,
        stakeDEDU,
        otherUsers: [verifier, contentOwner, ...otherUsers],
        ...otherFixtures
    } = await loadFixture(loadStakingFixtures);

    const { deduAggregator } = await deployDEDUAggregator({
        yldAddr: await yldToken.getAddress(),
        gainzRouterAddr: await sToken.getAddress(),
    });

    const { contentController } = await deployContentController({
        sTokenAddress: await sToken.getAddress(),
        yldAddress: await yldToken.getAddress(),
        feeCollector: await deduAggregator.getAddress(),
    });
    const deployfee = await contentController.deployFee();

    await sToken.grantRole(await sToken.TRANSFER_ROLE(), contentController);
    await sToken.grantRole(
        await sToken.BINDING_UPDATE_ROLE(),
        contentController
    );

    await stakeDEDU(contentOwner, formatEther(deployfee), 0);
    await yldToken
        .connect(contentOwner)
        .approve(contentController, ethers.MaxUint256);
    const { data } = await contentController
        .connect(contentOwner)
        .deployContent("Some Title", "Some Description");

    const [contentAddress] = await contentController.contents();

    const ContentFactory = await ethers.getContractFactory("Content");
    const content = ContentFactory.attach(contentAddress) as Content;

    await content.setVerifier(verifier.address);

    async function fundContentWithScholar(
        investor: HardhatEthersSigner,
        amount: number | string,
        content: Content,
        fundAmount?: bigint
    ) {
        await stakeDEDU(investor, amount, StakeType.Scholar);
        const [nonce] = await sToken.getNonces(investor.address);
        const balance = await sToken.balanceOf(investor.address, nonce);

        const amountToFund = fundAmount ?? balance;
        await sToken.connect(investor).safeTransferFrom(
            investor.address,
            content.getAddress(),
            nonce,
            amountToFund,
            "0x" // optional data
        );

        return { nonce, fundedAmount: amountToFund };
    }

    return {
        contentController,
        content,
        verifier,
        otherUsers,
        stakeDEDU,
        yldToken,
        sToken,
        fundContentWithScholar,
        ...otherFixtures,
    };
}
