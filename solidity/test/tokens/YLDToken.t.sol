// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {YLDTokenFixture} from "./YLDTokenFixture.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract YLDTokenTest is YLDTokenFixture {
    address public minter;
    address public user;

    function setUp() public {
        minter = makeAddr("minter");
        user = makeAddr("user");

        // Grant MINTER_ROLE to minter
        vm.startPrank(owner);
        yld.grantRole(yld.MINTER_ROLE(), minter);
        vm.stopPrank();
    }

    function testNameAndSymbol() public view {
        assertEq(yld.name(), "YieldEDU Token");
        assertEq(yld.symbol(), "YLD");
        assertEq(yld.decimals(), 18);
    }

    function testOnlyMinterCanMintAndWithdraw() public {
        uint256 mintAmount = 1000 ether;
        uint256 shares = mintAmount * 2;
        vm.deal(user, shares);

        vm.startPrank(user);
        // Try minting with unauthorized user
        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        yld.mint(mintAmount, user);
        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        yld.deposit(mintAmount, user);

        // Get dEDU for minter from user and approve yld to spend it
        dedu.receiveForSpender{value: shares}(minter, address(yld));
        vm.stopPrank();

        // Mint with authorized minter
        vm.startPrank(minter);
        yld.mint(mintAmount, user);
        yld.deposit(mintAmount, user);
        vm.stopPrank();

        assertEq(yld.balanceOf(user), shares);
        assertEq(yld.totalAssets(), shares);
        assertEq(yld.totalSupply(), shares);

        // Simulate yield accumulation
        uint256 yield = 500 ether;
        vm.deal(address(this), yield);
        dedu.receiveFor{value: yield}(address(yld));

        // Try withdrawing with unauthorized user
        vm.startPrank(user);
        yld.approve(minter, shares + yield);
        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        yld.withdraw(yield, user, user);
        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        yld.redeem(shares, user, user);
        vm.stopPrank();

        // Withdraw with authorized minter
        vm.startPrank(minter);
        yld.redeem(shares, user, user);
        vm.expectPartialRevert(
            ERC4626Upgradeable.ERC4626ExceededMaxWithdraw.selector
        );
        yld.withdraw(yield, user, user);
        vm.stopPrank();

        assertEq(yld.balanceOf(user), 0);
        assertEq(yld.totalSupply(), 0);

        assertGt(dedu.balanceOf(user), shares);
        assertEq(dedu.balanceOf(user), shares + yield - yld.totalAssets());
    }

    function testDefaultAdminRoleIsOwner() public view {
        assertTrue(yld.hasRole(yld.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testMinterRoleAssignedCorrectly() public view {
        assertTrue(yld.hasRole(yld.MINTER_ROLE(), minter));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        yld.initialize("YieldEDU Token", "YLD", owner, dedu);
    }

    function testOnlyClaimerCanCallCollectYields() public {
        address claimer = makeAddr("claimer");
        address nonClaimer = makeAddr("nonClaimer");

        uint256 yield = 1 ether;
        dedu.setRewardsAvailable(yield);

        // Give CLAIMER_ROLE to `claimer`
        vm.startPrank(owner);
        yld.grantRole(yld.CLAIMER_ROLE(), claimer);
        vm.stopPrank();

        // 1. Unauthorized user should revert
        vm.startPrank(nonClaimer);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                nonClaimer,
                yld.CLAIMER_ROLE()
            )
        );
        yld.collectYields(nonClaimer); // even recipient can't bypass role
        vm.stopPrank();

        // 2. Authorized claimer should succeed
        vm.startPrank(claimer);
        uint256 claimed = yld.collectYields(claimer);
        vm.stopPrank();

        assertEq(
            claimed,
            yield,
            "Should have claimed the correct yield amount"
        );
        assertEq(
            dedu.balanceOf(claimer),
            yield,
            "Claimer should receive yield"
        );
    }
}
