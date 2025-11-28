import { expect } from "chai";
import { parseEther } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadStakingFixtures } from "./helpers";

describe("Yield Farming E2E Tests", () => {
    it("stakes native ETH and mints correct shares + sToken", async () => {
        const { user, staking, yldToken, sToken } = await loadStakingFixtures();

        const amount = parseEther("1");

        /**
         * ================================================
         * FRONTEND: HOW TO CALL stakeEDU WITH NATIVE ETH
         * ================================================
         *
         * stakeEDU(stakeType, { value })
         *
         * - stakeType = 0 (Native stake)
         * - The user passes ETH as msg.value
         */
        await expect(staking.connect(user).stakeEDU(0, { value: amount }))
            /**
             * =================================================
             * FRONTEND: Listen for the "Staked" event in UI
             *
             * This is how the UI retrieves:
             *    - tokenId (nonce)
             *    - actual shares minted
             *
             * These do NOT come back as a normal return value.
             * =================================================
             */
            .to.emit(staking, "Staked")
            .withArgs(
                user.address,
                /* tokenId */ anyValue,
                amount,
                /* shares */ anyValue,
                0 // stakeType = 0
            );

        /**
         * ===========================================================
         * FRONTEND: total YLD supply should match total sToken supply
         * ===========================================================
         *
         * These two assets must always be 1:1 in circulation.
         * The UI can use this invariant to verify syncing.
         */
        const totalYld = await yldToken.totalSupply();
        const totalSft = await sToken.totalSupply();
        expect(totalYld).to.equal(totalSft);
    });

    it("stakes WEDU and mints correct shares + sToken", async () => {
        const { user, staking, wedu, yldToken, sToken } =
            await loadStakingFixtures();

        /**
         * ======================================================
         * FRONTEND: WRAPPING NATIVE ETH INTO WEDU
         * ======================================================
         *
         * This mirrors how the frontend would wrap ETH in the UI:
         *
         *    await WEDU.deposit({ value })
         *
         * The user gets WEDU 1:1.
         */
        const wrapAmt = parseEther("2");
        await wedu.connect(user).deposit({ value: wrapAmt });

        /**
         * =====================================================
         * FRONTEND: APPROVE THE STAKING CONTRACT
         * =====================================================
         *
         * WEDU is an ERC-20 so user must approve before staking:
         *
         *    await WEDU.approve(staking, amount)
         */
        await wedu.connect(user).approve(staking, wrapAmt);

        /**
         * =============================================
         * FRONTEND: stakeWEDU
         * =============================================
         *
         * stakeWEDU(stakeType, amount)
         *
         * - stakeType = 1 (WEDU)
         */
        await expect(staking.connect(user).stakeWEDU(1, wrapAmt))
            .to.emit(staking, "Staked")
            .withArgs(user.address, anyValue, wrapAmt, anyValue, 1);

        expect(await yldToken.totalSupply()).to.equal(
            await sToken.totalSupply()
        );
    });

    it("stakes dEDU and mints correct shares + sToken", async () => {
        const { user, staking, dEDUToken, yldToken, sToken } =
            await loadStakingFixtures();

        /**
         * ===============================================
         * FRONTEND: Mint test dEDU to the user
         * ===============================================
         * In production, the user will *receive* dEDU from
         * somewhere else (e.g., from YieldEDU aggregator).
         */
        const deduAmt = parseEther("5000");
        await dEDUToken.connect(user).mint(user.address, deduAmt);

        /**
         * =======================================================
         * FRONTEND: Approve staking for dEDU
         * =======================================================
         */
        await dEDUToken.connect(user).approve(staking, deduAmt);

        /**
         * ===============================================
         * FRONTEND: stakeDEDU
         * ===============================================
         *
         * stakeDEDU(stakeType, amount)
         *
         * - stakeType = 0 or 1 depending on your enum mapping
         */
        await expect(staking.connect(user).stakeDEDU(0, deduAmt))
            .to.emit(staking, "Staked")
            .withArgs(user.address, anyValue, deduAmt, anyValue, 0);

        expect(await yldToken.totalSupply()).to.equal(
            await sToken.totalSupply()
        );
    });

    it("unstakes correctly and accrues yield for stakers", async () => {
        const { user, staking, yldToken, dEDUToken } =
            await loadStakingFixtures();

        /**
         * ======================================================
         * 1. FRONTEND: Stake 1 ETH
         * ======================================================
         */
        const stakeAmt = parseEther("1");
        await staking.connect(user).stakeEDU(0, { value: stakeAmt });

        /**
         * ======================================================
         * 2. PROTOCOL INTERNAL: Accrue some yield
         * ======================================================
         *
         * In production, this is where GainzSwap generates yield.
         * For testing, we directly mint yield into YLD pool.
         */
        const yieldAccrual = parseEther("0.1");
        await dEDUToken.mint(yldToken, yieldAccrual);

        /**
         * ======================================================
         * 3. FRONTEND: Unstake flow
         * ======================================================
         *
         * UI STEPS:
         *
         * (1) Read user's YLD balance (shares)
         *       shares = await yld.balanceOf(user)
         *
         * (2) Approve staking contract to burn user's YLD
         *
         * (3) Call unStake(tokenId, shares)
         *
         * *tokenId* identifies the sToken position created at stake.
         */
        const shares = await yldToken.balanceOf(user);
        await yldToken.connect(user).approve(staking, shares);

        // Note: tokenId = 1 here because it's the first stake in the fixture
        await staking.connect(user).unStake(/* tokenId */ 1, shares);

        /**
         * =======================================================
         * 4. FRONTEND: UI shows final dEDU balance
         * =======================================================
         *
         * User receives:
         *    (1) Original principal
         *    (2) Yield accrued
         *
         * UI can track this easily by comparing before/after balances.
         */
        const userBalance = await dEDUToken.balanceOf(user.address);

        expect(userBalance).greaterThan(
            stakeAmt,
            "User should receive more than their original stake since yield was accrued"
        );
    });
});
