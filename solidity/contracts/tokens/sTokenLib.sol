// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISToken} from "./ISToken.sol";

/// @title sTokenLib
/// @notice Utility library for managing binding and attribute logic for ISToken
library sTokenLib {
    /// @notice Checks if a given Binding is active (non-zero)
    /// @param self The Binding struct to inspect
    /// @return isNonZero True if any field in the Binding is non-zero
    function isBound(
        ISToken.Binding memory self
    ) internal pure returns (bool isNonZero) {
        assembly ("memory-safe") {
            // Load struct fields (3 slots)
            let content := mload(self)
            let enrolledAt := mload(add(self, 0x20))
            let completeAfter := mload(add(self, 0x40))

            // Return true if any field is non-zero
            isNonZero := or(content, or(enrolledAt, completeAfter))
        }
    }

    /// @notice Decodes raw attribute bytes into a TokenAttributes struct
    /// @param attr The ABI-encoded attributes data
    /// @return Decoded TokenAttributes struct
    function decode(
        bytes memory attr
    ) internal pure returns (ISToken.TokenAttributes memory) {
        return abi.decode(attr, (ISToken.TokenAttributes));
    }

    /// @notice Updates the Binding struct with new values
    /// @param self The existing Binding storage reference
    /// @param newBinding The new binding data to set
    function setBinding(
        ISToken.Binding memory self,
        ISToken.Binding memory newBinding
    ) internal pure returns (ISToken.Binding memory) {
        self.content = newBinding.content;
        self.enrolledAt = newBinding.enrolledAt;
        self.completeAfter = newBinding.completeAfter;

        return self;
    }

    /// @notice Clears the Binding struct (sets all fields to zero)
    /// @param self The Binding memory reference to clear
    function resetBinding(
        ISToken.Binding memory self
    ) internal pure returns (ISToken.Binding memory) {
        delete self.content;
        delete self.enrolledAt;
        delete self.completeAfter;

        return self;
    }
}
