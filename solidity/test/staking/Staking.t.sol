// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {Staking} from "../../contracts/staking/Staking.sol";
import {IdEDU} from "../../contracts/external/IdEDU.sol";
import {WEDU} from "../../contracts/external/WEDU.sol";
import {ISToken} from "../../contracts/tokens/ISToken.sol";

import {YLDTokenFixture} from "../tokens/YLDTokenFixture.sol";
import {STokenFixture} from "../tokens/STokenFixture.sol";

// Mock contracts for test purposes
contract MockDEDU is IdEDU, ERC20 {
    constructor() ERC20("Mock dEDU", "dEDU") {}

    function receiveFor(address to) external payable {
        _mint(to, msg.value);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract StakingTest is YLDTokenFixture, STokenFixture {
    Staking public staking;
    MockDEDU public dedu;
    WEDU public wedu;

    address public user = makeAddr("user");

    function setUp() public {
        dedu = new MockDEDU();
        wedu = new WEDU();

        Staking impl = new Staking();
        bytes memory initData = abi.encodeWithSelector(
            Staking.initialize.selector,
            address(wedu),
            address(dedu),
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

    function testStakeDEDUAndMint() public {
        uint256 stakeAmount = 10 ether;

        // Setup balances
        dedu.mint(user, stakeAmount);
        vm.prank(user);
        dedu.approve(address(staking), stakeAmount);

        vm.prank(user);
        staking.stakeDEDU(ISToken.TokenType.Learner, stakeAmount);

        assertEq(dedu.balanceOf(address(staking)), stakeAmount);
        assertEq(sToken.totalSupply(), stakeAmount);
        assertEq(yld.totalSupply(), stakeAmount);
    }

    function testStakeETHAndMint() public {
        uint256 ethAmount = 5 ether;

        vm.deal(user, ethAmount);
        vm.prank(user);
        staking.stakeEDU{value: ethAmount}(ISToken.TokenType.Scholar);

        assertEq(dedu.balanceOf(address(staking)), ethAmount);
        assertEq(sToken.totalSupply(), ethAmount);
        assertEq(yld.totalSupply(), ethAmount);
    }

    function testStakeWEDUAndMint() public {
        uint256 ethAmount = 5 ether;
        vm.deal(user, ethAmount);

        vm.startPrank(user);

        wedu.deposit{value: ethAmount}();
        wedu.approve(address(staking), ethAmount);
        staking.stakeWEDU(ISToken.TokenType.Scholar, ethAmount);

        vm.stopPrank();

        assertEq(dedu.balanceOf(address(staking)), ethAmount);
        assertEq(sToken.totalSupply(), ethAmount);
        assertEq(yld.totalSupply(), ethAmount);
    }

    function testRevertOnSupplyMismatch() public {
        // Force mismatch by minting YLD ignoring sToken supply
        vm.prank(address(staking));
        yld.mint(address(0x1), 1 ether);

        // Now try to stake
        dedu.mint(user, 3 ether);
        vm.prank(user);
        dedu.approve(address(staking), 3 ether);

        vm.expectRevert(Staking.SupplyMismatch.selector);
        vm.prank(user);
        staking.stakeDEDU(ISToken.TokenType.Scholar, 3 ether);
    }

    function testRevertOnInsufficientDEDU() public {
        // YLD = 5, sToken = 5, dEDU = 4 (insufficient)
        vm.startPrank(address(staking));
        yld.mint(address(0x1), 5 ether);

        ISToken.TokenAttributes memory attr;
        attr.tokenType = ISToken.TokenType.Learner;

        sToken.sTokenMint(address(0x1), 5 ether, attr);
        vm.stopPrank();

        dedu.mint(address(staking), 4 ether);

        vm.expectRevert(Staking.InsufficientDEDU.selector);
        staking.stakeDEDU(ISToken.TokenType.Learner, 0); // doesn't matter, balance checked internally
    }
}
