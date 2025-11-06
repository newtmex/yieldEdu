// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ──────────────────────────────────────────────
// OpenZeppelin Upgradeable Contracts
// ──────────────────────────────────────────────
import {
    AccessControlUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {
    ERC4626Upgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// ──────────────────────────────────────────────
// OpenZeppelin Standard Interfaces
// ──────────────────────────────────────────────
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ──────────────────────────────────────────────
// Project-Specific Imports
// ──────────────────────────────────────────────
import {ISToken} from "../tokens/ISToken.sol";
import {
    sTokenHandlerUpgradeable
} from "../abstracts/sTokenHandlerUpgradeable.sol";
import {ContentLib} from "./ContentLib.sol";

/**
 * @title Content
 * @notice Manages on-chain metadata, rewards, and scholar progress for YieldEDU content.
 *
 * Each Content instance represents a learnable asset (course, article, or thread)
 * that scholars (sToken holders) engage with. Off-chain quizzes validate knowledge,
 * while this contract tracks completion, reward eligibility, and penalties on-chain.
 *
 * Authorized verifiers sign off-chain data that scholars can submit here to:
 *  - Unbind sTokens after completing the course
 *  - Receive rewards for verified completion
 *  - Possibly incur penalties for failed attempts
 *
 * The contract also holds reward pools and supports upgradeability via Beacon proxy.
 */
contract Content is
    Initializable,
    AccessControlUpgradeable,
    sTokenHandlerUpgradeable,
    ERC4626Upgradeable
{
    /*//////////////////////////////////////////////////////////////
                                ROLES
    //////////////////////////////////////////////////////////////*/
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    /*//////////////////////////////////////////////////////////////
                              STATE
    //////////////////////////////////////////////////////////////*/

    /// @custom:storage-location erc7201:yieldEDU.contents.content.storage
    struct ContentStorage {
        /// @notice Unique hash ID for the content (e.g., keccak256(title, description, or external ID))
        uint256 contentId;
        /// @notice Latest sToken ID representing this content's aggregated holdings
        uint256 sTokenId;
        /// @notice ERC-20 reward token distributed for this content (e.g., YLD)
        IERC20 rewardToken;
        /// @notice Human-readable title of the content
        string title;
        /// @notice Short summary or description of the content
        string description;
    }

    /// @custom:storage-location erc7201:yieldEDU.contents.content.storage
    bytes32 private constant CONTENT_STORAGE_LOCATION =
        keccak256("yieldEDU.contents.content.storage");

    /// @dev Internal getter for accessing storage struct via ERC-7201 pattern.
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
                              EVENTS
    //////////////////////////////////////////////////////////////*/
    event VerifierUpdated(address indexed verifier, bool enabled);

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
        __sTokenHandler_init(ISToken(_sToken));

        __ERC20_init(_title, ContentLib.generateSymbol(_title, _contentId));
        __ERC4626_init(IERC20(_rewardToken));

        ContentStorage storage $ = _getContentStorage();
        $.contentId = _contentId;
        $.title = _title;
        $.description = _description;
        $.rewardToken = IERC20(_rewardToken);

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

    /*//////////////////////////////////////////////////////////////
                            VIEW HELPERS
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

    function _onERC1155Received(
        address /* operator */,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory /* data */
    ) internal override returns (bytes4) {
        ContentStorage storage $ = _getContentStorage();

        uint256 currentTokenId = $.sTokenId;
        ISToken sToken_ = sToken();

        $.sTokenId = _mergeHeldScholarTokens(sToken_, currentTokenId, tokenId);

        // Mint shares representing the sToken position for the sender
        _mint(from, value);

        return this.onERC1155Received.selector;
    }
}
