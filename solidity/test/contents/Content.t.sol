// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {ContentFixture} from "./ContentFixture.sol";
import {IContent} from "../../contracts/contents/Content.sol";
import {ISToken} from "../../contracts/tokens/ISToken.sol";
import {sTokenLib} from "../../contracts/tokens/sTokenLib.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract ContentTest is ContentFixture, ERC1155Holder {
    using sTokenLib for bytes;
    using sTokenLib for ISToken.Binding;
    using MessageHashUtils for bytes32;

    address verifier;
    uint256 verifierPKey;
    address randomUser = makeAddr("randomUser");

    function setUp() public {
        (verifier, verifierPKey) = makeAddrAndKey("verifier---");
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
            memory expectedDesc = "A foundational content on decentralized finance concepts.";

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

    function testAdminCanSetVerifier() public {
        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit IContent.VerifierUpdated(address(0), verifier);
        content.setVerifier(verifier);
        vm.stopPrank();
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
        content.setVerifier(verifier);
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

    /*//////////////////////////////////////////////////////////////
                        ENROLL SCHOLAR TESTS
//////////////////////////////////////////////////////////////*/

    function testEnrollScholarWithValidSignature() public {
        uint256 token = _mintScholarToken(owner, 100 ether);

        vm.startPrank(owner);
        content.setVerifier(verifier);
        sToken.safeTransferFrom(owner, address(content), token, 100 ether, "");
        vm.stopPrank();

        // 2. Prepare EIP-712 signature
        uint256 deadline = block.timestamp + 1 days;

        bytes32 digest = keccak256(
            abi.encodePacked(address(content), randomUser, deadline)
        ).toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v); // note the order here is different from line above.

        vm.startPrank(randomUser); // caller can be anyone
        content.enrollScholar(deadline, signature);
        vm.stopPrank();
    }

    function testEnrollScholarFailsWithInvalidSignature() public {
        vm.startPrank(owner);
        content.setVerifier(verifier);
        vm.stopPrank();

        uint256 deadline = block.timestamp + 1 days;

        // Sign the digest with the verifier key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            verifierPKey,
            keccak256(abi.encode("Signature"))
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(randomUser);
        vm.expectRevert(bytes("Invalid signature"));
        content.enrollScholar(deadline, signature);
        vm.stopPrank();

        (address someUser, uint256 somePKey) = makeAddrAndKey("SomeUser");
        vm.startPrank(someUser);
        // Sign the digest with the verifier key
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(
            somePKey,
            keccak256(abi.encodePacked(address(content), someUser, deadline))
                .toEthSignedMessageHash()
        );
        bytes memory signature2 = abi.encodePacked(r2, s2, v2);
        vm.expectRevert(bytes("Invalid signature"));
        content.enrollScholar(deadline, signature2);
        vm.stopPrank();
    }

    function testEnrollScholarFailsAfterDeadline() public {
        vm.startPrank(owner);
        content.setVerifier(verifier);
        vm.stopPrank();

        uint256 deadline = block.timestamp - 1; // expired

        // Any dummy signature
        bytes memory signature = hex"1234";

        vm.startPrank(randomUser);
        vm.expectRevert(bytes("Expired signature"));
        content.enrollScholar(deadline, signature);
        vm.stopPrank();
    }
}
