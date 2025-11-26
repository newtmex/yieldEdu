// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "forge-std/Test.sol";

import {DEDUAggregatorFixture} from "../aggregator/DEDUAggregatorFixture.sol";

import {ContentController} from "../../contracts/contents/ContentController.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ContentControllerFixture is DEDUAggregatorFixture {
    ContentController public contentController;
    address public contentControllerAddress;
    address public feeCollector;

    constructor() {
        feeCollector = address(aggregator);

        // Deploy ContentController UUPS proxy
        ContentController implementation = new ContentController();
        bytes memory initData = abi.encodeWithSelector(
            ContentController.initialize.selector,
            owner, // admin
            address(sToken), // sToken
            IERC20(address(yld)), // asset,
            feeCollector // fee collector
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        contentController = ContentController(address(proxy));
        contentControllerAddress = address(contentController);
        vm.label(contentControllerAddress, "ContentController");

        sToken.grantRole(sToken.BINDING_UPDATE_ROLE(), contentControllerAddress);
        sToken.grantRole(sToken.TRANSFER_ROLE(), contentControllerAddress);
    }
}
