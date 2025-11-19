// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IStaking} from "../../contracts/staking/IStaking.sol";
import {WEDU} from "../../contracts/external/WEDU.sol";
import {ISToken} from "../../contracts/tokens/ISToken.sol";

import {StakingFixture} from "./StakingFixture.sol";

contract StakingTest is StakingFixture {
    address public user = makeAddr("user");

    function setUp() public {}

    function testStakeDEDUAndMint() public {
        uint256 stakeAmount = 10 ether;

        // Setup balances
        dedu.mint(user, stakeAmount);
        vm.prank(user);
        dedu.approve(address(staking), stakeAmount);

        vm.prank(user);
        (uint256 tokenId, uint256 shares) = staking.stakeDEDU(
            ISToken.TokenType.Learner,
            stakeAmount
        );

        _ensureStakeSuccess(tokenId, shares, stakeAmount);
    }

    function testStakeETHAndMint() public {
        uint256 ethAmount = 5 ether;

        vm.deal(user, ethAmount);
        vm.prank(user);
        (uint256 tokenId, uint256 shares) = staking.stakeEDU{value: ethAmount}(
            ISToken.TokenType.Scholar
        );

        _ensureStakeSuccess(tokenId, shares, ethAmount);
    }

    function testStakeWEDUAndMint() public {
        uint256 ethAmount = 5 ether;
        vm.deal(user, ethAmount);

        vm.startPrank(user);

        wedu.deposit{value: ethAmount}();
        wedu.approve(address(staking), ethAmount);
        (uint256 tokenId, uint256 shares) = staking.stakeWEDU(
            ISToken.TokenType.Scholar,
            ethAmount
        );

        vm.stopPrank();
        _ensureStakeSuccess(tokenId, shares, ethAmount);
    }

    function testRevertOnSupplyMismatch() public {
        // Force mismatch by minting YLD ignoring sToken supply
        vm.startPrank(address(staking));
        dedu.mint(address(staking), 1 ether);
        yld.mint(1 ether, address(0x1));
        vm.stopPrank();

        // Now try to stake
        dedu.mint(user, 3 ether);

        vm.startPrank(user);
        dedu.approve(address(staking), 3 ether);
        vm.expectRevert(IStaking.SupplyMismatch.selector);
        staking.stakeDEDU(ISToken.TokenType.Scholar, 3 ether);
    }

    function testRevertOnInsufficientDEDU() public {
        vm.expectRevert(IStaking.InsufficientDEDU.selector);
        staking.stakeEDU(ISToken.TokenType.Learner); // doesn't matter, balance checked internally
    }

    function _ensureStakeSuccess(
        uint256 tokenId,
        uint256 shares,
        uint256 amount
    ) internal {
        assertEq(sToken.balanceOf(user, tokenId), shares);
        assertEq(yld.balanceOf(user), shares);

        assertEq(dedu.balanceOf(address(staking)), 0);

        assertEq(dedu.balanceOf(address(yld)), amount);
        assertEq(yld.totalSupply(), shares);

        assertEq(sToken.totalSupply(), shares);

        //  Test un-staking

        vm.startPrank(user);
        yld.approve(address(staking), shares);
        staking.unStake(tokenId, shares);
        vm.stopPrank();

        assertEq(sToken.balanceOf(user, tokenId), 0);
        assertEq(yld.balanceOf(user), 0);

        assertEq(dedu.balanceOf(address(staking)), 0);

        assertGe(dedu.balanceOf(address(yld)), 0);
    }
}
