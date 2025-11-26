// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ContentControllerFixture} from "./ContentControllerFixture.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Content} from "../../contracts/contents/Content.sol";

contract ContentControllerTest is ContentControllerFixture {
    address contentOwner;

    function setUp() public {
        contentOwner = makeAddr("contentOwner");

        // Fixture already deploys:
        // - mock asset token
        // - mock sToken
        // - contentController
        // - mints initial balances
    }

    /* -------------------------------------------------------------------------- */
    /*                        Test: onERC1155Received                             */
    /* -------------------------------------------------------------------------- */

    function test_onERC1155Received_RevertIfNotFromSToken() public {
        address attacker = makeAddr("attacker");

        vm.prank(attacker);
        vm.expectRevert("UNAUTHORIZED_STOKEN");

        contentController.onERC1155Received(attacker, attacker, 1, 1, "");
    }

    /* -------------------------------------------------------------------------- */
    /*                        Test: deployFee() view                              */
    /* -------------------------------------------------------------------------- */

    function test_deployFee_ReturnsCorrectValue() public view {
        assertEq(contentController.deployFee(), 10 ether);
    }

    /* -------------------------------------------------------------------------- */
    /*                        Test: setDeployFee()                                */
    /* -------------------------------------------------------------------------- */

    function test_setDeployFee_UpdatesValue() public {
        uint256 newFee = 25 ether;

        vm.prank(owner);
        contentController.setDeployFee(newFee);

        assertEq(contentController.deployFee(), newFee);
    }

    function test_setDeployFee_RevertIfNotOwner() public {
        uint256 newFee = 5 ether;

        vm.prank(contentOwner);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                contentOwner
            )
        );

        contentController.setDeployFee(newFee);
    }

    /* -------------------------------------------------------------------------- */
    /*                        Test: deployContent()                               */
    /* -------------------------------------------------------------------------- */

    function test_deployContent_SucceedsAndCreatesProxy() public {
        IERC20 asset = IERC20(contentController.asset());
        uint256 fee = contentController.deployFee();
        _mintYLDToken(contentOwner, fee);

        // contentOwner approves deploy fee
        vm.startPrank(contentOwner);
        asset.approve(address(contentController), fee);

        // Capture feeCollector starting balance
        uint256 startBalance = asset.balanceOf(feeCollector);

        // Deploy content
        (address contentAddr, string memory symbol) = contentController
            .deployContent("Intro to Solidity", "L1 Course");

        vm.stopPrank();

        // ----------------------------------------------------
        // Assertions
        // ----------------------------------------------------

        // 1. Fee moved to feeCollector
        assertEq(asset.balanceOf(feeCollector), startBalance + fee);

        // 2. Content proxy created
        assertTrue(contentAddr != address(0));

        // 3. Content is a valid BeaconProxy (check code size > 0)
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(contentAddr)
        }
        assertTrue(codeSize > 0);

        // 4. Symbol returned correctly
        assertBytesNonEmpty(bytes(symbol));

        // 5. Check the deployed contract initialized owner properly
        Content content = Content(contentAddr);
        assertEq(
            content.owner(),
            contentOwner,
            "caller should be the content owner"
        );
    }

    function test_deployContent_RevertIfNoFeePaid() public {
        IERC20 asset = IERC20(contentController.asset());

        uint256 fee = contentController.deployFee();
        uint256 approvedAmt = fee / 2;

        // contentOwner does NOT approve enough tokens
        vm.startPrank(contentOwner);
        asset.approve(contentControllerAddress, approvedAmt);

        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC20InsufficientAllowance(address,uint256,uint256)",
                contentControllerAddress,
                approvedAmt,
                fee
            )
        ); // OZ ERC20 transferFrom will revert

        contentController.deployContent("Bad Deploy", "Missing Fee");

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                                HELPERS                                     */
    /* -------------------------------------------------------------------------- */

    function assertBytesNonEmpty(bytes memory b) internal pure {
        require(b.length > 0, "Expected non-empty bytes");
    }
}
