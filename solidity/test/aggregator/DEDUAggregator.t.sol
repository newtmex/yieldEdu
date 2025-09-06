// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {DEDUAggregatorFixture} from "./DEDUAggregatorFixture.sol";
import {MockRouter} from "../../contracts/external/mocks/MockRouter.sol";
import {DEDUAggregator} from "../../contracts/aggregator/DEDUAggregator.sol";
import {YLDToken} from "../../contracts/tokens/YLDToken.sol";

contract DEDUAggregatorTest is DEDUAggregatorFixture {
    address internal executor = makeAddr("Executor");

    function setUp() public {
        // Assign EXECUTOR_ROLE to test executor
        vm.startPrank(owner);
        aggregator.grantRole(aggregator.EXECUTOR_ROLE(), executor);
        yld.grantRole(yld.CLAIMER_ROLE(), address(aggregator));
        vm.stopPrank();
    }

    function test_ClaimAndSwapYieldsToDEDU() public {
        // Configure swap path: reward token -> dEDU
        address[] memory path = new address[](2);
        path[0] = address(dedu); // input token (reward token)
        path[1] = address(dedu); // output token (dEDU) – for simplicity, same mock

        uint256 yieldBefore = dedu.balanceOf(address(yld));

        // Execute claim and swap
        vm.prank(executor);
        dedu.setRewardsAvailable(100 ether);
        (uint256 claimed, uint256 received) = aggregator.claimAndSwapToDEDU(
            path,
            80 ether, // minimum output (expecting 80% of input)
            block.timestamp + 1 hours
        );

        uint256 yieldAfter = dedu.balanceOf(address(yld));
        uint256 actualReceived = yieldAfter - yieldBefore;

        assertEq(claimed, 100 ether, "Expected 100 dEDU claimed from YLD");
        assertEq(received, 80 ether, "Expected 80 dEDU received from swap");
        assertEq(
            actualReceived,
            received,
            "Yield growth must match swap output"
        );
    }

    function test_RevertIfCalledByNonExecutor() public {
        address caller = makeAddr("UnauthorizedCaller");
        // Prepare the expected revert signature
        bytes memory expectedRevert = abi.encodeWithSelector(
            bytes4(
                keccak256("AccessControlUnauthorizedAccount(address,bytes32)")
            ),
            caller, // caller without role
            aggregator.EXECUTOR_ROLE()
        );

        // Call the function that requires EXECUTOR_ROLE
        address[] memory path = new address[](2);
        path[0] = address(dedu);
        path[1] = address(dedu);

        // Set expectation for that specific revert
        vm.expectRevert(expectedRevert);
        vm.prank(caller);
        aggregator.claimAndSwapToDEDU(path, 1, block.timestamp + 1 hours);
    }

    function test_RevertIfInvalidSwapPath() public {
        vm.startPrank(executor);
        address[] memory invalidPath = new address[](1); // too short
        invalidPath[0] = address(dedu);

        vm.expectRevert("Aggregator: invalid swap path");
        aggregator.claimAndSwapToDEDU(
            invalidPath,
            1,
            block.timestamp + 1 hours
        );
        vm.stopPrank();
    }

    function test_RevertIfNoRewardsClaimed() public {
        dedu.setRewardsAvailable(0);

        vm.startPrank(executor);
        address[] memory path = new address[](2);
        path[0] = address(dedu);
        path[1] = address(dedu);

        vm.expectRevert("RewardClaimer: no rewards claimed");
        aggregator.claimAndSwapToDEDU(path, 1 ether, block.timestamp + 1 hours);
        vm.stopPrank();
    }
}
