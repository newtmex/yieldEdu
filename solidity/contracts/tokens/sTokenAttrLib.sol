// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title sTokenAttrLib
/// @notice Library for managing binding-related logic for ISToken attributes
library sTokenAttrLib {
    struct Binding {
        address course;
        uint256 enrolledAt;
        uint256 completeBy;
    }

    /// @notice Checks if the given Binding is active (non-empty)
    /// @param self The Binding struct to inspect
    /// @return True if binding is set
    function isBound(Binding memory self) internal pure returns (bool) {
        return (self.course != address(0) && self.enrolledAt != 0);
    }

    // /// @notice Assigns new binding data
    // function setBinding(
    //     Binding storage self,
    //     address course,
    //     uint256 enrolledAt,
    //     uint256 completeBy
    // ) internal {
    //     self.course = course;
    //     self.enrolledAt = enrolledAt;
    //     self.completeBy = completeBy;
    // }

    // /// @notice Clears binding data
    // function clearBinding(Binding storage self) internal {
    //     delete self.course;
    //     delete self.enrolledAt;
    //     delete self.completeBy;
    // }
}
