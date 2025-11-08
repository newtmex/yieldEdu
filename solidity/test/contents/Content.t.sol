// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {ContentFixture} from "./ContentFixture.sol";
import {Content} from "../../contracts/contents/Content.sol";
import {ISToken} from "../../contracts/tokens/ISToken.sol";
import {sTokenLib} from "../../contracts/tokens/sTokenLib.sol";

contract ContentTest is ContentFixture, ERC1155Holder {
    using sTokenLib for bytes;
    using sTokenLib for ISToken.Binding;

    address verifier = makeAddr("verifier");
    address randomUser = makeAddr("randomUser");

    function setUp() public {
        vm.label(address(content), "Content");
    }

    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testInitializeSetsCorrectValues() public view {
        (
            uint256 id,
            string memory title,
            string memory description,
            uint256 sTokenId
        ) = content.getContentInfo();

        string memory expectedTitle = "Intro to DeFi";
        string
            memory expectedDesc = "A foundational course on decentralized finance concepts.";

        assertEq(
            id,
            uint256(keccak256(abi.encode(expectedTitle, expectedDesc)))
        );
        assertEq(title, expectedTitle);
        assertEq(description, expectedDesc);
        assertEq(sTokenId, 0);
    }

    function testAdminHasRolesAfterInitialization() public view {
        assertTrue(content.hasRole(content.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(content.hasRole(content.ADMIN_ROLE(), owner));
    }

    function testAdminCanAddVerifier() public {
        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit Content.VerifierUpdated(verifier, true);
        content.setVerifier(verifier, true);
        vm.stopPrank();
        assertTrue(content.hasRole(content.VERIFIER_ROLE(), verifier));
    }

    function testAdminCanRemoveVerifier() public {
        vm.startPrank(owner);
        content.setVerifier(verifier, true);
        vm.stopPrank();

        assertTrue(content.hasRole(content.VERIFIER_ROLE(), verifier));

        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit Content.VerifierUpdated(verifier, false);
        content.setVerifier(verifier, false);
        vm.stopPrank();

        assertFalse(content.hasRole(content.VERIFIER_ROLE(), verifier));
    }

    function testNonAdminCannotSetVerifier() public {
        vm.startPrank(randomUser);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                randomUser,
                content.ADMIN_ROLE()
            )
        );
        content.setVerifier(verifier, true);
        vm.stopPrank();
    }

    function testOnlyContentCanMintAndWithdrawViaScholarSToken() public {
        uint256 yield = 1000 ether;
        uint256 shares = yield;
        address investor = makeAddr("investor");

        uint256 firstId = _mintScholarToken(investor, shares);

        _assertUnauthorizedMintAndDeposit(investor, shares, yield);

        _simulateAuthorizedSTokenTransfer(investor, firstId, shares);
        _assertPostMintVaultState(investor, shares);

        _assertContentSTokenID(firstId);

        // Again minting to simulate multiple deposits
        _simulateAuthorizedSTokenTransfer(
            investor,
            _mintScholarToken(investor, shares),
            shares
        );
        shares += shares;
        _assertPostMintVaultState(investor, shares);

        _assertContentSTokenID(firstId);

        // _simulateYieldAndUnauthorizedWithdraw(investor, yield, shares);
        // _simulateAuthorizedWithdraw(investor, yield, shares);

        // _assertFinalVaultState(investor, shares, yield);
    }

    function test_ContentReceivesLearnerTokensAndSplitsIt() public {
        // Arrange
        uint256 mintAmount = 200 ether;
        uint256 learnerTokenId = _mintLearnerToken(randomUser, mintAmount);

        // Act
        vm.startPrank(randomUser);
        sToken.safeTransferFrom(
            randomUser,
            address(content),
            learnerTokenId,
            mintAmount,
            ""
        );
        vm.stopPrank();

        // Assert
        uint256 remainingBalance = sToken.balanceOf(randomUser, learnerTokenId);
        assertTrue(
            remainingBalance > 0 && remainingBalance < mintAmount,
            "Expected a portion of the tokens to be transferred for binding"
        );

        ISToken.TokenAttributes memory remainingAttributes = sToken
            .getRawTokenAttributes(learnerTokenId)
            .decode();
        assertTrue(
            !remainingAttributes.binding.isBound(),
            "Remaining token should be unbound; binding applies only to split portion"
        );
    }
}
