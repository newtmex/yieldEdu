// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ContentLib {
    function generateSymbol(
        string memory title,
        address creator
    ) internal pure returns (string memory) {
        // Derive deterministic hash from title + creator address
        bytes32 hash = keccak256(abi.encodePacked(title, creator));

        // 8 hex chars (32 bits of entropy) => ~4.3 billion unique combos
        bytes memory frag = new bytes(8);

        unchecked {
            for (uint256 i; i < 8; ++i) {
                // Extract one nibble (4 bits)
                uint8 nibble = uint8(hash[i]) >> 4;

                // Convert nibble to hex character (0–9, A–F)
                bytes1 char = bytes1(
                    nibble + (nibble < 10 ? 0x30 : 0x41 - 10) // 0x30 = '0', 0x41 = 'A'
                );

                // Deterministically flip case using another hash bit
                // e.g., bit 0 of hash[i] decides upper/lower casing
                if (uint8(hash[i]) & 1 == 1 && char >= 0x41 && char <= 0x5A) {
                    char = bytes1(uint8(char) + 32); // to lowercase
                }

                frag[i] = char;
            }
        }

        return string(abi.encodePacked("cYLD-", frag));
    }
}
