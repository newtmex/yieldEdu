// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {YLDToken} from "../../contracts/tokens/YLDToken.sol";
import {MockDEDU} from "../../contracts/external/mocks/MockDEDU.sol";

contract YLDTokenFixture is GeneralFixture {
    address public yldMinter = makeAddr("yldMinter");
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

        // Grant MINTER_ROLE to minter
        vm.prank(owner);
        yld.grantRole(yld.MINTER_ROLE(), yldMinter);
    }

    function _mintYLDToken(address to, uint256 amount) internal {
        vm.prank(yldMinter);
        yld.mint(amount, to);
    }
}
