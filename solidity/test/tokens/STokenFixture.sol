// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {SToken, ISToken} from "../../contracts/tokens/SToken.sol";

contract STokenFixture is GeneralFixture {
    address public sTokenMinter = makeAddr("sTokenMinter");
    SToken sToken;

    constructor() {
        sToken = _deploySToken();

        vm.startPrank(owner);
        sToken.grantRole(sToken.MINTER_ROLE(), sTokenMinter);
        sToken.grantRole(sToken.BINDING_UPDATE_ROLE(), address(this));
        vm.stopPrank();
    }

    function _mintScholarToken(
        address to,
        uint256 amount
    ) internal returns (uint256 nonce) {
        vm.startPrank(sTokenMinter);
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Scholar;
        nonce = sToken.sTokenMint(to, amount, attr);
        vm.stopPrank();
    }

    function _mintLearnerToken(
        address to,
        uint256 amount
    ) internal returns (uint256 nonce) {
        vm.startPrank(sTokenMinter);
        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;
        nonce = sToken.sTokenMint(to, amount, attr);
        vm.stopPrank();
    }

    function _uint256ArrayPrefilled(
        uint256 first,
        uint256 length
    ) internal pure returns (uint256[] memory arr) {
        assembly {
            let size := add(0x20, mul(length, 0x20))
            arr := mload(0x40)
            mstore(arr, length)
            let dataStart := add(arr, 0x20)
            if gt(length, 0) {
                mstore(dataStart, first)
            }
            let ptr := add(dataStart, 0x20)
            let end := add(dataStart, mul(length, 0x20))
            for {

            } lt(ptr, end) {
                ptr := add(ptr, 0x20)
            } {
                mstore(ptr, 0)
            }
            mstore(0x40, add(arr, size))
        }
    }

    function _addressArrayPrefilled(
        address first,
        uint256 length
    ) internal pure returns (address[] memory arr) {
        assembly {
            let size := add(0x20, mul(length, 0x20))
            arr := mload(0x40)
            mstore(arr, length)
            let dataStart := add(arr, 0x20)
            if gt(length, 0) {
                mstore(dataStart, first)
            }
            let ptr := add(dataStart, 0x20)
            let end := add(dataStart, mul(length, 0x20))
            for {

            } lt(ptr, end) {
                ptr := add(ptr, 0x20)
            } {
                mstore(ptr, 0)
            }
            mstore(0x40, add(arr, size))
        }
    }

    function _deploySToken() internal returns (SToken) {
        // Deploy implementation
        SToken implementation = new SToken();

        // Encode initializer call
        bytes memory initData = abi.encodeWithSelector(
            SToken.initialize.selector,
            "YieldEDU SFT",
            "sYLD",
            owner
        );

        // Deploy proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        // Cast to sToken
        return SToken(address(proxy));
    }
}
