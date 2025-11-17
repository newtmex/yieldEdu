// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {
    ERC1967Proxy
} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {TestableSTokenHandler} from "./sTokenHandlerFixture.t.sol";
import {STokenFixture} from "../STokenFixture.sol";

contract STokenHandlerTest is STokenFixture {
    TestableSTokenHandler public handler;

    address public stranger = makeAddr("stranger");

    function setUp() public {
        vm.startPrank(owner);

        // Deploy implementation
        TestableSTokenHandler impl = new TestableSTokenHandler();

        // Encode initializer
        bytes memory initData = abi.encodeWithSelector(
            TestableSTokenHandler.initialize.selector,
            address(sToken)
        );

        // Deploy proxy
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);

        // Attach the proxy to the handler interface
        handler = TestableSTokenHandler(address(proxy));

        vm.stopPrank();
    }

    function test_OnERC1155Received_OnlySTokenAllowed() public {
        // Call from authorized sToken
        vm.startPrank(address(sToken));
        bytes4 result = handler.onERC1155Received(
            address(this),
            owner,
            1,
            1,
            ""
        );
        vm.stopPrank();

        assertEq(
            result,
            handler.onERC1155Received.selector,
            "Incorrect return value"
        );

        // Unauthorized caller should revert
        vm.expectRevert("UNAUTHORIZED_STOKEN");
        vm.prank(stranger);
        handler.onERC1155Received(address(this), owner, 1, 1, "");
    }

    function test_OnERC1155BatchReceived_RevertsAlways() public {
        vm.startPrank(address(sToken));

        uint256[] memory ids = _uint256ArrayPrefilled(1, 1);
        uint256[] memory values = _uint256ArrayPrefilled(1, 1);

        vm.expectRevert("BATCH_NOT_SUPPORTED");
        handler.onERC1155BatchReceived(address(this), owner, ids, values, "");

        vm.stopPrank();
    }

}
