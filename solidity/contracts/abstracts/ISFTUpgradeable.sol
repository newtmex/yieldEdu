// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISFTUpgradeable
 * @dev Interface for the SFTUpgradeable contract, defining essential functions and structures.
 */
interface ISFTUpgradeable {
    /**
     * @dev Struct representing the balance and attributes of an SFT.
     */
    struct SftBalance {
        uint256 nonce;
        uint256 amount;
        bytes attributes;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * @return The number of decimals.
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Returns the name of the token.
     * @return The token name.
     */

    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     * @return The token symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the list of nonces owned by an address.
     * @param owner The address of the token owner.
     * @return Array of nonces.
     */
    function getNonces(address owner) external view returns (uint256[] memory);

    /**
     * @dev Returns the total supply of all tokens.
     * @return The total supply.
     */
    function totalSupply() external view returns (uint256);
}
