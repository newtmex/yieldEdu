// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SToken, ISToken} from "../../contracts/tokens/SToken.sol";

import {STokenFixture} from "./STokenFixture.sol";

contract STokenTest is STokenFixture {
    address public minter;
    address public user;

    function setUp() public {
        minter = makeAddr("minter");
        user = makeAddr("user");

        // Grant MINTER_ROLE to minter
        vm.startPrank(owner);
        sToken.grantRole(sToken.MINTER_ROLE(), minter);
        vm.stopPrank();
    }

    function testMetadata() public view {
        assertEq(sToken.name(), "YieldEDU SFT");
        assertEq(sToken.symbol(), "sYLD");
    }

    function testMinterCanMintLearnerToken() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.prank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 10, attr);

        assertEq(sToken.balanceOf(user, tokenId), 10);
    }

    function testMintScholarToken() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Scholar;

        address authorizedUser = makeAddr("authorizedUser");
        sToken.grantRole(sToken.TRANSFER_ROLE(), authorizedUser);

        vm.startPrank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 5, attr);
        vm.stopPrank();

        assertEq(sToken.balanceOf(user, tokenId), 5);
    }

    function testNonMinterCannotMint() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.expectRevert();
        sToken.sTokenMint(user, 1, attr);
    }

    function testOwnerIsAdmin() public view {
        assertTrue(sToken.hasRole(sToken.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        sToken.initialize("Again", "AGAIN", owner);
    }
}
