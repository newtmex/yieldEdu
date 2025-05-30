// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SFTUpgradeable} from "../abstracts/SFTUpgradeable.sol";
import {ISToken} from "./ISToken.sol";

/**
 * @title sToken
 * @dev YieldEDU Course-gating, Semi-Fungible Token (SFT) contract extending SFTUpgradeable, with UUPS upgradeability and role-based minting.
 *
 * The `sToken` contract represents a specialized implementation of a Semi-Fungible Token (SFT) tailored for the YieldEDU platform.
 * It leverages the ERC-1155 standard to efficiently manage multiple token types within a single contract, combining the benefits of both fungible and non-fungible tokens.
 *
 * Key Features:
 * - **Semi-Fungible Tokens (SFTs):** Utilizing the ERC-1155 standard, each token type (identified by a unique nonce) can have multiple interchangeable instances, suitable for representing study tokens, achievements, or certifications.
 * - **Token Attributes:** Each token carries metadata encapsulated in the `TokenAttributes` struct, allowing differentiation between token types such as 'Learner' or 'Scholar'.
 * - **Role-Based Access Control:** Incorporates OpenZeppelin's AccessControl to restrict minting capabilities to accounts with the `MINTER_ROLE`.
 * - **Upgradeable Architecture:** Implements the UUPS (Universal Upgradeable Proxy Standard) pattern, enabling seamless contract upgrades while preserving state.
 * - **Ownership Management:** Inherits from OwnableUpgradeable to provide ownership control over administrative functions.
 *
 * This contract is designed to support the dynamic needs of educational platforms, facilitating the issuance and management of various educational credentials and rewards.
 */
contract SToken is
    ISToken,
    SFTUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    /**
     * @dev Constructor that disables initializers to prevent the implementation contract from being initialized.
     * This is a security measure to ensure that the implementation contract cannot be misused.
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the sToken contract with the specified parameters.
     * Grants the `DEFAULT_ADMIN_ROLE` to the provided owner address and sets up the contract's metadata.
     *
     * Requirements:
     * - Can only be called once.
     *
     * @param name The name of the token collection.
     * @param symbol The symbol representing the token collection.
     * @param owner The address to be granted administrative privileges.
     */
    function initialize(
        string memory name,
        string memory symbol,
        address owner
    ) public initializer {
        __SFT_init(name, symbol, owner);
        __Ownable_init(owner);
        __UUPSUpgradeable_init();
    }

    /**
     * @dev Mints a new sToken with specified attributes to a given address.
     * Only accounts with the `MINTER_ROLE` can invoke this function.
     *
     * Emits a {TransferSingle} event via the ERC1155 `_mint` function.
     *
     * Requirements:
     * - Caller must have the `MINTER_ROLE`.
     * - `to` cannot be the zero address.
     *
     * @param to The address receiving the newly minted tokens.
     * @param amount The number of tokens to mint.
     * @param attributes Struct containing metadata (`TokenType`) to associate with the minted token.
     * @return nonce The unique identifier (token ID) assigned to the newly minted token.
     */
    function sTokenMint(
        address to,
        uint256 amount,
        ISToken.TokenAttributes memory attributes
    ) external onlyRole(MINTER_ROLE) returns (uint256 nonce) {
        return _mintSFT(to, amount, abi.encode(attributes));
    }

    /**
     * @notice Burns a specified amount of sTokens (ERC-1155) from a given address.
     * @dev Callable only by accounts with the `MINTER_ROLE`.
     *
     * Requirements:
     * - Caller must have the `MINTER_ROLE`.
     * - `from` must own exactly `amount` of the token with the specified `nonce`.
     *
     * @param from The address from which the sTokens will be burned.
     * @param nonce The unique token ID (nonce) corresponding to the sToken type.
     * @param amount The amount of tokens to burn.
     */
    function sTokenBurn(
        address from,
        uint256 nonce,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        _burn(from, nonce, amount);
    }

    /// @dev Token Transfer Authorization
    /// @notice Ensures that only authorized transfers of non-Learner tokens are permitted.
    /// @dev This function overrides a base implementation to enforce custom transfer rules based on token type and roles.
    function _ensureCanTransfer(
        uint256 nonce,
        address from,
        address to,
        bytes memory attributes
    ) internal view override {
        ISToken.TokenAttributes memory tokenAttributes = abi.decode(
            attributes,
            (ISToken.TokenAttributes)
        );

        // All learner tokens are updatable without permission, but others require authorization.
        if (tokenAttributes.tokenType != ISToken.TokenType.Learner) {
            address caller = _msgSender();

            bool callerAuthorized = hasRole(MINTER_ROLE, caller) ||
                hasRole(TRANSFER_ROLE, caller);
            bool recipientAuthorized = hasRole(MINTER_ROLE, to) ||
                hasRole(TRANSFER_ROLE, to);

            if (!callerAuthorized && !recipientAuthorized) {
                revert UnAuthorizedSFTTransfer(nonce, from, to, caller);
            }
        }
    }

    /**
     * @dev Authorizes contract upgrades via the UUPS pattern.
     * Only callable by the contract owner.
     *
     * Requirements:
     * - Caller must be the contract owner.
     *
     * @param newImplementation The address of the new contract implementation.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
