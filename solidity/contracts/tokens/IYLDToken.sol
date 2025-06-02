// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/// @title IYLDToken
/// @notice Interface for the YieldEDU YLD Token contract.
/// @dev Extends the ERC-20 standard with minting controlled by role-based access.
interface IYLDToken is IERC4626, IAccessControl {
    /// @notice Role identifier for minters.
    /// @dev Only addresses with this role can call the `mint` function.
    function MINTER_ROLE() external view returns (bytes32);
}
