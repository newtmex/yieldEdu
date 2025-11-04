// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ContentLib {
    function generateSymbol(
        string memory title,
        uint256 contentId
    ) internal pure returns (string memory) {
        // Derive deterministic hash from title + ID
        bytes32 hash = keccak256(abi.encodePacked(contentId, title));

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

    function _toHexChar(
        uint8 nibble,
        bool upper
    ) private pure returns (bytes1) {
        if (nibble < 10) {
            return bytes1(uint8(nibble + 0x30)); // '0'–'9'
        } else {
            return
                bytes1(
                    uint8(nibble + (upper ? 0x37 : 0x57)) // 'A'–'F' or 'a'–'f'
                );
        }
    }

    function _toHexChar(uint8 nibble) private pure returns (bytes1) {
        return bytes1(nibble < 10 ? nibble + 0x30 : nibble + 0x37);
    }

    function generateContentId(
        address creator,
        string memory title,
        string memory description
    ) internal pure returns (uint256) {
        return
            uint256(keccak256(abi.encodePacked(title, creator, description)));
    }
}
