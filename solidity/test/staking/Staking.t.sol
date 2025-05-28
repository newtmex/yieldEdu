// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {Staking} from "../../contracts/staking/Staking.sol";
import {WEDU} from "../../contracts/external/WEDU.sol";
import {ISToken} from "../../contracts/tokens/ISToken.sol";

import {YLDTokenFixture} from "../tokens/YLDTokenFixture.sol";
import {STokenFixture} from "../tokens/STokenFixture.sol";

contract StakingTest is YLDTokenFixture, STokenFixture {
    Staking public staking;
    WEDU public wedu;

    address public user = makeAddr("user");

    function setUp() public {
        wedu = new WEDU();

        Staking impl = new Staking();
        bytes memory initData = abi.encodeWithSelector(
            Staking.initialize.selector,
            address(wedu),
            address(sToken),
            address(yld),
            owner
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        staking = Staking(payable(address(proxy)));

        // Grant MINTER_ROLE to staking contract
        yld.grantRole(yld.MINTER_ROLE(), address(staking));
        sToken.grantRole(sToken.MINTER_ROLE(), address(staking));
    }

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
        vm.expectRevert(Staking.SupplyMismatch.selector);
        staking.stakeDEDU(ISToken.TokenType.Scholar, 3 ether);
    }

    function testRevertOnInsufficientDEDU() public {
        vm.expectRevert(Staking.InsufficientDEDU.selector);
        staking.stakeEDU(ISToken.TokenType.Learner); // doesn't matter, balance checked internally
    }

    function _ensureStakeSuccess(
        uint256 tokenId,
        uint256 shares,
        uint256 amount
    ) internal view {
        assertEq(sToken.balanceOf(user, tokenId), shares);
        assertEq(yld.balanceOf(user), shares);

        assertEq(dedu.balanceOf(address(staking)), 0);

        assertEq(dedu.balanceOf(address(yld)), amount);
        assertEq(yld.totalSupply(), shares);

        assertEq(sToken.totalSupply(), shares);
    }
}
