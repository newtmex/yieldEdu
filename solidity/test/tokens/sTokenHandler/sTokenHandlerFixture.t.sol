// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {
    ERC1967Proxy
} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {
    sTokenHandlerUpgradeable
} from "../../../contracts/abstracts/sTokenHandlerUpgradeable.sol";
import {ISToken} from "../../../contracts/tokens/ISToken.sol";

/// @notice Concrete implementation of the abstract handler for testing
contract TestableSTokenHandler is sTokenHandlerUpgradeable {
    bytes4 internal constant RETURN_MAGIC = this.onERC1155Received.selector;

    function initialize(ISToken sToken_) external initializer {
        __sTokenHandler_init(sToken_);
    }

    function _onERC1155Received(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal override returns (bytes4) {
        emit OnReceived(operator, from, tokenId, value, data);
        return RETURN_MAGIC;
    }

    event OnReceived(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes data
    );
}
