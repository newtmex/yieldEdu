// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IdEDU} from "../IdEDU.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDEDU is IdEDU, ERC20 {
    constructor() ERC20("Mock dEDU", "dEDU") {}

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

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
