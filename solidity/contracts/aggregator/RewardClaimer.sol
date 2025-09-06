// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract RewardClaimer {
    event RewardClaimed(
        address indexed user,
        address indexed lst,
        uint256 amount
    );

    /**
     * @dev Claims rewards from an LST-compatible contract using low-level calls.
     * Optionally forwards the claimed reward to a specified address.
     *
     * Requirements:
     * - `lst` must expose `asset()`, `claimRewards()`.
     * - `asset()` must return a valid ERC20 token address.
     *
     * @param lst The address of the LST contract.
     * @param to Optional address to receive the claimed reward. If zero, stays in contract.
     * @return amount The amount of rewards claimed.
     */
    function _claimRewardsFrom(
        address lst,
        address to
    ) internal returns (uint256 amount) {
        require(lst != address(0), "RewardClaimer: invalid LST address");

        // Get the reward token address from the LST
        (bool ok, bytes memory assetData) = lst.call(
            abi.encodeWithSignature("asset()")
        );
        require(ok, "RewardClaimer: asset() call failed");

        // Claim rewards from the LST
        (bool success, bytes memory data) = lst.call(
            abi.encodeWithSignature("claimRewards()")
        );
        require(success, "RewardClaimer: claimRewards call failed");

        // Decode claimed amount
        amount = abi.decode(data, (uint256));
        require(amount > 0, "RewardClaimer: no rewards claimed");

        // Optionally forward rewards to recipient if provided
        if (to != address(0)) {
            address rewardToken = abi.decode(assetData, (address));
            require(
                rewardToken != address(0),
                "RewardClaimer: invalid reward token"
            );

            (bool transferSuccess, bytes memory transferData) = rewardToken
                .call(
                    abi.encodeWithSignature(
                        "transfer(address,uint256)",
                        to,
                        amount
                    )
                );
            require(
                transferSuccess &&
                    (transferData.length == 0 ||
                        abi.decode(transferData, (bool))),
                "RewardClaimer: reward transfer failed"
            );
        }

        emit RewardClaimed(to == address(0) ? address(this) : to, lst, amount);
    }
}
