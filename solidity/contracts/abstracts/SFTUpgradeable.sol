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
    // ========== Minting =============
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
        $.tokenAttributes[nonce] = attributes;

        _mint(to, nonce, amount, "");
    }

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
            uint256 amount = values[i];
            _ensureCanTransfer(id, from, to, $.tokenAttributes[id]);

            // When not minting
            if (from != address(0)) {
                uint256 balance = balanceOf(from, id);
                if (balance != amount) {
                    revert MustTransferAllSFTAmount(balance);
                }
                $.addressToNonces[from].remove(id);
            }

            if (to != address(0)) {
                $.addressToNonces[to].add(id);
            }

            if (from == address(0) && to != address(0)) {
                // Minting
                $.totalSupply += amount;
            } else if (from != address(0) && to == address(0)) {
                // Burning
                $.totalSupply -= amount;
            }
        }

        super._update(from, to, ids, values);
    }

    /**
     * @dev must be overridden by inheriting contracts to ensure that the caller is authorized to perform update actions on the SFT.
     * @param nonce The unique identifier of the SFT being updated.
     * @param from The address of the SFT owner.
     * @param to The address of the SFT receipient.
     * @notice This function is called internally to enforce access control for SFT updates.
     * @custom:error UnAuthorizedSFTTransfer Thrown when the caller is not authorized to update the SFT.
     */
    function _ensureCanTransfer(
        uint256 nonce,
        address from,
        address to,
        bytes memory /* attributes */
    ) internal view virtual {
        if (true) revert UnAuthorizedSFTTransfer(nonce, from, to, _msgSender());
    }

    function totalSupply() external view returns (uint256) {
        return _getSFTStorage().totalSupply;
    }
}
