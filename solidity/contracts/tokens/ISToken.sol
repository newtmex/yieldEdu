// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISFTUpgradeable} from "../abstracts/ISFTUpgradeable.sol";

/// @title ISToken
/// @notice Interface for the YieldEDU Semi-Fungible Token (sToken) contract.
/// @dev Extends the ERC-1155 standard with role-based minting and token attribute management.
interface ISToken is ISFTUpgradeable {
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

    /// @notice Mints a new sToken with specified attributes to a given address.
    /// @dev Only accounts with the `MINTER_ROLE` can invoke this function.
    /// @param to The address receiving the newly minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param attributes Struct containing metadata (`TokenType`) to associate with the minted token.
    /// @return nonce The unique identifier (token ID) assigned to the newly minted token.
    function sTokenMint(
        address to,
        uint256 amount,
        TokenAttributes calldata attributes
    ) external returns (uint256 nonce);
}
