// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IdEDU} from "../IdEDU.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDEDU is IdEDU, ERC20 {
    address public immutable rewardToken;
    uint256 public rewardsAvailable = 2 ether;

    constructor() ERC20("Mock dEDU", "dEDU") {
        rewardToken = address(this); // for testing, dEDU is its own reward
    }

    /// @notice Simulate depositing ETH to mint dEDU
    function receiveFor(address to) external payable {
        _mint(to, msg.value);
    }

    function receiveForSpender(
        address owner,
        address spender
    ) external payable {
        _mint(owner, msg.value);
        _approve(owner, spender, msg.value);
    }

    /// @notice Admin/test helper to simulate incoming yield
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Simulate asset() returning the reward token address (this)
    function asset() external view returns (address) {
        return rewardToken;
    }

    /// @notice Simulate reward claiming logic
    /// Transfers rewards to caller and returns amount
    function claimRewards() external returns (uint256 amount) {
        amount = rewardsAvailable;
 
        _mint(msg.sender, amount);
        return amount;
    }

    /// @notice Set mock rewards to be available for claim
    function setRewardsAvailable(uint256 amount) external {
        rewardsAvailable = amount;
    }
}
