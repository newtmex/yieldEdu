// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {YLDToken} from "../../contracts/tokens/YLDToken.sol";

contract YLDTokenFixture is GeneralFixture {
    YLDToken public yld;

    constructor() {
        // Deploy the implementation contract
        YLDToken implementation = new YLDToken();

        // Prepare the initialization data
        bytes memory data = abi.encodeWithSelector(
            YLDToken.initialize.selector,
            "YieldEDU Token",
            "YLD",
            owner
        );

        // Deploy the proxy contract
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);

        // Cast the proxy address to YLDToken
        yld = YLDToken(address(proxy));
    }
}
