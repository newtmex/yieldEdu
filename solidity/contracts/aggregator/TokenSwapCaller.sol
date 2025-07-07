// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TokenSwapCaller
/// @notice Enables token swaps via low-level router calls
abstract contract TokenSwapCaller {
    event TokensSwapped(
        address indexed user,
        address router,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] path,
        address to,
        uint256[] amounts
    );

    /**
     * @notice Performs a low-level token swap using the provided router.
     * @param router The router address to call.
     * @param amountIn The input token amount.
     * @param amountOutMin The minimum acceptable output amount.
     * @param path The swap path (input token to output token).
     * @param to The recipient of output tokens.
     * @param deadline Unix timestamp after which the transaction reverts.
     * @return amounts Array of token amounts at each step in the path.
     */
    function _swapExactTokensForTokens(
        address router,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path,
        address to,
        uint256 deadline
    ) internal returns (uint256[] memory amounts) {
        require(router != address(0), "SwapCaller: invalid router");
        require(path.length >= 2, "SwapCaller: invalid path");

        bytes memory payload = abi.encodeWithSignature(
            "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
            amountIn,
            amountOutMin,
            path,
            to,
            deadline
        );

        (bool success, bytes memory returnData) = router.call(payload);
        require(success, "SwapCaller: swap failed");

        amounts = abi.decode(returnData, (uint256[]));

        emit TokensSwapped(
            msg.sender,
            router,
            amountIn,
            amountOutMin,
            path,
            to,
            amounts
        );
    }
}
