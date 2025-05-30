import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import deployStakingContractFixture from "./fixtures/stakingContractFixture";
import deploySTokenFixture from "./fixtures/sTokenFixture";
import deployYLDTokenFixture from "./fixtures/yldTokenFixture";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("Yield Farming E2E Tests", () => {
    async function loadFixtures() {
        const { yldToken, mockAsset: dEDUToken } = await loadFixture(
            deployYLDTokenFixture
        );
        const { sToken } = await loadFixture(deploySTokenFixture);

        const yldAddress = await yldToken.getAddress();
        const sTokenAddress = await sToken.getAddress();
        const { staking, wedu } = await loadFixture(
            function stakingFixtureWithArgs() {
                return deployStakingContractFixture({
                    yldAddress,
                    sTokenAddress,
                });
            }
        );

        await yldToken.grantRole(
            await yldToken.MINTER_ROLE(),
            staking.getAddress()
        );
        await sToken.grantRole(
            await sToken.MINTER_ROLE(),
            staking.getAddress()
        );

        const [, user] = await ethers.getSigners();

        return {
            user,
            yldToken,
            sToken,
            staking,
            wedu,
            dEDUToken,
        };
    }

    it("stakes native ETH and mints correct shares + sToken", async () => {
        const { user, staking, yldToken, sToken } = await loadFixtures();

        const amount = parseEther("1");
        await expect(staking.connect(user).stakeEDU(0, { value: amount }))
            .to.emit(staking, "Staked")
            .withArgs(
                user.address,
                /* tokenId */ anyValue,
                amount,
                /* shares */ anyValue,
                0
            );

        // shares minted equals yld.totalSupply
        const totalYld = await yldToken.totalSupply();
        const totalSft = await sToken.totalSupply();
        expect(totalYld).to.equal(totalSft);
    });

    it("stakes WEDU and mints correct shares + sToken", async () => {
        const { user, staking, wedu, yldToken, sToken } = await loadFixtures();

        // wrap some ETH into WEDU
        const wrapAmt = parseEther("2");
        await wedu.connect(user).deposit({ value: wrapAmt });
        await wedu.connect(user).approve(staking, wrapAmt);

        await expect(staking.connect(user).stakeWEDU(1, wrapAmt))
            .to.emit(staking, "Staked")
            .withArgs(user.address, anyValue, wrapAmt, anyValue, 1);

        expect(await yldToken.totalSupply()).to.equal(
            await sToken.totalSupply()
        );
    });

    it("stakes dEDU and mints correct shares + sToken", async () => {
        const { user, staking, dEDUToken, yldToken, sToken } =
            await loadFixtures();

        // mint some dEDU to user and approve
        const deduAmt = parseEther("5000");
        await dEDUToken.connect(user).mint(user.address, deduAmt);
        await dEDUToken.connect(user).approve(staking, deduAmt);

        await expect(staking.connect(user).stakeDEDU(0, deduAmt))
            .to.emit(staking, "Staked")
            .withArgs(user.address, anyValue, deduAmt, anyValue, 0);

        expect(await yldToken.totalSupply()).to.equal(
            await sToken.totalSupply()
        );
    });

    it("unstakes correctly and accrues yield for stakers", async () => {
        const { user, staking, yldToken, dEDUToken } = await loadFixtures();

        // first stake some ETH
        const stakeAmt = parseEther("1");
        await staking.connect(user).stakeEDU(0, { value: stakeAmt });

        // simulate some yield accrual
        const yieldAccrual = parseEther("0.1");
        await dEDUToken.mint(yldToken, yieldAccrual);

        // now unstake
        const shares = await yldToken.balanceOf(user);
        await yldToken.connect(user).approve(staking, shares);
        await staking.connect(user).unStake(/* tokenId */ 1, shares);

        // user should receive their original stake back and some yield
        const userBalance = await dEDUToken.balanceOf(user.address);
        expect(userBalance).greaterThan(
            stakeAmt,
            " User should receive more than their original stake since yield was accrued"
        );
    });
});
