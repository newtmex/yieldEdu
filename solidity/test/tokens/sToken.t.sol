// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SToken, ISToken, sTokenLib} from "../../contracts/tokens/SToken.sol";
import {STokenFixture} from "./STokenFixture.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract STokenTest is STokenFixture {
    address public user;
    address public otherUser;

    event TokensMerged(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] mergedIds,
        uint256 newId,
        uint256 totalAmount
    );

    function setUp() public {
        user = makeAddr("user");
        otherUser = makeAddr("otherUser");
    }

    // --- Utilities ---

    function _expectTransferRevert(uint256 amount) internal {
        vm.expectRevert(
            abi.encodeWithSignature("MustTransferAllSFTAmount(uint256)", amount)
        );
    }

    // =============================================================
    //                   mergeTransferFrom TESTS
    // =============================================================

    /// @notice should revert when array is empty
    function test_RevertOnEmptyMergeArray() public {
        uint256[] memory ids;

        vm.expectRevert(bytes("EmptyMergeArray"));
        sToken.mergeTransferFrom(user, otherUser, ids);
    }

    /// @notice should revert when recipient is zero
    function test_RevertOnInvalidRecipient() public {
        uint256 id = _mintLearnerToken(user, 10);
        uint256[] memory ids = _uint256ArrayPrefilled(id, 1);

        vm.startPrank(user);
        vm.expectRevert(bytes("InvalidRecipient"));
        sToken.mergeTransferFrom(user, address(0), ids);
        vm.stopPrank();
    }

    /// @notice should revert when caller not owner or approved
    function test_RevertOnUnauthorizedOperator() public {
        uint256 id = _mintLearnerToken(user, 10);
        uint256[] memory ids = _uint256ArrayPrefilled(id, 1);

        // `otherUser` tries without approval
        vm.startPrank(otherUser);
        vm.expectRevert();
        sToken.mergeTransferFrom(user, otherUser, ids);
        vm.stopPrank();
    }

    /// @notice should revert when one of tokens has zero balance
    function test_RevertOnZeroBalanceToken() public {
        uint256 id1 = _mintLearnerToken(user, 10);
        uint256 id2 = id1 + 1; // simulate nonexistent / zero balance token

        uint256[] memory ids = _uint256ArrayPrefilled(id1, 2);
        ids[1] = id2;

        vm.startPrank(user);
        vm.expectRevert(bytes("ZeroBalanceToken"));
        sToken.mergeTransferFrom(user, otherUser, ids);
        vm.stopPrank();
    }

    /// @notice single token merge (degenerate merge)
    function test_SingleTokenMerge() public {
        uint256 id = _mintLearnerToken(user, 100);
        uint256[] memory ids = _uint256ArrayPrefilled(id, 1);

        vm.startPrank(user);
        vm.expectEmit(true, true, true, true);
        emit TokensMerged(user, user, otherUser, ids, id, 100);
        uint256 newNonce = sToken.mergeTransferFrom(user, otherUser, ids);
        vm.stopPrank();

        assertEq(sToken.balanceOf(user, id), 0, "Old token burned");
        assertEq(
            sToken.balanceOf(otherUser, newNonce),
            100,
            "New token minted"
        );
    }

    /// @notice multi-token merge of compatible tokens
    function test_MultiTokenMerge() public {
        uint256 id1 = _mintLearnerToken(user, 50);
        uint256 id2 = _mintLearnerToken(user, 70);

        uint256[] memory ids = _uint256ArrayPrefilled(id1, 2);
        ids[1] = id2;

        vm.startPrank(user);
        uint256 newNonce = sToken.mergeTransferFrom(user, otherUser, ids);
        vm.stopPrank();

        assertEq(sToken.balanceOf(user, id1), 0, "id1 burned");
        assertEq(sToken.balanceOf(user, id2), 0, "id2 burned");
        assertEq(sToken.balanceOf(otherUser, newNonce), 120, "merged total");
    }

    /// @notice operator with approval merges successfully
    function test_AuthorizedOperatorMerge() public {
        uint256 id1 = _mintLearnerToken(user, 30);
        uint256 id2 = _mintLearnerToken(user, 20);

        uint256[] memory ids = _uint256ArrayPrefilled(id1, 2);
        ids[1] = id2;

        vm.startPrank(user);
        sToken.setApprovalForAll(otherUser, true);
        vm.stopPrank();

        vm.startPrank(otherUser);
        uint256 newNonce = sToken.mergeTransferFrom(user, otherUser, ids);
        vm.stopPrank();

        assertEq(sToken.balanceOf(user, id1), 0);
        assertEq(sToken.balanceOf(user, id2), 0);
        assertEq(sToken.balanceOf(otherUser, newNonce), 50);
    }

    /// @notice merging tokens to self (consolidation)
    function test_MergeToSelf() public {
        uint256 id1 = _mintLearnerToken(user, 10);
        uint256 id2 = _mintLearnerToken(user, 15);

        uint256[] memory ids = _uint256ArrayPrefilled(id1, 2);
        ids[1] = id2;

        vm.startPrank(user);
        uint256 newNonce = sToken.mergeTransferFrom(user, user, ids);
        vm.stopPrank();

        assertEq(sToken.balanceOf(user, id2), 0);
        assertEq(newNonce, id1, "Tokens should merge to first nonce");
        assertEq(sToken.balanceOf(user, newNonce), 25);
    }

    /// @notice duplicate IDs in array should revert or handle gracefully (define spec)
    function test_RevertOnDuplicateIDs() public {
        uint256 id1 = _mintLearnerToken(user, 10);
        uint256[] memory ids = _uint256ArrayPrefilled(id1, 2);
        ids[1] = id1;

        vm.startPrank(user);
        // Depending on your spec, expect revert or handle sum
        vm.expectRevert();
        sToken.mergeTransferFrom(user, otherUser, ids);
        vm.stopPrank();
    }

    function testMetadata() public view {
        assertEq(sToken.name(), "YieldEDU SFT");
        assertEq(sToken.symbol(), "sYLD");
    }

    function testMinterCanMintLearnerToken() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.prank(sTokenMinter);
        uint256 tokenId = sToken.sTokenMint(user, 10, attr);

        assertEq(sToken.balanceOf(user, tokenId), 10);
    }

    function testMintScholarToken() public {
        address userWithTransferRole = makeAddr("userWithTransferRole");
        sToken.grantRole(sToken.TRANSFER_ROLE(), userWithTransferRole);

        uint256 tokenId = _mintScholarToken(user, 5);

        assertEq(sToken.balanceOf(user, tokenId), 5);

        vm.prank(user);
        sToken.safeTransferFrom(user, userWithTransferRole, tokenId, 5, "");

        vm.prank(userWithTransferRole);
        sToken.safeTransferFrom(userWithTransferRole, user, tokenId, 5, "");

        // Bind token to prevent unauthorised transfer
        vm.prank(user);
        sToken.setApprovalForAll(address(this), true);
        ISToken.Binding memory binding;
        binding.course = address(this);
        sToken.updateBinding(user, tokenId, binding, "");

        vm.prank(user);
        address randomUser = makeAddr("randomUser");
        vm.expectRevert(
            abi.encodeWithSignature(
                "UnAuthorizedSFTTransfer(uint256,address,address,address,string)",
                tokenId,
                user,
                randomUser,
                user,
                ""
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

        vm.prank(sTokenMinter);
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

        vm.prank(sTokenMinter);
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

        vm.startPrank(sTokenMinter);
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

    /**
     * @notice Tests splitting a single SFT into multiple new ones and transferring to recipients.
     */
    function testsplitTransferFrom_SuccessfulSplit() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(sTokenMinter);
        uint256 tokenId = sToken.sTokenMint(user, 100, attr);
        vm.stopPrank();

        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        address[] memory recipients = _addressArrayPrefilled(alice, 2);
        recipients[1] = bob;

        uint256[] memory values = _uint256ArrayPrefilled(30, 2);
        values[1] = 50;

        vm.startPrank(user);
        sToken.splitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();

        // total 80 transferred, 20 should remain
        assertEq(sToken.balanceOf(user, tokenId), 20);
        assertEq(sToken.balanceOf(alice, tokenId + 1), 30);
        assertEq(sToken.balanceOf(bob, tokenId + 2), 50);
    }

    /**
     * @notice Reverts if the split transfer exceeds user's available balance.
     */
    function testsplitTransferFrom_RevertIfOverBalance() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        uint256 initialMint = 50;

        vm.startPrank(sTokenMinter);
        uint256 tokenId = sToken.sTokenMint(user, initialMint, attr);
        vm.stopPrank();

        address a = makeAddr("a");
        address b = makeAddr("b");

        address[] memory recipients = _addressArrayPrefilled(a, 2);
        recipients[1] = b;

        uint256[] memory values = _uint256ArrayPrefilled(30, 2);
        values[1] = 40;

        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC1155InsufficientBalance(address,uint256,uint256,uint256)",
                user,
                initialMint,
                70,
                tokenId
            )
        );
        sToken.splitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();
    }

    /**
     * @notice Reverts if recipients and values arrays have mismatched lengths.
     */
    function testsplitTransferFrom_RevertIfInvalidArrayLength() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(sTokenMinter);
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
        sToken.splitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();
    }

    /**
     * @notice Reverts if an unauthorised caller attempts a split transfer.
     */
    function testsplitTransferFrom_RevertIfUnauthorizedCaller() public {
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        vm.startPrank(sTokenMinter);
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
        sToken.splitTransferFrom(user, tokenId, recipients, values);
        vm.stopPrank();
    }

    function testOwnerIsAdmin() public view {
        assertTrue(sToken.hasRole(sToken.DEFAULT_ADMIN_ROLE(), owner));
    }

    function testCannotReinitialize() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidInitialization()"));
        sToken.initialize("Again", "AGAIN", owner);
    }
}

contract UpdateBindingTest is STokenFixture, ERC1155Holder {
    using sTokenLib for ISToken.Binding;
    using sTokenLib for bytes;

    address internal admin = address(0xA1);
    address internal user = address(0xB1);
    address internal operator;
    address internal course = address(0xD1);

    uint256 internal nonce = 1;
    bytes internal emptyData = "";

    ISToken.Binding internal newBinding;
    ISToken.Binding internal emptyBinding;

    bytes32 internal constant BINDING_UPDATE_ROLE =
        keccak256("BINDING_UPDATE_ROLE");

    function setUp() public {
        // Give test contract and operator the update role
        sToken.grantRole(BINDING_UPDATE_ROLE, address(this));
        operator = address(this);

        // Mint tokens to user for testing
        _mintScholarToken(user, 10);

        // Define a course binding
        newBinding = ISToken.Binding({
            course: course,
            enrolledAt: block.timestamp,
            completeBy: block.timestamp + 30 days
        });
    }

    // --- 1️⃣ Successful ISToken.Binding (initial bind) ---
    function test_UpdateBinding_BindsSuccessfully() public {
        // Before binding
        ISToken.Binding memory beforeBind = sToken
            .getRawTokenAttributes(nonce)
            .decode()
            .binding;
        assertEq(beforeBind.course, address(0));

        // Give operator approval
        vm.prank(user);
        sToken.setApprovalForAll(operator, true);

        // Perform binding
        sToken.updateBinding(user, nonce, newBinding, emptyData);

        // After binding
        ISToken.Binding memory afterBind = sToken
            .getRawTokenAttributes(nonce)
            .decode()
            .binding;
        assertEq(afterBind.course, course);
        assertTrue(afterBind.isBound());
    }

    // --- 2️⃣ Missing Approval ---
    function test_RevertWhen_NoApprovalOnInitialBinding() public {
        vm.startPrank(operator);
        vm.expectRevert(); // ERC1155MissingApprovalForAll
        sToken.updateBinding(user, nonce, newBinding, emptyData);
        vm.stopPrank();
    }

    // --- 3️⃣ Invalid State: rebinding again ---
    function test_RevertWhen_RebindingSameState() public {
        // Give operator approval and bind once
        vm.startPrank(user);
        sToken.setApprovalForAll(operator, true);
        vm.stopPrank();

        vm.startPrank(operator);
        sToken.updateBinding(user, nonce, newBinding, emptyData);

        // Try rebinding again (already bound)
        vm.expectRevert("sToken: binding state unchanged");
        sToken.updateBinding(user, nonce, newBinding, emptyData);
        vm.stopPrank();
    }

    // --- 4️⃣ Unbinding tokens ---
    function test_UpdateBinding_UnbindsSuccessfullyAndTransfersToCourse()
        public
    {
        // Bind first
        vm.startPrank(user);
        sToken.setApprovalForAll(operator, true);
        vm.stopPrank();

        vm.startPrank(operator);
        sToken.updateBinding(user, nonce, newBinding, emptyData);
        vm.stopPrank();

        // Ensure user owns tokens before unbinding
        assertEq(sToken.balanceOf(user, nonce), 10);

        // Mock that contract has the role to unbind
        vm.startPrank(operator);
        sToken.updateBinding(user, nonce, emptyBinding, emptyData);
        vm.stopPrank();

        // After unbinding, tokens should move from user → course
        assertEq(sToken.balanceOf(user, nonce), 0);
        assertEq(sToken.balanceOf(course, nonce), 10);
    }

    // --- 5️⃣ Revert When Invalid ISToken.Binding Update (no tokens) ---
    function test_RevertWhen_NoTokenBalance() public {
        vm.expectRevert("sToken: no token balance at nonce");
        sToken.updateBinding(address(0xE1), nonce, newBinding, emptyData);
    }

    // --- 6️⃣ Role Restriction ---
    function test_RevertWhen_CallerHasNoUpdateRole() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                user,
                BINDING_UPDATE_ROLE
            )
        );
        vm.prank(user);
        sToken.updateBinding(user, nonce, newBinding, emptyData);
    }
}
