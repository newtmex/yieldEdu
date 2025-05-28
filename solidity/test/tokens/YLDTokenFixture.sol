// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {YLDToken} from "../../contracts/tokens/YLDToken.sol";
import {IdEDU} from "../../contracts/external/IdEDU.sol";

// Mock contracts for test purposes
contract MockDEDU is IdEDU, ERC20 {
    constructor() ERC20("Mock dEDU", "dEDU") {}

    function receiveFor(address to) external payable {
        _mint(to, msg.value);
    }

    function receiveForSpender(
        address owner,
        address spender
    ) external payable {
        _mint(owner, msg.value);
        _approve(owner, spender, msg.value);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
contract YLDTokenFixture is GeneralFixture {
    YLDToken public yld;
    MockDEDU public dedu;

    constructor() {
        dedu = new MockDEDU();

        // Deploy the implementation contract
        YLDToken implementation = new YLDToken();

        // Prepare the initialization data
        bytes memory data = abi.encodeWithSelector(
            YLDToken.initialize.selector,
            "YieldEDU Token",
            "YLD",
            owner,
            dedu
        );

        // Deploy the proxy contract
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);

        // Cast the proxy address to YLDToken
        yld = YLDToken(address(proxy));
    }
}
