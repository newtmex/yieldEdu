// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {YLDTokenFixture} from "../tokens/YLDTokenFixture.sol";
import {DEDUAggregator} from "../../contracts/aggregator/DEDUAggregator.sol";
import {MockRouter} from "../../contracts/external/mocks/MockRouter.sol";

contract DEDUAggregatorFixture is YLDTokenFixture {
    DEDUAggregator public aggregator;
    MockRouter public router;

    constructor() {
        // 1. Deploy a mock router
        router = new MockRouter();

        // 2. Deploy the aggregator implementation
        DEDUAggregator aggregatorImpl = new DEDUAggregator();

        // 3. Encode init call with router, yld token, and owner
        bytes memory initData = abi.encodeWithSelector(
            DEDUAggregator.initialize.selector,
            address(router),
            address(yld),
            owner
        );

        // 4. Deploy proxy and cast to DEDUAggregator
        ERC1967Proxy aggregatorProxy = new ERC1967Proxy(
            address(aggregatorImpl),
            initData
        );
        aggregator = DEDUAggregator(address(aggregatorProxy));
    }
}
