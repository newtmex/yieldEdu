// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMockERC20 is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract MockRouter {
    /// @dev Emits actual call for visibility in tests
    event MockSwapExecuted(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] path,
        address to,
        uint256 deadline,
        uint256[] result
    );

    /// @notice Mocks the behavior of a router's swapExactTokensForTokens
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(path.length >= 2, "MockRouter: invalid path");
        require(to != address(0), "MockRouter: invalid recipient");

        address inputToken = path[0];
        address outputToken = path[path.length - 1];

        // Burn the input token from sender
        IERC20(inputToken).transferFrom(msg.sender, address(this), amountIn);

        // Define a mocked rate: 1 input = 0.8 output
        uint256 amountOut = (amountIn * 80) / 100;
        // Mint or transfer mock output token via low-level call
        IMockERC20(outputToken).mint(to, amountOut);

        // Return amounts path-style
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i = 1; i < path.length - 1; i++) {
            amounts[i] = amountIn; // No-op for mid-paths
        }
        amounts[path.length - 1] = amountOut;

        emit MockSwapExecuted(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
            amounts
        );
    }
}
