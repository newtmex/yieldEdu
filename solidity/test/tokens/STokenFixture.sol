// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {SToken} from "../../contracts/tokens/SToken.sol";

contract STokenFixture is GeneralFixture {
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
    }
}
