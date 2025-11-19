// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {Staking} from "../../contracts/staking/Staking.sol";
import {WEDU} from "../../contracts/external/WEDU.sol";

import {YLDTokenFixture} from "../tokens/YLDTokenFixture.sol";
import {STokenFixture} from "../tokens/STokenFixture.sol";

contract StakingFixture is YLDTokenFixture, STokenFixture {
    Staking public staking;
    WEDU public wedu;

    constructor() {
        wedu = new WEDU();

        Staking impl = new Staking();
        bytes memory initData = abi.encodeWithSelector(
            Staking.initialize.selector,
            address(wedu),
            address(sToken),
            address(yld),
            owner
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        staking = Staking(payable(address(proxy)));

        // Grant MINTER_ROLE to staking contract
        yld.grantRole(yld.MINTER_ROLE(), address(staking));
        sToken.grantRole(sToken.MINTER_ROLE(), address(staking));
    }
}
