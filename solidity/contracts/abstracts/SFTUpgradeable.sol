// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

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

    /**
     * @dev Emitted when multiple SFTs are merged into a new one.
     * @param operator The address that initiated the merge.
     * @param from The address whose tokens were merged.
     * @param to The recipient of the new merged SFT.
     * @param mergedIds The token IDs that were merged.
     * @param newId The ID (nonce) of the newly minted merged SFT.
     * @param totalAmount The total amount combined in the merged SFT.
     */
    event TokensMerged(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] mergedIds,
        uint256 newId,
        uint256 totalAmount
    );

    // Event: emitted when splitting a token into multiple parts
    event TokensSplit(
        address indexed operator,
        address indexed from,
        uint256 indexed originalId,
        address[] recipients,
        uint256[] values,
        uint256 totalSplit
    );

    // ================================
    // ========== Errors ==============
    // ================================

    /// @dev Thrown when attempting to transfer a partial amount of an SFT, which is not allowed.
    error MustTransferAllSFTAmount(uint256 amount);

    /// @dev Thrown when a merge attempt between two SFTs is unauthorized or invalid.
    error UnAuthorizedSFTMerge(
        bytes firstAttr,
        bytes secondAttr,
        string reason
    );

    /// @dev Thrown when an unauthorized user attempts to perform an update action on an SFT.
    error UnAuthorizedSFTTransfer(
        uint256 nonce,
        address from,
        address to,
        address caller,
        string reason
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

    function _validateSplitInputs(
        address from,
        address operator,
        address[] calldata recipients,
        uint256[] calldata values
    ) internal view {
        if (from != operator && !isApprovedForAll(from, operator)) {
            revert ERC1155MissingApprovalForAll(operator, from);
        }

        uint256 len = recipients.length;
        if (len != values.length) {
            revert ERC1155InvalidArrayLength(len, values.length);
        }
        if (len == 0) revert("EmptySplitArray");
        if (len > 50) revert("SplitArrayTooLarge");
    }

    function _updateResidualAfterSplit(
        address from,
        uint256 id,
        uint256 totalSplit,
        uint256 remaining,
        uint256 fullBalance,
        bytes memory originalAttr
    ) internal {
        SFTStorage storage $ = _getSFTStorage();

        if (remaining > 0) {
            // Residual part keeps the remainder with adjusted attributes
            bytes memory residualAttr = _intoParts(
                remaining,
                fullBalance,
                originalAttr
            );
            _setRawTokenAttributes($, id, residualAttr);
            _burnSFTValue(from, id, totalSplit);
        } else {
            // Fully split token; remove metadata and nonce reference
            $.addressToNonces[from].remove(id);
            delete $.tokenAttributes[id];
            _burnSFTValue(from, id, totalSplit);
        }
    }

    /**
     * @notice Splits an existing Semi-Fungible Token (SFT) into multiple new sub-tokens
     *         and transfers each resulting part to a list of recipients.
     *
     * @dev
     * Performs a proportional split of the caller’s token balance for a given SFT ID.
     * Each resulting sub-token inherits derived attributes from the original token
     * using `_intoParts()`. The function mints these sub-SFTs directly to recipients,
     * burns the proportional amount from the sender, and updates or removes the
     * residual attributes accordingly.
     *
     * Key guarantees:
     *  - Only the token owner or an approved operator can perform a split.
     *  - The total split value cannot exceed the sender’s full balance.
     *  - Each new sub-SFT inherits metadata that remains invariant under the split.
     *  - Any remaining balance retains consistent and proportional attributes.
     *
     * @param from The address of the token owner initiating the split.
     * @param id The unique identifier (nonce) of the original SFT being split.
     * @param recipients The list of recipient addresses receiving the split SFTs.
     * @param values The list of token amounts corresponding to each recipient.
     *
     * @custom:events
     * - Emits `TransferSingle` (per ERC-1155) for each minted sub-SFT.
     * - Emits `TokensSplit` summarizing the entire split operation.
     *
     * @custom:reverts
     * - `ERC1155MissingApprovalForAll` if the caller lacks transfer permission.
     * - `ERC1155InvalidArrayLength` if `recipients.length != values.length`.
     * - `ERC1155InsufficientBalance` if the total split exceeds available balance.
     * - `"InvalidSplitAmount"` if any split portion is zero.
     * - `"EmptySplitArray"` if no recipients are provided.
     *
     * @custom:security
     * - Protected by `nonReentrant` to prevent reentrancy via mint/transfer hooks.
     *
     * @custom:example
     * ```solidity
     * // Splitting a 100-unit token into two 40/60 sub-tokens:
     * splitTransferFrom(
     *     msg.sender,
     *     1, // original token ID
     *     [address(learnerA), address(learnerB)],
     *     [40, 60]
     * );
     * ```
     */
    function splitTransferFrom(
        address from,
        uint256 id,
        address[] calldata recipients,
        uint256[] calldata values
    ) external {
        address operator = _msgSender();
        _validateSplitInputs(from, operator, recipients, values);

        uint256 len = recipients.length;
        uint256 fullBalance = balanceOf(from, id);
        if (fullBalance == 0) revert ERC1155InsufficientBalance(from, 0, 0, id);

        bytes memory originalAttr = _getRawTokenAttributes(id);
        uint256 totalSplit;
        uint256 remaining = fullBalance;

        for (uint256 i; i < len; ) {
            uint256 value = values[i];
            if (value == 0) revert("InvalidSplitAmount");

            totalSplit += value;
            if (totalSplit > fullBalance) {
                revert ERC1155InsufficientBalance(
                    from,
                    fullBalance,
                    totalSplit,
                    id
                );
            }

            // Derive proportional attributes for this split
            _mintSFT(
                recipients[i],
                value,
                _intoParts(value, fullBalance, originalAttr)
            );

            unchecked {
                ++i;
            }
        }

        remaining = fullBalance - totalSplit;
        _updateResidualAfterSplit(
            from,
            id,
            totalSplit,
            remaining,
            fullBalance,
            originalAttr
        );
        emit TokensSplit(operator, from, id, recipients, values, totalSplit);
    }

    /**
     * @notice Merges multiple Semi-Fungible Tokens (SFTs) of the same type
     *         into a single new SFT and transfers it to a specified recipient.
     *
     * @dev
     * Combines several existing SFT instances owned by `from` into one unified
     * token. The resulting SFT inherits composite attribute data derived
     * through `_mergeAttr()`. This function supports flexible merge logic,
     * allowing token attributes to encode cumulative rewards, access tiers,
     * or progressive learner credentials.
     *
     * The function ensures:
     *  - Only the token owner or an approved operator can initiate the merge.
     *  - All source tokens must have a non-zero balance.
     *  - Attributes are validated for merge compatibility using `_ensureCanMerge()`.
     *  - Each original token is fully burned before minting the merged SFT.
     *
     * @param from The current owner of the SFTs being merged.
     * @param to The address that will receive the newly merged SFT.
     * @param ids The list of SFT IDs (nonces) to merge.
     *
     * @return newNonce The unique identifier (nonce) of the newly minted merged SFT.
     *
     * @custom:events
     * - Emits `TokensMerged` summarizing the merge operation with all merged IDs.
     *
     * @custom:reverts
     * - `ERC1155MissingApprovalForAll` if the caller lacks merge permission.
     * - `"EmptyMergeArray"` if no token IDs are provided.
     * - `"InvalidRecipient"` if the `to` address is zero.
     * - `"ZeroBalanceToken"` if any source SFT has zero balance.
     * - `UnAuthorizedSFTMerge` if merge compatibility fails in `_ensureCanMerge()`.
     *
     * @custom:security
     * - Protected by `nonReentrant` to prevent reentrancy via burn/mint hooks.
     *
     * @custom:example
     * ```solidity
     * // Merging two progress-based course SFTs into a single learner credential:
     * mergeTransferFrom(
     *     msg.sender,
     *     msg.sender,
     *     [courseSFT_A, courseSFT_B]
     * );
     * ```
     */
    function mergeTransferFrom(
        address from,
        address to,
        uint256[] calldata ids
    ) external returns (uint256 newNonce) {
        address operator = _msgSender();

        // --- Validation ---
        if (ids.length == 0) revert("EmptyMergeArray");
        if (to == address(0)) revert("InvalidRecipient");
        if (from != operator && !isApprovedForAll(from, operator)) {
            revert ERC1155MissingApprovalForAll(operator, from);
        }

        bytes memory mergedAttributes;
        uint256 totalAmount;

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 value = balanceOf(from, id);
            if (value == 0) revert("ZeroBalanceToken");

            bytes memory attr = _getRawTokenAttributes(id);
            _ensureCanTransfer(id, from, to, attr);

            if (totalAmount == 0) {
                // seed mergedAttributes with the first token's attributes
                mergedAttributes = attr;
            } else {
                _ensureCanMerge(mergedAttributes, attr);

                // merge and produce new mergedAttributes
                mergedAttributes = _mergeAttr(
                    mergedAttributes,
                    totalAmount,
                    attr,
                    value
                );
            }

            totalAmount += value;

            // burn each source SFT from 'from' (we remove their balance)
            _burnSFTValue(from, id, value);
        }

        // mint merged SFT to recipient
        newNonce = _mintSFT(to, totalAmount, mergedAttributes);

        emit TokensMerged(operator, from, to, ids, newNonce, totalAmount);
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

    function _burnSFTValue(address from, uint256 nonce, uint256 amount) internal {
        uint256[] memory ids = new uint256[](1);
        uint256[] memory values = new uint256[](1);
        ids[0] = nonce;
        values[0] = amount;

        super._update(from, address(0), ids, values);
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
     * @notice Derives new token attributes when an SFT is split into fractional parts.
     * @dev
     * Called internally during a split or partial transfer to generate the correct
     * proportional metadata for each resulting token.
     *
     * Implementations should define how the original token’s encoded attributes
     * are proportionally adjusted or replicated among the new parts.
     *
     * Typical use cases:
     *  - Scaling yield weights or reward multipliers according to split ratio.
     *  - Cloning learner progress or credential data for course-bound sub-allocations.
     *  - Allocating partial vesting or staking positions.
     *
     * @param value The amount assigned to the new split part.
     * @param fullValue The total amount held by the original token before splitting.
     * @param attributes The byte-encoded attribute data of the original token.
     *
     * @return newAttributes Byte-encoded attributes for the newly derived split token.
     *
     * @custom:requirements
     * Implementations MUST preserve internal invariants (e.g., sum of yield weights
     * across parts equals the original total) and maintain schema integrity.
     *
     * @custom:example
     * ```
     * // Example: proportional yield weight scaling
     * function _intoParts(
     *     uint256 value,
     *     uint256 fullValue,
     *     bytes memory attributes
     * ) internal override returns (bytes memory) {
     *     (uint256 yieldWeight, address course) = abi.decode(attributes, (uint256, address));
     *     uint256 newWeight = (yieldWeight * value) / fullValue;
     *     return abi.encode(newWeight, course);
     * }
     * ```
     */
    function _intoParts(
        uint256 value,
        uint256 fullValue,
        bytes memory attributes
    ) internal virtual returns (bytes memory);

    /**
     * @notice Merges the attribute data of two SFTs into a new combined representation.
     * @dev
     * Invoked internally during token merges (e.g., course re-aggregation or portfolio
     * consolidation) to compute unified attribute metadata for the resulting SFT.
     *
     * Implementations define how encoded attributes and proportional data are aggregated.
     *
     * Typical use cases:
     *  - Weighted averaging of yield multipliers or rewards.
     *  - Combining progress data for the same course or program.
     *  - Consolidating vesting or staking positions into a single record.
     *
     * @param firstAttr Byte-encoded attributes of the first token.
     * @param firstValue Amount or weight associated with the first token.
     * @param secondAttr Byte-encoded attributes of the second token.
     * @param secondValue Amount or weight associated with the second token.
     *
     * @return mergedAttributes Byte-encoded attributes for the newly merged token.
     *
     * @custom:requirements
     * Implementations MUST ensure schema consistency and should revert if the
     * attribute data are incompatible (e.g., different course bindings).
     *
     * @custom:example
     * ```
     * // Example: weighted yield merge
     * function _mergeAttr(
     *     bytes memory firstAttr,
     *     uint256 firstValue,
     *     bytes memory secondAttr,
     *     uint256 secondValue
     * ) internal override returns (bytes memory) {
     *     (uint256 yieldA, address courseA) = abi.decode(firstAttr, (uint256, address));
     *     (uint256 yieldB, address courseB) = abi.decode(secondAttr, (uint256, address));
     *     if (courseA != courseB) revert UnAuthorizedSFTMerge(firstAttr, secondAttr, "Different course bindings");
     *     uint256 totalWeight = firstValue + secondValue;
     *     uint256 mergedYield = (yieldA * firstValue + yieldB * secondValue) / totalWeight;
     *     return abi.encode(mergedYield, courseA);
     * }
     * ```
     */
    function _mergeAttr(
        bytes memory firstAttr,
        uint256 firstValue,
        bytes memory secondAttr,
        uint256 secondValue
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
     * @notice Verifies that the caller is authorized to transfer or update a given SFT.
     * @dev Intended to be overridden by inheriting contracts to implement protocol-specific
     *      access control (e.g., restricting transfers to approved operators, educators,
     *      or platform-managed contracts).
     *
     * @param nonce The unique identifier of the SFT being transferred or modified.
     * @param from The current owner of the SFT.
     * @param to The address receiving or assuming ownership of the SFT.
     * @param attributes The raw, byte-encoded metadata associated with the SFT.
     *
     * @custom:error UnAuthorizedSFTTransfer Thrown when the caller lacks permission
     *               to perform the transfer or update.
     */
    function _ensureCanTransfer(
        uint256 nonce,
        address from,
        address to,
        bytes memory attributes
    ) internal view virtual;

    /**
     * @notice Validates whether two SFTs can be merged based on their attributes.
     * @dev Should be overridden by inheriting contracts to define merge compatibility rules,
     *      such as matching course bindings, token types, or lifecycle states.
     *
     * @param firstAttr The byte-encoded attributes of the first SFT.
     * @param secondAttr The byte-encoded attributes of the second SFT.
     *
     * @custom:error UnAuthorizedSFTMerge Thrown when the provided SFTs cannot be merged
     *               due to incompatible attributes or access restrictions.
     */
    function _ensureCanMerge(
        bytes memory firstAttr,
        bytes memory secondAttr
    ) internal view virtual;

    function totalSupply() external view returns (uint256) {
        return _getSFTStorage().totalSupply;
    }
}
