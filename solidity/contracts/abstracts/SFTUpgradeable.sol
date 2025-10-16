// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ISFTUpgradeable} from "../abstracts/ISFTUpgradeable.sol";

/**
 * @title SFTUpgradeable
 * @dev Abstract contract for Semi-Fungible Tokens (SFTs) with upgradeable and role-based access control features.
 *      Inherits from ERC1155Upgradeable and AccessControlUpgradeable.
 */
abstract contract SFTUpgradeable is
    ISFTUpgradeable,
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable
{
    using EnumerableSet for EnumerableSet.UintSet;

    // ================================
    // ========== Events ==============
    // ================================

    /// @notice Emitted when attributes are updated for a token nonce.
    event TokenAttributesUpdated(uint256 indexed nonce, bytes newAttributes);

    // ================================
    // ========== Errors ==============
    // ================================

    /**
     * @dev Thrown when attempting to transfer a partial amount of an SFT, which is not allowed.
     */
    error MustTransferAllSFTAmount(uint256 amount);

    /**
     * @dev Thrown when an unauthorized user attempts to perform an update action on an SFT.
     */
    error UnAuthorizedSFTTransfer(
        uint256 nonce,
        address from,
        address to,
        address caller
    );

    // ================================
    // ========== Roles ===============
    // ================================

    /**
     * @dev Role identifier for the minter role.
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Role identifier for the can send role.
     */
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    // ================================
    // ========== Structs =============
    // ================================

    /**
     * @dev Storage layout following ERC-7201 namespaced storage pattern.
     * @custom:storage-location erc7201:gainzswap.sft.storage
     */
    struct SFTStorage {
        string name;
        string symbol;
        uint256 nonceCounter;
        uint256 totalSupply;
        mapping(address => EnumerableSet.UintSet) addressToNonces;
        mapping(uint256 => bytes) tokenAttributes;
    }

    // ================================
    // ========== Storage =============
    // ================================

    bytes32 private constant SFT_STORAGE_SLOT =
        keccak256("gainzswap.sft.storage");

    /**
     * @dev Returns the storage layout for the SFT.
     */
    function _getSFTStorage() private pure returns (SFTStorage storage s) {
        bytes32 slot = SFT_STORAGE_SLOT;
        assembly {
            s.slot := slot
        }
    }

    // ================================
    // ========== Initializer =========
    // ================================

    /**
     * @dev Initializes the SFT contract with a name, symbol, and admin address.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param admin The address to be granted the default admin role.
     */
    function __SFT_init(
        string memory name_,
        string memory symbol_,
        address admin
    ) public onlyInitializing {
        __ERC1155_init("");
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        SFTStorage storage $ = _getSFTStorage();
        $.name = name_;
        $.symbol = symbol_;
    }

    // ================================
    // ========== Public Actions ======
    // ================================

    /**
     * @notice Splits a Semi-Fungible Token (SFT) into multiple parts and transfers them
     *         safely to a list of recipients.
     * @dev This function performs proportional splitting of an existing SFT and
     *      mints new sub-SFTs for each recipient. Each new SFT inherits or derives
     *      attribute data from the original token through `_intoParts()`.
     *
     *      The function ensures:
     *        - Only authorized senders (owners or approved operators) can initiate the split.
     *        - Recipients and values arrays are of equal length.
     *        - The sum of split values does not exceed the sender’s balance.
     *        - Remaining attributes are proportionally adjusted or retained for the residual token.
     *
     * @param from The address of the current owner of the SFT being split.
     * @param id The unique identifier (nonce) of the original SFT to be split.
     * @param recipients An array of addresses receiving the split SFTs.
     * @param values An array of token amounts corresponding to each recipient.
     *
     * @custom:events Emits standard ERC1155 `TransferSingle` events for each split transfer.
     * @custom:reverts ERC1155MissingApprovalForAll If the caller is not authorized to manage the SFT.
     * @custom:reverts ERC1155InvalidArrayLength If `recipients.length != values.length`.
     * @custom:reverts ERC1155InsufficientBalance If the total split amount exceeds the sender’s balance.
     * @custom:reverts UnAuthorizedSFTTransfer If `_ensureCanTransfer()` fails during internal transfer logic.
     */
    function safeSplitTransferFrom(
        address from,
        uint256 id,
        address[] calldata recipients,
        uint256[] calldata values
    ) external {
        address operator = _msgSender();

        // --- Authorization ---
        if (from != operator && !isApprovedForAll(from, operator)) {
            revert ERC1155MissingApprovalForAll(operator, from);
        }

        // --- Input validation ---
        uint256 len = recipients.length;
        if (len != values.length) {
            revert ERC1155InvalidArrayLength(len, values.length);
        }

        // --- Load state ---
        uint256 fromBalance = balanceOf(from, id);
        bytes memory fromTokenAttr = _getRawTokenAttributes(id);
        uint256 totalUsed;

        // --- Split logic ---
        for (uint256 i = 0; i < len; ++i) {
            uint256 value = values[i];
            require(value > 0, "Invalid Split Amount");

            // Ensure not overspending
            if (value > fromBalance) {
                revert ERC1155InsufficientBalance(from, fromBalance, value, id);
            }

            // Derive new attributes for the split portion
            bytes memory newAttr = _intoParts(
                value,
                fromBalance,
                fromTokenAttr
            );

            // Adjust remaining attributes proportionally
            fromBalance -= value;
            totalUsed += value;
            fromTokenAttr = _intoParts(
                fromBalance,
                fromBalance + value,
                fromTokenAttr
            );

            // Mint a new sub-SFT for the recipient
            uint256 newNonce = _mintSFT(from, value, newAttr);

            // Safely transfer it to the recipient
            _safeTransferFrom(from, recipients[i], newNonce, value, "");
        }

        // --- Update residual state ---
        SFTStorage storage $ = _getSFTStorage();
        if (fromBalance > 0) {
            // Update attributes for remaining balance
            _setRawTokenAttributes($, id, fromTokenAttr);
        } else {
            // Remove nonce record if fully depleted
            $.addressToNonces[from].remove(id);
            delete $.tokenAttributes[id];
        }

        // --- Burn original token (partially or fully) ---
        {
            uint256[] memory burnIds = new uint256[](1);
            uint256[] memory burnValues = new uint256[](1);
            burnIds[0] = id;
            burnValues[0] = totalUsed;

            super._update(from, address(0), burnIds, burnValues);
        }
    }

    // ================================
    // ========== Public Views ========
    // ================================

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _getSFTStorage().name;
    }

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() public view returns (string memory) {
        return _getSFTStorage().symbol;
    }

    /**
     * @dev Returns the list of nonces owned by an address.
     * @param owner The address of the token owner.
     * @return Array of nonces.
     */
    function getNonces(address owner) public view returns (uint256[] memory) {
        return _getSFTStorage().addressToNonces[owner].values();
    }

    // ================================
    // ========== Internal Views ======
    // ================================

    /**
     * @dev Returns raw token attributes by nonce.
     * @param nonce The nonce of the token.
     * @return Attributes in bytes.
     */
    function _getRawTokenAttributes(
        uint256 nonce
    ) internal view returns (bytes memory) {
        return _getSFTStorage().tokenAttributes[nonce];
    }

    /**
     * @dev Returns the balance of the user with their token attributes.
     * @param user The address of the user.
     * @return Array of SftBalance containing nonce, amount, and attributes.
     */
    function _sftBalance(
        address user
    ) internal view returns (SftBalance[] memory) {
        uint256[] memory nonces = getNonces(user);
        SftBalance[] memory balance = new SftBalance[](nonces.length);

        for (uint256 i = 0; i < nonces.length; i++) {
            uint256 nonce = nonces[i];
            bytes memory attributes = _getRawTokenAttributes(nonce);
            uint256 amount = balanceOf(user, nonce);

            balance[i] = SftBalance({
                nonce: nonce,
                amount: amount,
                attributes: attributes
            });
        }

        return balance;
    }

    // ================================
    // ========== Internal Writes =====
    // ================================

    /**
     * @dev Mints a new Semi-Fungible Token (SFT) with specified attributes to a given address.
     *
     * This function performs the following operations:
     * - Increments the internal nonce counter to generate a unique token ID.
     * - Associates the provided `attributes` with the new token ID.
     * - Mints `amount` tokens of the new ID to the `to` address.
     *
     * Emits a {TransferSingle} event via the ERC1155 `_mint` function.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     *
     * @param to The address receiving the newly minted tokens.
     * @param amount The number of tokens to mint.
     * @param attributes Arbitrary metadata associated with the token, stored as raw bytes.
     * @return nonce The unique identifier (token ID) assigned to the newly minted token.
     */
    function _mintSFT(
        address to,
        uint256 amount,
        bytes memory attributes
    ) internal returns (uint256 nonce) {
        SFTStorage storage $ = _getSFTStorage();

        nonce = ++$.nonceCounter;
        _setRawTokenAttributes($, nonce, attributes);

        _mint(to, nonce, amount, "");
    }

    /**
     * @notice Sets or updates the raw attribute data of a specific SFT nonce.
     * @dev This function writes arbitrary bytes to storage. It does not perform
     *      validation on the format of `attr`; it is assumed the caller ensures
     *      the structure is consistent with the protocol's expectations.
     *
     * @param $ The SFTStorage reference obtained from `_getSFTStorage()`.
     * @param nonce The unique token nonce or ID whose attributes are being updated.
     * @param attr The raw byte-encoded attributes to associate with this token.
     *
     * @custom:security Use internally only. Never expose publicly to prevent
     *                  arbitrary attribute tampering.
     * @custom:events No event is emitted by default; inheriting contracts
     *                 may override to emit `TokenAttributesUpdated` or similar.
     */
    function _setRawTokenAttributes(
        SFTStorage storage $,
        uint256 nonce,
        bytes memory attr
    ) internal virtual {
        require(attr.length > 0, "SFT: empty attributes not allowed");
        $.tokenAttributes[nonce] = attr;
        emit TokenAttributesUpdated(nonce, attr);
    }

    /**
     * @notice Derives new token attribute data when an SFT is split into smaller parts.
     * @dev
     * Called internally during a split or fractional transfer operation to
     * generate proportional metadata for each resulting token part.
     *
     * This function must be implemented by inheriting contracts to define how
     * the original token's attributes are transformed or divided between the
     * new parts. It is intentionally left abstract here to allow flexible
     * encoding schemes and proportional logic per token type.
     *
     * Common use cases include:
     *  - Scaling yield weights or reward multipliers relative to the split ratio.
     *  - Cloning learner progress or credential metadata for sub-allocations.
     *  - Deriving partial vesting data, ownership shares, or course access rights.
     *
     * @param value The amount being extracted into the new part.
     * @param fullValue The full balance or amount of the original token before splitting.
     * @param attributes The byte-encoded attributes of the original token being divided.
     *
     * @return newAttributes The newly derived byte-encoded attributes for the split part.
     *
     * @custom:requirements
     * Implementations MUST ensure that any invariant properties within the
     * attribute encoding (e.g. total yield weight = 100%) remain consistent
     * across the split and the remainder.
     *
     * @custom:example
     * ```
     * // Example: proportional yield distribution
     * function _intoParts(
     *     uint256 value,
     *     uint256 fullValue,
     *     bytes memory attributes
     * ) internal override returns (bytes memory) {
     *     uint256 yieldShare = abi.decode(attributes, (uint256));
     *     uint256 proportionalShare = (yieldShare * value) / fullValue;
     *     return abi.encode(proportionalShare);
     * }
     * ```
     */
    function _intoParts(
        uint256 value,
        uint256 fullValue,
        bytes memory attributes
    ) internal virtual returns (bytes memory);

    // ================================
    // ========== Overrides ===========
    // ================================

    /**
     * @dev Overrides the supportsInterface function to include AccessControl interfaces.
     * @param interfaceId The interface identifier, as specified in ERC-165.
     * @return True if the contract implements the requested interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Overrides the _update function to handle address-to-nonce mapping and total supply adjustments.
     * @param from The address sending tokens.
     * @param to The address receiving tokens.
     * @param ids The token IDs being transferred.
     * @param values The values of tokens being transferred.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        SFTStorage storage $ = _getSFTStorage();

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 value = values[i];
            bytes memory attr = $.tokenAttributes[id];

            if (from == address(0)) {
                $.totalSupply += value;
            } else {
                uint256 fromBalance = balanceOf(from, id);
                if (fromBalance != value) {
                    revert MustTransferAllSFTAmount(fromBalance);
                }
                $.addressToNonces[from].remove(id);
            }

            if (to == address(0)) {
                $.totalSupply -= value;
                delete $.tokenAttributes[id];
            } else {
                $.addressToNonces[to].add(id);
            }

            _ensureCanTransfer(id, from, to, attr);
        }

        super._update(from, to, ids, values);
    }

    /**
     * @notice Ensures that the caller is authorized to perform a transfer or update
     *         on the specified Semi-Fungible Token (SFT).
     * @dev Must be implemented by inheriting contracts to define custom access control logic.
     *
     *      Example: Override this function to restrict transfers to approved operators,
     *      authorized educators, or platform contracts in your implementation.
     *
     * @param nonce The unique identifier of the SFT being transferred or updated.
     * @param from The address of the current owner of the SFT.
     * @param to The address of the recipient or new owner of the SFT.
     * @param attributes The byte-encoded attribute data associated with the SFT.
     *
     * @custom:error UnAuthorizedSFTTransfer Thrown when the caller is not authorized
     *               to perform the transfer or update.
     */
    function _ensureCanTransfer(
        uint256 nonce,
        address from,
        address to,
        bytes memory attributes
    ) internal view virtual;

    function totalSupply() external view returns (uint256) {
        return _getSFTStorage().totalSupply;
    }
}
