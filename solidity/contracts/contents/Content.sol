// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
contract Content is Initializable, AccessControlUpgradeable {
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
        /// @notice Unique identifier for this content (hash of title+description or external ID)
        uint256 contentId;
        /// @notice Human-readable name/title of the content
        string title;
        /// @notice Short description or summary of the content
        string description;
        /// @notice Reward token used for this content (e.g., YLD)
        IERC20 rewardToken;
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _contentId,
        string memory _title,
        string memory _description,
        address _rewardToken,
        address _admin
    ) public initializer {
        __AccessControl_init();

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
            address rewardToken
        )
    {
        ContentStorage storage $ = _getContentStorage();
        return ($.contentId, $.title, $.description, address($.rewardToken));
    }
}
