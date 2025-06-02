// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SToken, ISToken} from "../../contracts/tokens/SToken.sol";

import {STokenFixture} from "./STokenFixture.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

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

        address userWithTransferRole = makeAddr("userWithTransferRole");
        sToken.grantRole(sToken.TRANSFER_ROLE(), userWithTransferRole);

        vm.prank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 5, attr);

        assertEq(sToken.balanceOf(user, tokenId), 5);

        vm.prank(user);
        sToken.safeTransferFrom(user, userWithTransferRole, tokenId, 5, "");

        vm.prank(userWithTransferRole);
        sToken.safeTransferFrom(userWithTransferRole, user, tokenId, 5, "");

        vm.prank(user);
        address randomUser = makeAddr("randomUser");
        vm.expectRevert(
            abi.encodeWithSignature(
                "UnAuthorizedSFTTransfer(uint256,address,address,address)",
                tokenId,
                user,
                randomUser,
                user
            )
        );
        sToken.safeTransferFrom(user, randomUser, tokenId, 5, "");
    }

    function testNonMinterCannotMint() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        sToken.sTokenMint(user, 1, attr);

        address userWithTransferRole = makeAddr("userWithTransferRole");
        sToken.grantRole(sToken.TRANSFER_ROLE(), userWithTransferRole);
        vm.prank(userWithTransferRole);
        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        sToken.sTokenMint(user, 1, attr);
    }

    function testNonMinterCannotBurn() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.prank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 10, attr);

        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        sToken.sTokenBurn(user, tokenId, 10);

        address userWithTransferRole = makeAddr("userWithTransferRole");
        sToken.grantRole(sToken.TRANSFER_ROLE(), userWithTransferRole);
        vm.prank(userWithTransferRole);
        vm.expectPartialRevert(
            IAccessControl.AccessControlUnauthorizedAccount.selector
        );
        sToken.sTokenBurn(user, tokenId, 10);

        vm.prank(minter);
        sToken.sTokenBurn(user, tokenId, 10);
        assertEq(sToken.balanceOf(user, tokenId), 0);
    }

    function testSFTTransferMustBeAllAmount() public {
        ISToken.TokenAttributes memory learnerAttr;
        ISToken.TokenAttributes memory scholarAttr;

        learnerAttr.tokenType = ISToken.TokenType.Learner;
        scholarAttr.tokenType = ISToken.TokenType.Scholar;

        address userWithTransferRole = makeAddr("userWithTransferRole");
        sToken.grantRole(sToken.TRANSFER_ROLE(), userWithTransferRole);
        address someAddr = makeAddr("someAddr");

        vm.startPrank(minter);
        uint256 learnerId = sToken.sTokenMint(user, 10, learnerAttr);
        uint256 scholarId = sToken.sTokenMint(user, 5, scholarAttr);
        vm.stopPrank();

        vm.startPrank(user);

        // test transferring less than the full amount
        _expectTransferRevert(10);
        sToken.safeTransferFrom(user, someAddr, learnerId, 5, "");
        _expectTransferRevert(5);
        sToken.safeTransferFrom(user, userWithTransferRole, scholarId, 3, "");

        // test transferring more than the full amount
        _expectTransferRevert(10);
        sToken.safeTransferFrom(user, someAddr, learnerId, 15, "");
        _expectTransferRevert(5);
        sToken.safeTransferFrom(user, userWithTransferRole, scholarId, 10, "");

        vm.stopPrank();

        // test preventing transfer from a user not having sToken at nonce
        address randomUser = makeAddr("randomUser");
        sToken.grantRole(sToken.TRANSFER_ROLE(), randomUser);
        vm.startPrank(randomUser);

        _expectTransferRevert(0);
        sToken.safeTransferFrom(randomUser, someAddr, learnerId, 10, "");
        _expectTransferRevert(0);
        sToken.safeTransferFrom(randomUser, someAddr, scholarId, 5, "");

        vm.stopPrank();
    }

    function _expectTransferRevert(uint256 amount) internal {
        vm.expectRevert(
            abi.encodeWithSignature("MustTransferAllSFTAmount(uint256)", amount)
        );
    }

    function testOwnerIsAdmin() public view {
        assertTrue(sToken.hasRole(sToken.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        sToken.initialize("Again", "AGAIN", owner);
    }
}
