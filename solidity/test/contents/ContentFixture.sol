// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {Content} from "../../contracts/contents/Content.sol";

/// @dev Simple mintable ERC20 for testing
contract MockERC20 is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ContentFixture is GeneralFixture {
    Content public content;
    MockERC20 public mockYLD;

    constructor() {
        // Deploy mock YLD token
        mockYLD = new MockERC20("YieldEDU", "YLD");
        mockYLD.mint(owner, 1_000_000 ether);

        // Deploy Content implementation
        Content implementation = new Content();

        string memory title = "Intro to DeFi";
        string
            memory description = "A foundational course on decentralized finance concepts.";
        uint256 contentId = uint256(keccak256(abi.encode(title, description)));

        // Encode initializer call
        bytes memory initData = abi.encodeWithSelector(
            Content.initialize.selector,
            contentId,
            title,
            description,
            address(mockYLD),
            owner
        );

        // Deploy proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        // Cast to Content
        content = Content(address(proxy));
    }
}
