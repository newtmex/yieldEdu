// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {ContentFixture} from "./ContentFixture.sol";
import {IContent, STokenHandler} from "../../contracts/contents/Content.sol";
import {ISToken} from "../../contracts/tokens/ISToken.sol";
import {sTokenLib} from "../../contracts/tokens/sTokenLib.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
            string memory id,
            string memory title,
            string memory description,
            uint256 sTokenId
        ) = content.getContentInfo();

        string memory expectedTitle = "Intro to DeFi";
        string
            memory expectedDesc = "A foundational content on decentralized finance concepts.";

        assertEq(id, "cYLD-F5f3F15a");
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

        _simulateYieldWithdraw(investor, yield, shares);

        assertEq(
            content.balanceOf(investor),
            0,
            "Investor Content balance should be cleared after redeem"
        );
        assertEq(content.totalSupply(), 0, "Vault should have no supply left");
        assertEq(
            sToken.balanceOf(investor, firstId + 2),
            shares,
            "Investor should receive sTokens back"
        );
        assertEq(
            yld.balanceOf(investor),
            yield,
            "Investor should receive yield-boosted dEDU"
        );

        _assertContentSTokenID(0);
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
            abi.encode(0)
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

    function testCompleteContent_Learner_WithReferrer() public {
        // Arrange
        address learner = makeAddr("learner");
        address referrer = makeAddr("referrer");

        uint256 mintAmount = content.MIN_BIND();
        _registerLearner(referrer, mintAmount);
        uint256 refId = contentController.getUserId(referrer);
        uint256 learnerTokenId = _registerLearnerWithRef(
            learner,
            mintAmount,
            refId
        );

        // Give the Content vault some yield so previewRedeem() returns > 0
        uint256 vaultYield = 1000;
        _mintYLDToken(contentControllerAddress, vaultYield);

        // Set verifier
        vm.startPrank(owner);
        content.setVerifier(verifier);
        vm.stopPrank();

        // Pack ControllerUnbindData in the same order the contract expects
        uint256 deadline = block.timestamp + 1 days;
        bytes memory completionDataEncoded;
        {
            // Create signature for completion: signature signs keccak256(abi.encodePacked(address(content), learner, deadline, assessmentPoints))
            uint256 assessmentPoints = 50_00; // 50% grade (example)
            bytes32 digest = keccak256(
                abi.encodePacked(
                    address(content),
                    learner,
                    deadline,
                    assessmentPoints
                )
            ).toEthSignedMessageHash();

            (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPKey, digest);
            bytes memory signature = abi.encodePacked(r, s, v);
            completionDataEncoded = abi.encode(
                STokenHandler.ControllerUnbindData({
                    deadline: deadline,
                    signature: signature,
                    assessmentPoints: assessmentPoints
                })
            );
        }

        // Pre-check balances
        IERC20 assetToken = IERC20(content.asset());
        // vm.warp(sToken.getRawTokenAttributes(learnerTokenId).decode().binding.completeAfter + 1);

        // Act: contentController (operator) sends the sToken from learner to Content with completion data
        vm.prank(learner);
        sToken.safeTransferFrom(
            learner,
            contentControllerAddress,
            learnerTokenId,
            mintAmount,
            completionDataEncoded
        );
        vm.stopPrank();

        // Assert token split: learner should have received his split portion (we expect some tokens returned or split)
        // Confirm reward transfers
        assertEq(
            assetToken.balanceOf(learner),
            210,
            "learner reward incorrect"
        );

        assertEq(
            assetToken.balanceOf(content.owner()),
            181,
            "owner reward incorrect"
        );

        assertEq(
            assetToken.balanceOf(referrer),
            36,
            "referrer reward incorrect"
        );

        assertEq(
            assetToken.balanceOf(feeCollector),
            73 + 10000000000000000000,
            // feeCollectorBalBefore + feeCollectorRewardAmount,
            "feeCollector reward incorrect"
        );

        assertEq(
            sToken.balanceOf(learner, learnerTokenId + 1),
            (mintAmount * 7) / 10
        );

          assertEq(
            assetToken.balanceOf(address(content)),
            500,
           "Content contract should retain unallocated rewards"
        );
    }

    // function testCompleteContent_Scholar_NoReferrer() public {
    //     // Arrange
    //     address scholar = makeAddr("scholar");
    //     address feeCollector = makeAddr("feeCollector");

    //     uint256 mintAmount = 100 ether;
    //     uint256 scholarTokenId = _mintScholarToken(scholar, mintAmount);

    //     // Give the Content vault some yield so previewRedeem() returns > 0
    //     uint256 vaultYield = 500 ether;
    //     _mintYLDToken(address(content), vaultYield);

    //     // Set verifier
    //     vm.startPrank(owner);
    //     content.setVerifier(verifier);
    //     vm.stopPrank();

    //     uint256 deadline = block.timestamp + 1 days;
    //     uint256 assessmentPoints = 8_500; // high grade
    //     bytes32 digest = keccak256(
    //         abi.encodePacked(
    //             address(content),
    //             scholar,
    //             deadline,
    //             assessmentPoints
    //         )
    //     ).toEthSignedMessageHash();

    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPKey, digest);
    //     bytes memory signature = abi.encodePacked(r, s, v);

    //     // referrer = address(0) to test branch without referrer reward
    //     bytes memory completionDataEncoded = abi.encode(
    //         deadline,
    //         signature,
    //         assessmentPoints,
    //         feeCollector,
    //         address(0)
    //     );

    //     uint256 totalAvailableReward = content.previewRedeem(mintAmount);

    //     uint256 BASIS_POINT = content.BASIS_POINT();
    //     uint256 a = (60_00 * mintAmount) / BASIS_POINT;
    //     uint256 b = (15_00 * mintAmount) / BASIS_POINT;
    //     uint256 linearPart = a + (((b - a) * assessmentPoints) / BASIS_POINT);
    //     uint256 earnedTokenAmount = mintAmount - linearPart;

    //     uint256 learnerRewardAmount = (earnedTokenAmount *
    //         totalAvailableReward *
    //         60_00) / (BASIS_POINT * mintAmount);

    //     uint256 unallocatedReward = totalAvailableReward - learnerRewardAmount;
    //     uint256 ownerRewardAmount = (unallocatedReward * 62_50) / BASIS_POINT;
    //     uint256 feeCollectorRewardAmount = unallocatedReward -
    //         ownerRewardAmount; // no referrer branch

    //     IERC20 assetToken = IERC20(content.asset());
    //     uint256 scholarBalBefore = assetToken.balanceOf(scholar);
    //     uint256 ownerBalBefore = assetToken.balanceOf(owner);
    //     uint256 feeCollectorBalBefore = assetToken.balanceOf(feeCollector);

    //     // Act
    //     vm.startPrank(contentController);
    //     sToken.safeTransferFrom(
    //         scholar,
    //         address(content),
    //         scholarTokenId,
    //         mintAmount,
    //         completionDataEncoded
    //     );
    //     vm.stopPrank();

    //     // Assert reward transfers
    //     assertEq(
    //         assetToken.balanceOf(scholar),
    //         scholarBalBefore + learnerRewardAmount,
    //         "scholar reward incorrect"
    //     );

    //     assertEq(
    //         assetToken.balanceOf(owner),
    //         ownerBalBefore + ownerRewardAmount,
    //         "owner reward incorrect"
    //     );

    //     assertEq(
    //         assetToken.balanceOf(feeCollector),
    //         feeCollectorBalBefore + feeCollectorRewardAmount,
    //         "feeCollector reward incorrect"
    //     );
    // }

    function test_onERC1155Received_RevertIfNotFromSToken() public {
        address attacker = makeAddr("attacker");

        vm.prank(attacker);
        vm.expectRevert("UNAUTHORIZED_STOKEN");

        content.onERC1155Received(attacker, attacker, 1, 1, "");
    }
}
