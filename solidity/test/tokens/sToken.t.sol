// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {sToken} from "../../contracts/tokens/sToken.sol";

contract STokenTest is Test {
    sToken public token;
    address public owner;
    address public minter;
    address public user;

    function setUp() public {
        owner = makeAddr("owner");
        minter = makeAddr("minter");
        user = makeAddr("user");

        // Deploy implementation
        sToken implementation = new sToken();

        // Encode initializer call
        bytes memory initData = abi.encodeWithSelector(
            sToken.initialize.selector,
            "YieldEDU SFT",
            "sYLD",
            owner
        );

        // Deploy proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        // Cast to sToken
        token = sToken(address(proxy));

        // Grant MINTER_ROLE to minter
        vm.startPrank(owner);
        token.grantRole(token.MINTER_ROLE(), minter);
        vm.stopPrank();
    }

    function testMetadata() public view {
        assertEq(token.name(), "YieldEDU SFT");
        assertEq(token.symbol(), "sYLD");
    }

    function testMinterCanMintLearnerToken() public {
        sToken.TokenAttributes memory attr = sToken.TokenAttributes({
            tokenType: sToken.TokenType.Learner
        });

        vm.prank(minter);
        uint256 tokenId = token.sTokenMint(user, 10, attr);

        assertEq(token.balanceOf(user, tokenId), 10);
    }

    function testMintScholarToken() public {
        sToken.TokenAttributes memory attr = sToken.TokenAttributes({
            tokenType: sToken.TokenType.Scholar
        });

        vm.prank(minter);
        uint256 tokenId = token.sTokenMint(user, 5, attr);

        assertEq(token.balanceOf(user, tokenId), 5);
    }

    function testNonMinterCannotMint() public {
        sToken.TokenAttributes memory attr = sToken.TokenAttributes({
            tokenType: sToken.TokenType.Learner
        });

        vm.expectRevert();
        token.sTokenMint(user, 1, attr);
    }

    function testOwnerIsAdmin() public view {
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        token.initialize("Again", "AGAIN", owner);
    }
}
