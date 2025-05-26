// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {YLDTokenFixture} from "./YLDTokenFixture.sol";

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

    function testOnlyMinterCanMint() public {
        uint256 mintAmount = 1000 ether;

        // Try minting with unauthorized user
        vm.expectRevert();
        yld.mint(user, mintAmount);

        // Mint with authorized minter
        vm.prank(minter);
        yld.mint(user, mintAmount);

        assertEq(yld.balanceOf(user), mintAmount);
    }

    function testDefaultAdminRoleIsOwner() public view {
        assertTrue(yld.hasRole(yld.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testMinterRoleAssignedCorrectly() public view {
        assertTrue(yld.hasRole(yld.MINTER_ROLE(), minter));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        yld.initialize("YieldEDU Token", "YLD", owner);
    }
}
