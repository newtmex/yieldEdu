// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {DEDUAggregatorFixture} from "./DEDUAggregatorFixture.sol";
import {MockRouter} from "../../contracts/external/mocks/MockRouter.sol";
import {DEDUAggregator} from "../../contracts/aggregator/DEDUAggregator.sol";
import {YLDToken} from "../../contracts/tokens/YLDToken.sol";

contract MockContentController {
    function totalSupply() public returns (uint256) {
        return type(uint256).max;
    }
}

contract DEDUAggregatorTest is DEDUAggregatorFixture {
    address internal executor = makeAddr("Executor");
    address contentController;

    function setUp() public {
        contentController = address(new MockContentController());

        // Assign EXECUTOR_ROLE to test executor
        vm.startPrank(owner);
        aggregator.grantRole(aggregator.EXECUTOR_ROLE(), executor);
        yld.grantRole(yld.CLAIMER_ROLE(), address(aggregator));

        aggregator.configureCoreContracts(
            address(sToken),
            contentController,
            address(staking)
        );

        vm.stopPrank();
    }

    function test_accumulateRewards() public {
        // Configure swap path: reward token -> dEDU
        address[] memory path = new address[](2);
        path[0] = address(dedu); // input token (reward token)
        path[1] = address(dedu); // output token (dEDU) – for simplicity, same mock

        uint256 yieldBefore = dedu.balanceOf(address(yld));

        // Execute claim and swap
        vm.prank(executor);
        dedu.setRewardsAvailable(100 ether);
        (uint256 claimed, uint256 received) = aggregator.accumulateRewards(
            path,
            80 ether, // minimum output (expecting 80% of input)
            block.timestamp + 1 hours
        );

        uint256 yieldAfter = dedu.balanceOf(address(yld));
        uint256 actualReceived = yieldAfter - yieldBefore;

        uint256 sTokenBalance = sToken.balanceOf(address(aggregator), 1);

        assertEq(claimed, 100 ether, "Expected 100 dEDU claimed from YLD");
        assertEq(received, 80 ether, "Expected 80 dEDU received from swap");
        assertEq(
            actualReceived,
            received,
            "Yield growth must match swap output"
        );

        assertGt(sTokenBalance, 0, "SToken should be minted");
        assertEq(
            sTokenBalance,
            yld.balanceOf(contentController),
            "Content controller should receive the minted Yld"
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
        aggregator.accumulateRewards(path, 1, block.timestamp + 1 hours);
    }

    function test_RevertIfInvalidSwapPath() public {
        vm.startPrank(executor);
        address[] memory invalidPath = new address[](1); // too short
        invalidPath[0] = address(dedu);

        vm.expectRevert("Aggregator: invalid swap path");
        aggregator.accumulateRewards(invalidPath, 1, block.timestamp + 1 hours);
        vm.stopPrank();
    }

    function test_RevertIfNoRewardsClaimed() public {
        dedu.setRewardsAvailable(0);

        vm.startPrank(executor);
        address[] memory path = new address[](2);
        path[0] = address(dedu);
        path[1] = address(dedu);

        vm.expectRevert("RewardClaimer: no rewards claimed");
        aggregator.accumulateRewards(path, 1 ether, block.timestamp + 1 hours);
        vm.stopPrank();
    }

    function test_onERC1155Received_MergesLearnerTokens() public {
        // Set up: create 2 learner sTokens for the aggregator
        // Mint learner tokens: nonce 1 and nonce 2
        uint256 learner1 = _mintLearnerToken(address(aggregator), 1 ether);
        uint256 learner2 = _mintLearnerToken(address(aggregator), 1 ether);

        uint256[] memory nonces = sToken.getNonces(address(aggregator));

        // After merging, there should be exactly 1 learner nonce
        assertEq(nonces.length, 1, "Learner nonces should be merged");
        assertEq(
            sToken.balanceOf(address(aggregator), learner1),
            2 ether,
            "All learner tokens tobe merged into the first one"
        );
    }

    function test_onERC1155Received_MergesScholarTokens() public {
        uint256 scholar1 = _mintScholarToken(address(aggregator), 1 ether);
        uint256 scholar2 = _mintScholarToken(address(aggregator), 1 ether);

        uint256[] memory nonces = sToken.getNonces(address(aggregator));

        assertEq(nonces.length, 1, "Scholar nonces should be merged");
        assertEq(
            sToken.balanceOf(address(aggregator), scholar1),
            2 ether,
            "All scholar tokens tobe merged into the first one"
        );
    }

    function test_onERC1155Received_RevertIfNotFromSToken() public {
        address attacker = makeAddr("attacker");

        vm.prank(attacker);
        vm.expectRevert("UNAUTHORIZED_STOKEN");

        aggregator.onERC1155Received(attacker, attacker, 1, 1, "");
    }
}
