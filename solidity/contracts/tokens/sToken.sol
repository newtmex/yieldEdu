// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SFTUpgradeable} from "../abstracts/SFTUpgradeable.sol";

/**
 * @title sToken
 * @dev YieldEDU Semi-Fungible Token (SFT) contract extending SFTUpgradeable, with UUPS upgradeability and role-based minting.
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
contract sToken is SFTUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    /**
     * @dev Enum representing the type of the token.
     * - `Learner`: Represents a token awarded to learners.
     * - `Scholar`: Represents a token awarded to scholars.
     */
    enum TokenType {
        Learner,
        Scholar
    }

    /**
     * @dev Struct encapsulating the attributes associated with a token.
     * @param tokenType The type of the token, indicating its category.
     */
    struct TokenAttributes {
        TokenType tokenType;
    }

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
        TokenAttributes memory attributes
    ) external onlyRole(MINTER_ROLE) returns (uint256 nonce) {
        return _mintSFT(to, amount, abi.encode(attributes));
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
