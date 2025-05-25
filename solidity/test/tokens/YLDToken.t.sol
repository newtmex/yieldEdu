// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {YLDToken} from "../../contracts/tokens/YLDToken.sol";

contract YLDTokenTest is Test {
    YLDToken public yld;
    address public owner;
    address public minter;
    address public user;

    function setUp() public {
        owner = makeAddr("owner");
        minter = makeAddr("minter");
        user = makeAddr("user");

        // Deploy the implementation contract
        YLDToken implementation = new YLDToken();

        // Prepare the initialization data
        bytes memory data = abi.encodeWithSelector(
            YLDToken.initialize.selector,
            "YieldEDU Token",
            "YLD",
            owner
        );

        // Deploy the proxy contract
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);

        // Cast the proxy address to YLDToken
        yld = YLDToken(address(proxy));

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
