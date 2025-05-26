// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/// @title IYLDToken
/// @notice Interface for the YieldEDU YLD Token contract.
/// @dev Extends the ERC-20 standard with minting controlled by role-based access.
interface IYLDToken is IERC20, IAccessControl {
    /// @notice Role identifier for minters.
    /// @dev Only addresses with this role can call the `mint` function.
    function MINTER_ROLE() external view returns (bytes32);

    /// @notice Mints new YLD tokens to a specified address.
    /// @dev Only callable by accounts with the `MINTER_ROLE`.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    function mint(address to, uint256 amount) external;
}
