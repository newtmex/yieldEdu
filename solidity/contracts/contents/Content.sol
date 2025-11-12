// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ISToken} from "../tokens/ISToken.sol";
import {sTokenHandlerUpgradeable} from "../abstracts/sTokenHandlerUpgradeable.sol";
import {ContentLib} from "./ContentLib.sol";
import {IContent} from "./IContent.sol";
import {sTokenLib} from "../tokens/sTokenLib.sol";

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title Content Contract
/// @notice Handles learner and scholar enrollments for a specific content,
///         binding semi-fungible tokens (sTokens) to a content controller and minting ERC4626 vault shares.
contract Content is
    IContent,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    sTokenHandlerUpgradeable,
    ERC4626Upgradeable
{
    using sTokenLib for bytes;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    /// @notice Minimum binding threshold
    uint256 public constant MIN_BIND = 10 ether;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    struct ContentStorage {
        uint256 contentId;
        uint256 sTokenId;
        IERC20 rewardToken;
        string title;
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
        uint256 _contentId,
        string memory _title,
        string memory _description,
        address _rewardToken,
        address _sToken,
        address _admin
    ) public initializer {
        __AccessControl_init();
        __Ownable_init(msg.sender);
        __sTokenHandler_init(ISToken(_sToken));

        __ERC20_init(_title, ContentLib.generateSymbol(_title, _contentId));
        __ERC4626_init(IERC20(_rewardToken));

        ContentStorage storage $ = _getContentStorage();
        $.contentId = _contentId;
        $.title = _title;
        $.description = _description;
        $.rewardToken = IERC20(_rewardToken);

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

    function _deposit(
        address,
        address,
        uint256,
        uint256
    ) internal override notAllowed {}

    function _withdraw(
        address,
        address,
        address,
        uint256,
        uint256
    ) internal override notAllowed {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(sTokenHandlerUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Returns the core metadata of this content
    function getContentInfo()
        external
        view
        returns (
            uint256 contentId,
            string memory name,
            string memory description,
            uint256 sTokenId
        )
    {
        ContentStorage storage $ = _getContentStorage();
        return ($.contentId, $.title, $.description, $.sTokenId);
    }

    /*//////////////////////////////////////////////////////////////
                        STUDENT ENROLLMENT LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Enroll a scholar using a signed authorization from the verifier
    function enrollScholar(
        uint256 deadline,
        bytes calldata signature
    ) external {
        ContentStorage storage $ = _getContentStorage();
        address verifier = $.verifier;

        require(verifier != address(0), "Verifier not set");
        require(block.timestamp <= deadline, "Expired signature");

        address scholar = msg.sender;

        // Compute the message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), scholar, deadline)
        ).toEthSignedMessageHash();

        // Recover the signer
        address recovered = messageHash.recover(signature);
        require(recovered == verifier, "Invalid signature");

        _enroll(sToken(), scholar, 0, 0);
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
     * @dev Handles splitting of a learner token and refunds excess.
     * Returns the ID of the bound portion to be transferred to contentController.
     */
    function _splitAndRefund(
        ISToken sToken_,
        address from,
        uint256 tokenId,
        uint256 bindAmount,
        uint256 refund
    ) internal returns (uint256 boundId) {
        if (refund == 0) return tokenId;

        boundId = _splitToken(sToken_, tokenId, bindAmount);
        sToken_.safeTransferFrom(address(this), from, tokenId, refund, "");

        return boundId;
    }

    /**
     * @dev Splits a token held by this contract into a bound portion for enrollment.
     */
    function _splitToken(
        ISToken sToken_,
        uint256 tokenId,
        uint256 bindAmount
    ) internal returns (uint256) {
        (
            uint256[] memory values,
            address[] memory recipients
        ) = _asSingletonArrays(bindAmount, address(this));
        (, uint256[] memory splitIds) = sToken_.splitTransferFrom(
            address(this),
            tokenId,
            recipients,
            values
        );

        if (splitIds.length == 0) revert SplitFailed();
        return splitIds[0];
    }

    /**
     * @dev Handles ERC1155 receipt for Learner or Scholar sTokens.
     * Delegates to respective enrollment handlers.
     */
    function _onERC1155Received(
        address /* operator */,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory /* data */
    ) internal override returns (bytes4) {
        ISToken sToken_ = sToken();
        ISToken.TokenAttributes memory tokenAttr = sToken_
            .getRawTokenAttributes(tokenId)
            .decode();

        if (tokenAttr.tokenType == ISToken.TokenType.Scholar) {
            _mergeHeldScholarTokens(sToken_, tokenId);
            _mint(from, value);
        } else if (tokenAttr.tokenType == ISToken.TokenType.Learner) {
            _enroll(sToken_, from, tokenId, value);
        } else {
            revert NotScholarNorLearner();
        }

        return this.onERC1155Received.selector;
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
    function _enroll(
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
            bindId = _splitToken(sToken_, $.sTokenId, mintAmount);
        }

        sToken_.safeTransferFrom(
            address(this),
            controller,
            bindId,
            mintAmount,
            abi.encode(
                EnrollmentBinding({courseDuration: duration, student: student})
            )
        );

        _mint(address(this), mintAmount);
    }
}
