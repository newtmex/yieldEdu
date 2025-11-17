// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC1155HolderUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import {ISToken} from "../tokens/ISToken.sol";

/**
 * @title STokenHandler
 * @notice Upgradeable handler contract for interacting with sToken (semi-fungible token) positions.
 * @dev Uses ERC7201 namespaced storage and OpenZeppelin upgradeable contract conventions.
 */
abstract contract STokenHandler is Initializable, ERC1155HolderUpgradeable {
    struct EnrollmentBinding {
        address student;
        uint256 courseDuration;
    }

    struct ContentCompleteData {
        bytes signature;
        uint256 deadline;
        uint256 assessmentPoints;
        uint256 enrolledAt;
        uint256 completeBy;
        address feeCollector;
        address referrer;
    }

    /// @custom:storage-location erc7201:yieldEDU.sTokenHandler.storage
    struct STokenHandlerStorage {
        /// @notice Reference to the sToken contract.
        ISToken _sToken;
    }

    /// @custom:storage-location erc7201:yieldEDU.sTokenHandler.storage
    bytes32 private constant STokenHandlerStorageLocation =
        keccak256("yieldEDU.sTokenHandler.storage");

    /**
     * @dev Returns the storage struct for the sTokenHandler.
     */
    function _getSTokenHandlerStorage()
        internal
        pure
        returns (STokenHandlerStorage storage $)
    {
        bytes32 position = STokenHandlerStorageLocation;
        assembly {
            $.slot := position
        }
    }

    /**
     * @notice Returns the current sToken contract reference.
     */
    function sToken() public view returns (ISToken) {
        return _getSTokenHandlerStorage()._sToken;
    }

    /**
     * @dev Initializer for the sTokenHandler.
     * @param sToken_ The sToken contract reference.
     */
    function __sTokenHandler_init(ISToken sToken_) internal onlyInitializing {
        __ERC1155Holder_init();
        __sTokenHandler_init_unchained(sToken_);
    }

    /**
     * @dev Unchained initializer for setting the sToken contract.
     * @param sToken_ The sToken contract reference.
     */
    function __sTokenHandler_init_unchained(
        ISToken sToken_
    ) internal onlyInitializing {
        STokenHandlerStorage storage $ = _getSTokenHandlerStorage();
        $._sToken = sToken_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155HolderUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Internal hook to handle receipt of a single ERC1155 token.
     */
    function _onERC1155Received(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes4);

    function _asArraysOfLength(
        uint256 uintElement,
        address addrElement,
        uint256 length
    )
        internal
        pure
        returns (uint256[] memory uintArray, address[] memory addrArray)
    {
        // Allocate and assign the uint256 array
        uintArray = new uint256[](length);
        uintArray[0] = uintElement;

        // Allocate and assign the address array
        addrArray = new address[](length);
        addrArray[0] = addrElement;
    }

    /**
     * @notice Called when the contract receives a single ERC1155 token.
     * @dev Only accepts tokens from the sToken contract.
     */
    function onERC1155Received(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) public override onlySToken returns (bytes4) {
        return _onERC1155Received(operator, from, tokenId, value, data);
    }

    /**
     * @notice Batch transfers are not supported.
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public override onlySToken returns (bytes4) {
        revert("BATCH_NOT_SUPPORTED");
    }

    /**
     * @dev Modifier placeholder for access control.
     * @notice Replace or import this from your AccessControl module if not already present.
     */
    modifier onlySToken() {
        require(
            msg.sender == address(_getSTokenHandlerStorage()._sToken),
            "UNAUTHORIZED_STOKEN"
        );
        _;
    }
}
