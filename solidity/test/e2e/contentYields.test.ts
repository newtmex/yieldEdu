import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { loadContentYieldsFixtures, StakeType } from "./helpers";
import { AbiCoder, formatEther } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Content } from "../../typechain-types";

describe("Content Yields E2E Tests", () => {
    it("deploys a new content course", async () => {
        const {
            yldToken,
            stakeDEDU,
            otherUsers: [contentOwner],
            contentController,
        } = await loadFixture(loadContentYieldsFixtures);

        /**
         * ==========================================================
         * 1. Determine prerequisites for content deployment
         * ==========================================================
         *
         * Deploying new content requires:
         *   - Sufficient YLD balance to cover the deployment fee
         *   - Prior approval for the ContentController to spend YLD
         *
         * Frontend integration:
         *   const deployFee = await contentController.deployFee();
         *   const balance = await yldToken.balanceOf(userAddress);
         *   Ensure: balance >= deployFee
         */
        const deployFee = await contentController.deployFee();

        /**
         * ==========================================================
         * 2. Stake DEDU to generate YLD for deployment
         * ==========================================================
         *
         * Staking DEDU mints YLD that can be used to pay the deployment fee.
         *
         * Frontend workflow:
         *   await staking.stakeDEDU(StakeType.General, deployFee);
         *
         * This test uses a helper to simulate staking and minting YLD.
         */
        await stakeDEDU(contentOwner, formatEther(deployFee), 0);

        /**
         * ==========================================================
         * 3. Approve YLD spending for the ContentController
         * ==========================================================
         *
         * The creator must approve the controller to spend YLD.
         *
         * Frontend:
         *   await yldToken.approve(contentControllerAddress, MaxUint256);
         */
        await yldToken
            .connect(contentOwner)
            .approve(contentController, ethers.MaxUint256);

        /**
         * ==========================================================
         * 4. Deploy content through the ContentController
         * ==========================================================
         *
         * Frontend:
         *   await contentController.deployContent(title, description);
         *
         * After deployment, the contract address can be retrieved using:
         *   await contentController.contents();
         */
        const tx = await contentController
            .connect(contentOwner)
            .deployContent("My Course Title", "Course Description");

        const [...contents] = await contentController.contents();
        const contentAddress = contents[contents.length - 1];

        /**
         * ==========================================================
         * 5. Attach to the deployed Content contract
         * ==========================================================
         *
         * Frontend can attach to the instance:
         *
         *   const content = new ethers.Contract(
         *       deployedAddress,
         *       ContentABI,
         *       signer
         *   );
         *
         * The Content contract is now ready for learner enrollment,
         * funding operations, and metadata updates (where permitted).
         */
        const ContentFactory = await ethers.getContractFactory("Content");
        const content = ContentFactory.attach(contentAddress) as Content;

        expect(await content.owner()).to.equal(contentOwner.address);
        expect(await content.name()).to.equal("My Course Title");
    });

    it("allows an investor to fund content with Scholar tokens and receive vault tokens", async () => {
        const {
            sToken,
            stakeDEDU,
            otherUsers: [investor],
            content,
        } = await loadFixture(loadContentYieldsFixtures);

        /**
         * ==========================================================
         * 1. Stake DEDU to mint Scholar sTokens
         * ==========================================================
         *
         * Investors fund content using Scholar-type sTokens.
         *
         * Frontend:
         *   await staking.stakeDEDU(StakeType.Scholar, amount);
         *
         * This action mints sTokens that represent the investor’s
         * funding capacity.
         */
        await stakeDEDU(investor, 100, StakeType.Scholar);

        const [nonce] = await sToken.getNonces(investor);

        /**
         * ==========================================================
         * 2. Transfer Scholar sTokens to the content contract
         * ==========================================================
         *
         * Funding is performed by transferring a chosen amount of
         * the sToken balance to the Content contract.
         *
         * Frontend:
         *   await sToken.safeTransferFrom(
         *       investor,
         *       contentAddress,
         *       nonce,
         *       amount,
         *       "0x"
         *   );
         */
        const amountToFund = await sToken.balanceOf(investor, nonce);

        await sToken
            .connect(investor)
            .safeTransferFrom(investor, content, nonce, amountToFund, "0x");

        /**
         * ==========================================================
         * 3. Investor receives vault ERC20 tokens
         * ==========================================================
         *
         * When funding succeeds:
         *   - sTokens are transferred
         *   - Vault tokens are minted to the investor
         *
         * Frontend should check:
         *   await content.balanceOf(investor);
         */
        const vaultBalance = await content.balanceOf(investor.address);

        expect(vaultBalance).to.be.gt(0);
    });

    it("allows a user to enroll as a scholar using a valid EIP-712 signature", async () => {
        const {
            sToken,
            verifier,
            content,
            otherUsers: [financier, randomUser],
            fundContentWithScholar,
        } = await loadFixture(loadContentYieldsFixtures);

        /**
         * ==========================================================
         * 1. Fund the content with Scholar sTokens
         * ==========================================================
         *
         * This setup mirrors the standard investor workflow:
         *   - Stake DEDU to mint Scholar sTokens
         *   - Transfer a portion of those tokens to the Content contract
         *
         * The test uses a helper to simulate these steps.
         */
        await fundContentWithScholar(financier, 50, content);

        /**
         * ==========================================================
         * 2. Prepare the enrollment signature payload
         * ==========================================================
         *
         * The generated signature authorizes a user to enroll.
         *
         * Requirements:
         *   - Deadline should be derived from the on-chain timestamp
         *   - Message format:
         *       keccak256(abi.encodePacked(content, user, deadline))
         *
         * The frontend signs the raw hash bytes using:
         *       signer.signMessage(bytes)
         *
         * Deadlines should be reasonably short (e.g., 24 hours).
         */
        const deadline = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

        const packed = ethers.solidityPacked(
            ["address", "address", "uint256"],
            [await content.getAddress(), randomUser.address, deadline]
        );

        const hash = ethers.keccak256(packed);

        /**
         * Frontend must sign the hash bytes directly.
         * signMessage applies the Ethereum prefix automatically,
         * matching Solidity’s expected behavior.
         */
        const signature = await verifier.signMessage(ethers.getBytes(hash));

        /**
         * ==========================================================
         * 3. User enrolls using the verifier’s signature
         * ==========================================================
         *
         * Frontend:
         *   await content.enrollScholar(deadline, signature);
         *
         * Any user may call this function; authorization depends solely
         * on the signature, not msg.sender.
         */
        await content.connect(randomUser).enrollScholar(deadline, signature);

        /**
         * ==========================================================
         * 4. Verify that enrollment completed successfully
         * ==========================================================
         *
         * A successful enrollment results in:
         *   - Minting a Scholar-type sToken to the user
         *   - Binding that token to the corresponding content contract
         */
        const [...nonces] = await sToken.getNonces(randomUser.address);
        expect(nonces.length).to.equal(1);

        const { binding } = await sToken.getTokenAttributes(nonces[0]);
        expect(binding.content).to.equal(await content.getAddress());
    });

    it("allows learner enrollment without a referral", async () => {
        const {
            otherUsers: [learner],
            stakeDEDU,
            sToken,
            content,
        } = await loadFixture(loadContentYieldsFixtures);

        /**
         * ==========================================================
         * 1. Stake as a learner to mint an sToken
         * ==========================================================
         *
         * Learner staking (StakeType.Learner) mints a unique sToken tied
         * to its own nonce. Each nonce represents a learning position.
         *
         * Frontend:
         *   await staking.stakeDEDU(StakeType.Learner, amount);
         */
        await stakeDEDU(learner, 10, StakeType.Learner);

        /**
         * ==========================================================
         * 2. Retrieve the learner’s sToken nonce
         * ==========================================================
         *
         * Learners may have multiple positions.
         * Frontend retrieves the list using:
         *   const nonces = await sToken.getNonces(user);
         */
        const [nonce] = await sToken.getNonces(learner);
        const encoder = AbiCoder.defaultAbiCoder();

        /**
         * ==========================================================
         * 3. Transfer the sToken to enroll in the content
         * ==========================================================
         *
         * Enrollment is performed by transferring the learner’s sToken
         * to the Content contract.
         *
         * The `data` field should contain the referral ID.
         * For no referral, pass 0.
         *
         * Frontend:
         *   await sToken.safeTransferFrom(
         *       user,
         *       content,
         *       nonce,
         *       balance,
         *       abi.encode(["uint256"], [0])
         *   );
         */
        await sToken
            .connect(learner)
            .safeTransferFrom(
                learner,
                content,
                nonce,
                await sToken.balanceOf(learner, nonce),
                encoder.encode(["uint256"], [0])
            );

        /**
         * ==========================================================
         * 4. Confirm enrollment binding
         * ==========================================================
         *
         * Frontend may verify enrollment by reading token attributes:
         *   const { binding } = await sToken.getTokenAttributes(nonce);
         */
        const { binding } = await sToken.getTokenAttributes(nonce);
        expect(binding.content).to.equal(await content.getAddress());
    });
});
