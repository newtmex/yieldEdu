// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ISToken} from "../tokens/ISToken.sol";

import {STokenHandler} from "../abstracts/STokenHandler.sol";
import {ContentLib} from "./ContentLib.sol";
import {IContent} from "./IContent.sol";
import {sTokenLib} from "../tokens/sTokenLib.sol";

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @dev out = (minOut * (maxIn - currentIn) + maxOut * (currentIn - minIn)) / (maxIn - minIn)
/// 	 https://en.wikipedia.org/wiki/LinearInterpolation
function linearInterpolation(
    uint256 minIn,
    uint256 maxIn,
    uint256 currentIn,
    uint256 minOut,
    uint256 maxOut
) pure returns (uint256) {
    if (currentIn < minIn || currentIn > maxIn) {
        revert("MathLinearInterpolationInvalidValues");
    }

    uint256 minOutWeighted = minOut * (maxIn - currentIn);
    uint256 maxOutWeighted = maxOut * (currentIn - minIn);
    uint256 inDiff = maxIn - minIn;

    return (minOutWeighted + maxOutWeighted) / inDiff;
}

/// @title Content Contract
/// @notice Handles learner and scholar enrollments for a specific content,
///         binding semi-fungible tokens (sTokens) to a content controller and minting ERC4626 vault shares.
contract Content is
    IContent,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    STokenHandler,
    ERC4626Upgradeable
{
    using sTokenLib for bytes;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    /// @notice Minimum binding threshold
    uint256 public constant MIN_BIND = 10 ether;
    uint256 public constant BASIS_POINT = 100_00;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    struct ContentStorage {
        uint256 sTokenId;
        string description;
        address contentController;
        uint256 courseDuration; // in seconds
        uint256 minBindAmount;
        address verifier;
    }

    /// @custom:storage-location erc7201:yieldEDU.contents.content.storage
    bytes32 private constant CONTENT_STORAGE_LOCATION =
        keccak256("yieldEDU.contents.content.storage");

    function _getContentStorage()
        internal
        pure
        returns (ContentStorage storage $)
    {
        bytes32 position = CONTENT_STORAGE_LOCATION;
        assembly {
            $.slot := position
        }
    }

    /*//////////////////////////////////////////////////////////////
                             INITIALIZER
    //////////////////////////////////////////////////////////////*/

    function initialize(
        string memory _title,
        string memory _description,
        string memory symbol,
        address _rewardToken,
        address _sToken,
        address _admin
    ) public initializer {
        __AccessControl_init();
        __Ownable_init(msg.sender);
        __sTokenHandler_init(ISToken(_sToken));

        __ERC20_init(_title, symbol);
        __ERC4626_init(IERC20(_rewardToken));

        ContentStorage storage $ = _getContentStorage();
        $.description = _description;

        _setCourseController($, msg.sender);
        _setCourseDuration($, 7 days);
        _setMinBindAmount($, MIN_BIND);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

    /*//////////////////////////////////////////////////////////////
                             ADMIN LOGIC
    //////////////////////////////////////////////////////////////*/

    function setVerifier(address _verifier) external onlyRole(ADMIN_ROLE) {
        require(_verifier != address(0), "Invalid verifier");

        ContentStorage storage $ = _getContentStorage();

        address oldVerifier = $.verifier;
        $.verifier = _verifier;
        emit VerifierUpdated(oldVerifier, _verifier);
    }

    function _setCourseController(
        ContentStorage storage $,
        address newController
    ) internal {
        require(newController != address(0), "Invalid controller");
        address oldController = $.contentController;
        $.contentController = newController;
        emit CourseControllerUpdated(oldController, newController);
    }

    function _setCourseDuration(
        ContentStorage storage $,
        uint256 newDuration
    ) internal {
        require(newDuration > 0, "Invalid duration");
        uint256 oldDuration = $.courseDuration;
        $.courseDuration = newDuration;
        emit CourseDurationUpdated(oldDuration, newDuration);
    }

    function _setMinBindAmount(
        ContentStorage storage $,
        uint256 newAmount
    ) internal {
        require(newAmount >= MIN_BIND, "Below min threshold");
        uint256 oldAmount = $.minBindAmount;
        $.minBindAmount = newAmount;
        emit MinBindAmountUpdated(oldAmount, newAmount);
    }

    /*//////////////////////////////////////////////////////////////
                             ERC4626 OVERRIDES
    //////////////////////////////////////////////////////////////*/

    modifier notAllowed() {
        if (msg.sender != address(this)) revert NotAllowed();
        _;
    }

    function _availableBalanceAndShares(
        address owner
    ) internal view returns (uint256 balance, uint256 shares) {
        uint256 tokenId = _getContentStorage().sTokenId;
        balance = sToken().balanceOf(address(this), tokenId);
        shares = balanceOf(owner);
    }

    function maxWithdraw(address owner) public view override returns (uint256) {
        return _convertToAssets(maxRedeem(owner), Math.Rounding.Floor);
    }

    function maxRedeem(address owner) public view override returns (uint256) {
        (uint256 balance, uint256 shares) = _availableBalanceAndShares(owner);
        return Math.min(balance, shares);
    }

    function _deposit(
        address,
        address,
        uint256,
        uint256
    ) internal override notAllowed {}

    /**
     * @dev Withdraw/redeem common workflow.
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }

        // If asset() is ERC-777, `transfer` can trigger a reentrancy AFTER the transfer happens through the
        // `tokensReceived` hook. On the other hand, the `tokensToSend` hook, that is triggered before the transfer,
        // calls the vault, which is assumed not malicious.
        //
        // Conclusion: we need to do the transfer after the burn so that any reentrancy would happen after the
        // shares are burned and after the assets are transferred, which is a valid state.
        _burn(owner, shares);
        SafeERC20.safeTransfer(IERC20(asset()), receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);

        ContentStorage storage $ = _getContentStorage();
        ($.sTokenId, ) = _splitToken(sToken(), $.sTokenId, shares, receiver);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(STokenHandler, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Returns the core metadata of this content
    function getContentInfo()
        external
        view
        returns (
            string memory _symbol,
            string memory _name,
            string memory description,
            uint256 sTokenId
        )
    {
        ContentStorage storage $ = _getContentStorage();
        return (symbol(), name(), $.description, $.sTokenId);
    }

    /*//////////////////////////////////////////////////////////////
                        STUDENT ENROLLMENT LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Enroll a scholar using a signed authorization from the verifier
    function enrollScholar(
        uint256 deadline,
        bytes calldata signature
    ) external {
        address scholar = msg.sender;

        _validateSignedMessage(
            deadline,
            signature,
            abi.encodePacked(address(this), scholar, deadline)
        );

        __Enroll__(sToken(), scholar, 0, 0);
    }

    function _validateSignedMessage(
        uint256 deadline,
        bytes memory signature,
        bytes memory message
    ) internal view {
        ContentStorage storage $ = _getContentStorage();
        address verifier = $.verifier;

        require(verifier != address(0), "Verifier not set");
        require(block.timestamp <= deadline, "Expired signature");

        // Recover the signer
        address recovered = keccak256(message).toEthSignedMessageHash().recover(
            signature
        );
        require(recovered == verifier, "Invalid signature");
    }

    /**
     * @dev Merge a newly received scholar token into the held token of this contract.
     * Retains existing nonce by merging newTokenId into currentTokenId.
     */
    function _mergeHeldScholarTokens(
        ISToken sToken,
        uint256 newTokenId
    ) private {
        ContentStorage storage $ = _getContentStorage();
        uint256 currentTokenId = $.sTokenId;

        if (currentTokenId != 0) {
            uint256[] memory mergeIds = new uint256[](2);
            // Order matters for merging,
            // so we put the current first to retain its nonce
            // as newTokenId will merged into it
            mergeIds[0] = currentTokenId;
            mergeIds[1] = newTokenId;

            $.sTokenId = sToken.mergeTransferFrom(
                address(this),
                address(this),
                mergeIds
            );
        } else {
            $.sTokenId = newTokenId;
        }
    }

    /**
     * @notice Splits a learner's sToken position into a "bound" portion and a
     *         "refundable" portion, sending the refundable excess back to `recipient`.
     *
     * @dev
     * - If no refund is needed (`refundAmount == 0`), the original token ID is returned.
     * - Otherwise:
     *      1. The token is split into:
     *         - `bindAmount` → kept by this contract (returned as `boundTokenId`)
     *         - `refundAmount` → transferred back to `recipient`
     *      2. Returns the tokenId of the newly created bound portion.
     * - Assumes this contract holds the `tokenId` being split.
     *
     * @param sToken_       The sToken contract instance.
     * @param recipient     Address receiving the refund portion.
     * @param tokenId       The SFT ID representing the full user position.
     * @param bindAmount    Amount that must remain bound to the content.
     * @param refundAmount  Amount of the token that should be returned to the user.
     *
     * @return boundTokenId The newly created token ID representing the bound portion.
     */
    function _splitAndRefund(
        ISToken sToken_,
        address recipient,
        uint256 tokenId,
        uint256 bindAmount,
        uint256 refundAmount
    ) internal returns (uint256 boundTokenId) {
        // No split required — entire token is fully bound.
        if (refundAmount == 0) {
            return tokenId;
        }

        // Step 1: Split the bound portion out and keep it in this contract.
        (, boundTokenId) = _splitToken(
            sToken_,
            tokenId,
            bindAmount,
            address(this)
        );

        // Step 2: Transfer the refundable portion back to the original recipient.
        sToken_.safeTransferFrom(
            address(this),
            recipient,
            tokenId,
            refundAmount,
            ""
        );

        return boundTokenId;
    }

    /**
     * @notice Splits a semi-fungible token (sToken) into two portions:
     *         1. The residual portion that remains with the original token ID.
     *         2. The new token representing the `splitAmount`, sent to a specified recipient.
     *
     * @dev
     * - This contract must own the `tokenId` being split.
     * - Uses `splitTransferFrom` of the sToken to perform the split.
     * - Reverts if no new token ID is generated.
     *
     * @param sToken_       The sToken contract instance.
     * @param tokenId       The original token ID to split.
     * @param splitAmount   The portion of the token to separate into a new token.
     * @param recipient     The address that will receive the new split token.
     *
     * @return residualTokenId  The token ID of the portion that remains with the original token.
     * @return newTokenId       The token ID of the newly created split token.
     */
    function _splitToken(
        ISToken sToken_,
        uint256 tokenId,
        uint256 splitAmount,
        address recipient
    ) internal returns (uint256 residualTokenId, uint256 newTokenId) {
        // Prepare arrays for the splitTransferFrom call
        (
            uint256[] memory splitAmounts,
            address[] memory splitRecipients
        ) = _asArraysOfLength(splitAmount, recipient, 1);

        // Perform the split
        uint256[] memory generatedTokenIds;
        (residualTokenId, generatedTokenIds) = sToken_.splitTransferFrom(
            address(this),
            tokenId,
            splitRecipients,
            splitAmounts
        );

        // Ensure that a new token was actually created
        if (generatedTokenIds.length == 0) revert SplitFailed();

        newTokenId = generatedTokenIds[0];
    }

    /**
     * @dev Handles ERC1155 receipt for Learner or Scholar sTokens.
     * Delegates to respective enrollment handlers.
     */
    function _onERC1155Received(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal override returns (bytes4) {
        ISToken sToken_ = sToken();
        ISToken.TokenAttributes memory tokenAttr = sToken_
            .getRawTokenAttributes(tokenId)
            .decode();

        if (operator == _getContentStorage().contentController) {
            __CompleteContent__(
                tokenAttr.tokenType,
                data,
                sToken_,
                from,
                tokenId,
                value
            );
        } else if (tokenAttr.tokenType == ISToken.TokenType.Scholar) {
            __AcceptInvestment__(sToken_, from, tokenId, value);
        } else if (tokenAttr.tokenType == ISToken.TokenType.Learner) {
            __Enroll__(sToken_, from, tokenId, value);
        } else {
            revert("Content: Invalid sToken Action");
        }

        return this.onERC1155Received.selector;
    }

    function __CompleteContent__(
        ISToken.TokenType sTokenType,
        bytes memory completionDataEncoded,
        ISToken sToken,
        address learner,
        uint256 sTokenId,
        uint256 sTokenAmount
    ) private {
        uint256 totalAvailableReward = previewRedeem(sTokenAmount);

        ContentCompleteData memory completionData = abi.decode(
            completionDataEncoded,
            (ContentCompleteData)
        );

        _validateSignedMessage(
            completionData.deadline,
            completionData.signature,
            abi.encodePacked(
                address(this),
                learner,
                completionData.deadline,
                completionData.assessmentPoints
            )
        );

        require(
            completionData.assessmentPoints <= BASIS_POINT,
            "INVALID assessment grade"
        );

        uint256 earnedTokenAmount = linearInterpolation(
            0,
            BASIS_POINT,
            completionData.assessmentPoints,
            (40_00 * sTokenAmount) / BASIS_POINT,
            sTokenAmount
        );

        uint256 learnerRewardAmount = (earnedTokenAmount *
            totalAvailableReward *
            60_00) / (BASIS_POINT * sTokenAmount);

        _burn(address(this), sTokenAmount);

        if (sTokenType == ISToken.TokenType.Scholar) {
            _mergeHeldScholarTokens(sToken, sTokenId);
        } else if (sTokenType == ISToken.TokenType.Learner) {
            if (earnedTokenAmount < sTokenAmount) {
                (
                    uint256[] memory values,
                    address[] memory recipients
                ) = _asArraysOfLength(earnedTokenAmount, learner, 2);
                values[1] = sTokenAmount - earnedTokenAmount;
                recipients[1] = completionData.feeCollector;

                sToken.splitTransferFrom(
                    address(this),
                    sTokenId,
                    recipients,
                    values
                );
            } else {
                sToken.safeTransferFrom(
                    address(this),
                    learner,
                    sTokenId,
                    sTokenAmount,
                    ""
                );
            }
        } else {
            revert("Content.__CompleteContent__: Invalid sToken Action");
        }

        uint256 unallocatedReward = totalAvailableReward - learnerRewardAmount;
        uint256 feeCollectorRewardAmount = unallocatedReward;
        IERC20 rewardToken = IERC20(asset());

        SafeERC20.safeTransfer(rewardToken, learner, learnerRewardAmount);

        address contentOwner = owner();
        if (contentOwner != address(0)) {
            uint256 ownerRewardAmount = (unallocatedReward * 62_50) /
                BASIS_POINT;

            SafeERC20.safeTransfer(
                rewardToken,
                contentOwner,
                ownerRewardAmount
            );
            feeCollectorRewardAmount -= ownerRewardAmount;
        }
        if (completionData.referrer != address(0)) {
            uint256 referrerRewardAmount = (unallocatedReward * 12_50) /
                BASIS_POINT;
            SafeERC20.safeTransfer(
                rewardToken,
                completionData.referrer,
                referrerRewardAmount
            );
            feeCollectorRewardAmount -= referrerRewardAmount;
        }

        SafeERC20.safeTransfer(
            rewardToken,
            completionData.feeCollector,
            feeCollectorRewardAmount
        );
    }

    function __AcceptInvestment__(
        ISToken sToken_,
        address investor,
        uint256 tokenId,
        uint256 tokenValue
    ) private {
        _mergeHeldScholarTokens(sToken_, tokenId);
        _mint(investor, tokenValue);
    }

    /**
     * @notice Enrolls a student or scholar in a course by transferring a bound sToken
     *         to the content controller and minting the corresponding vault shares to this content.
     * @dev This function handles both learner and scholar enrollment scenarios:
     *      - Learner enrollment (`tokenValue > 0`): splits the token, ensures sufficient value,
     *        and refunds any excess.
     *      - Scholar enrollment (`tokenValue == 0`): splits the sToken from the main sToken pool.
     *      Performs internal storage retrieval and validates the controller, owner, and minimum bind amount.
     *      After splitting, the bound token is transferred to the content controller for enrollment tracking.
     *
     * @param sToken_ The sToken contract instance representing semi-fungible tokens.
     * @param student The address of the student or scholar being enrolled.
     * @param tokenId The ID of the sToken to split and enroll.
     * @param tokenValue The value of the token for enrollment:
     *                   - `> 0`: indicates learner enrollment; used to check sufficient funds and calculate refunds.
     *                   - `0`: indicates scholar enrollment; uses default minBindAmount.
     * */
    function __Enroll__(
        ISToken sToken_,
        address student,
        uint256 tokenId,
        uint256 tokenValue
    ) private {
        ContentStorage storage $ = _getContentStorage();

        uint256 duration = $.courseDuration;
        address controller = $.contentController;

        if (owner() == address(0) || controller == address(0))
            revert("InvalidControllerOrOwner");

        uint256 mintAmount = $.minBindAmount;
        if (mintAmount < MIN_BIND) revert InvalidBindAmount();

        uint256 bindId;
        if (tokenValue > 0) {
            // Handle as learner enrollment
            if (tokenValue < mintAmount) revert InsufficientValue();
            bindId = _splitAndRefund(
                sToken_,
                student,
                tokenId,
                mintAmount,
                tokenValue - mintAmount
            );
        } else {
            // handle as scholar enrollment
            (, bindId) = _splitToken(
                sToken_,
                $.sTokenId,
                mintAmount,
                address(this)
            );
        }

        sToken_.safeTransferFrom(
            address(this),
            controller,
            bindId,
            mintAmount,
            abi.encode(
                EnrollmentData({courseDuration: duration, student: student})
            )
        );

        _mint(address(this), mintAmount);
    }
}
