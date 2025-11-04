// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {SToken, ISToken} from "../../contracts/tokens/SToken.sol";

contract STokenFixture is GeneralFixture {
    address public sTokenMinter = makeAddr("sTokenMinter");
    SToken sToken;

    constructor() {
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
        sToken = SToken(address(proxy));

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
}
