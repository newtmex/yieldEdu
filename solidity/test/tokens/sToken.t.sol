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

    /**
     * @notice Tests splitting a single SFT into multiple new ones and transferring to recipients.
     */
    function testSafeSplitTransferFrom_SuccessfulSplit() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 100, attr);
        vm.stopPrank();

        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        address[] memory recipients = _addressArrayPrefilled(alice, 2);
        recipients[1] = bob;

        uint256[] memory values = _uint256ArrayPrefilled(30, 2);
        values[1] = 50;

        vm.startPrank(user);
        sToken.safeSplitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();

        // total 80 transferred, 20 should remain
        assertEq(sToken.balanceOf(user, tokenId), 20);
        assertEq(sToken.balanceOf(alice, tokenId + 1), 30);
        assertEq(sToken.balanceOf(bob, tokenId + 2), 50);
    }

    /**
     * @notice Reverts if the split transfer exceeds user's available balance.
     */
    function testSafeSplitTransferFrom_RevertIfOverBalance() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 50, attr);
        vm.stopPrank();

        address a = makeAddr("a");
        address b = makeAddr("b");

        address[] memory recipients = _addressArrayPrefilled(a, 2);
        recipients[1] = b;

        uint256[] memory values = _uint256ArrayPrefilled(30, 2);
        values[1] = 40; // exceeds balance

        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC1155InsufficientBalance(address,uint256,uint256,uint256)",
                user,
                20, // this amount remains at this time
                40,
                tokenId
            )
        );
        sToken.safeSplitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();
    }

    /**
     * @notice Reverts if recipients and values arrays have mismatched lengths.
     */
    function testSafeSplitTransferFrom_RevertIfInvalidArrayLength() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 100, attr);
        vm.stopPrank();

        address a = makeAddr("a");
        address b = makeAddr("b");

        address[] memory recipients = _addressArrayPrefilled(a, 2);
        recipients[1] = b;

        uint256[] memory values = _uint256ArrayPrefilled(50, 1); // mismatched length

        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC1155InvalidArrayLength(uint256,uint256)",
                2,
                1
            )
        );
        sToken.safeSplitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();
    }

    /**
     * @notice Reverts if an unauthorised caller attempts a split transfer.
     */
    function testSafeSplitTransferFrom_RevertIfUnauthorizedCaller() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(minter);
        uint256 tokenId = sToken.sTokenMint(user, 100, attr);
        vm.stopPrank();

        address stranger = makeAddr("stranger");
        address a = makeAddr("a");

        address[] memory recipients = _addressArrayPrefilled(a, 1);
        uint256[] memory values = _uint256ArrayPrefilled(50, 1);

        vm.startPrank(stranger);
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC1155MissingApprovalForAll(address,address)",
                stranger,
                user
            )
        );
        sToken.safeSplitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();
    }

    function testOwnerIsAdmin() public view {
        assertTrue(sToken.hasRole(sToken.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        sToken.initialize("Again", "AGAIN", owner);
    }

    function _uint256ArrayPrefilled(
        uint256 first,
        uint256 length
    ) internal pure returns (uint256[] memory arr) {
        assembly {
            let size := add(0x20, mul(length, 0x20))
            arr := mload(0x40)
            mstore(arr, length)
            let dataStart := add(arr, 0x20)

            if gt(length, 0) {
                mstore(dataStart, first)
            }

            let ptr := add(dataStart, 0x20)
            let end := add(dataStart, mul(length, 0x20))
            for {

            } lt(ptr, end) {
                ptr := add(ptr, 0x20)
            } {
                mstore(ptr, 0)
            }

            mstore(0x40, add(arr, size))
        }
    }

    function _addressArrayPrefilled(
        address first,
        uint256 length
    ) internal pure returns (address[] memory arr) {
        assembly {
            // allocate memory
            let size := add(0x20, mul(length, 0x20))
            arr := mload(0x40)
            mstore(arr, length) // store array length
            let dataStart := add(arr, 0x20)

            // set first element
            if gt(length, 0) {
                mstore(dataStart, first)
            }

            // zero out remaining slots
            // start from second element (index 1)
            let ptr := add(dataStart, 0x20)
            let end := add(dataStart, mul(length, 0x20))
            for {

            } lt(ptr, end) {
                ptr := add(ptr, 0x20)
            } {
                mstore(ptr, 0)
            }

            // update free memory pointer
            mstore(0x40, add(arr, size))
        }
    }
}
