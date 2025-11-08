// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ISToken} from "../tokens/ISToken.sol";
import {sTokenHandlerUpgradeable} from "../abstracts/sTokenHandlerUpgradeable.sol";
import {ContentLib} from "./ContentLib.sol";
import {sTokenLib} from "../tokens/sTokenLib.sol";

contract Content is
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    sTokenHandlerUpgradeable,
    ERC4626Upgradeable
{
    using sTokenLib for bytes;

    /*//////////////////////////////////////////////////////////////
                                ROLES
    //////////////////////////////////////////////////////////////*/
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    /*//////////////////////////////////////////////////////////////
                              STATE
    //////////////////////////////////////////////////////////////*/

    struct ContentStorage {
        uint256 contentId;
        uint256 sTokenId;
        IERC20 rewardToken;
        string title;
        string description;
        // ─── New fields ──────────────────────────────
        address courseController;
        uint256 courseDuration; // in seconds
        uint256 minBindAmount;
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
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice The hardcoded minimum threshold for binding (cannot be set below this)
    uint256 public constant MIN_BIND = 10 ether;

    /*//////////////////////////////////////////////////////////////
                              EVENTS
    //////////////////////////////////////////////////////////////*/
    event VerifierUpdated(address indexed verifier, bool enabled);
    event CourseControllerUpdated(
        address indexed oldController,
        address indexed newController
    );
    event CourseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event MinBindAmountUpdated(uint256 oldAmount, uint256 newAmount);

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

    /// @notice Add or remove verifier permissions
    function setVerifier(
        address verifier,
        bool enabled
    ) external onlyRole(ADMIN_ROLE) {
        if (enabled) _grantRole(VERIFIER_ROLE, verifier);
        else _revokeRole(VERIFIER_ROLE, verifier);

        emit VerifierUpdated(verifier, enabled);
    }

    // /// @notice Update the course duration
    // function setCourseDuration(
    //     uint256 newDuration
    // ) external onlyRole(ADMIN_ROLE) {
    //     ContentStorage storage $ = _getContentStorage();
    //     _setCourseDuration($, newDuration);
    // }

    // /// @notice Update the minimum bind amount, cannot go below the hard threshold
    // function setMinBindAmount(uint256 newAmount) external onlyRole(ADMIN_ROLE) {
    //     ContentStorage storage $ = _getContentStorage();
    //     _setMinBindAmount($, newAmount);
    // }

    function _setCourseController(
        ContentStorage storage $,
        address newController
    ) internal {
        require(newController != address(0), "Invalid controller");
        address oldController = $.courseController;
        $.courseController = newController;
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
                            OVERRIDES (UNCHANGED LOGIC)
    //////////////////////////////////////////////////////////////*/

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

    error NotAllowed();

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

    function _mergeHeldScholarTokens(
        ISToken sToken,
        uint256 currentTokenId,
        uint256 newTokenId
    ) private returns (uint256 mergedTokenId) {
        // If there’s an existing holding, merge it with the new sToken
        if (currentTokenId != 0) {
            uint256[] memory mergeIds = new uint256[](2);
            // Order matters for merging,
            // so we put the current first to retain its nonce
            // as newTokenId will merged into it
            mergeIds[0] = currentTokenId;
            mergeIds[1] = newTokenId;

            mergedTokenId = sToken.mergeTransferFrom(
                address(this),
                address(this),
                mergeIds
            );
        } else {
            mergedTokenId = newTokenId;
        }
    }

    /**
     * @dev Splits a learner token to separate the bound portion and refund the remainder.
     * @param sToken_ The sToken contract interface.
     * @param from The address sending the token.
     * @param tokenId The ID of the token being processed.
     * @param bindAmount The amount to be bound to the course.
     * @param refund The amount to return to the sender, if any.
     * @return splitId The ID of the newly created bound token.
     */
    function _splitAndRefund(
        ISToken sToken_,
        address from,
        uint256 tokenId,
        uint256 bindAmount,
        uint256 refund
    ) internal returns (uint256) {
        if (refund == 0) return tokenId;

        // If part of the token needs to be split for binding
        (
            uint256[] memory values,
            address[] memory recipients
        ) = _asSingletonArrays(bindAmount, address(this));

        // Split token: send bindAmount to `address(this)`
        (, uint256[] memory splitIds) = sToken_.splitTransferFrom(
            address(this),
            tokenId,
            recipients,
            values
        );

        // Refund any excess to the sender
        sToken_.safeTransferFrom(address(this), from, tokenId, refund, "");

        return splitIds[0];
    }

    function _onERC1155Received(
        address /* operator */,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory /* data */
    ) internal override returns (bytes4) {
        ContentStorage storage $ = _getContentStorage();
        ISToken sToken_ = sToken();

        ISToken.TokenAttributes memory tokenAttr = sToken_
            .getRawTokenAttributes(tokenId)
            .decode();

        if (tokenAttr.tokenType == ISToken.TokenType.Scholar) {
            // Merge scholar tokens held by this contract
            $.sTokenId = _mergeHeldScholarTokens(sToken_, $.sTokenId, tokenId);

            // Mint shares representing scholar position
            _mint(from, value);
        } else if (tokenAttr.tokenType == ISToken.TokenType.Learner) {
            // Retrieve course controller and duration
            {
                address courseOwner = owner();

                require(courseOwner != address(0), "Invalid course owner");
            }

            // Determine required binding amount (based on content config)
            uint256 bindAmount = $.minBindAmount;
            require(bindAmount > 0, "Invalid bound amount");
            require(value >= bindAmount, "Insufficient value for binding");

            // Refund excess if user sent more than required
            uint256 refund = value - bindAmount;
            uint256 splitId = _splitAndRefund(
                sToken_,
                from,
                tokenId,
                bindAmount,
                refund
            );

            // Transfer the bound portion to the course controller with binding data
            address courseController = $.courseController;
            uint256 courseDuration = $.courseDuration;

            require(
                courseController != address(0),
                "Invalid course controller"
            );

            sToken_.safeTransferFrom(
                address(this),
                courseController,
                splitId,
                bindAmount,
                abi.encode(courseDuration)
            );

            // Mint equivalent representation for the course vault / recipient contract
            _mint(address(this), bindAmount);
        } else {
            revert("Unrecognized token type");
        }

        return this.onERC1155Received.selector;
    }
}
