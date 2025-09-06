// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IYLDToken} from "./IYLDToken.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {RewardClaimer} from "../aggregator/RewardClaimer.sol";

/**
 * @title YLDToken
 * @dev YieldEDU Yield Token (YLD) - Upgradeable ERC20 token with access control and minting capabilities.
 *
 * The YLD token is the native utility token of the YieldEDU decentralized education protocol.
 * It is used to represent yield-bearing rewards from staking and to incentivize platform contributors.
 *
 * Key Features:
 * - Upgradeable using UUPS (Universal Upgradeable Proxy Standard).
 * - ERC20-compliant fungible token.
 * - Role-based minting using OpenZeppelin's AccessControl.
 * - Ownership-based upgrade control using Ownable.
 */
contract YLDToken is
    Initializable,
    ERC4626Upgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IYLDToken,
    RewardClaimer
{
    /// @notice Role identifier for accounts allowed to mint tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Role identifier for accounts allowed to claim rewards.
    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER_ROLE");

    /**
     * @dev Disables initializers in the implementation contract.
     * This prevents misuse by ensuring it cannot be initialized directly.
     *
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the YLDToken contract.
     * Grants DEFAULT_ADMIN_ROLE to the specified owner.
     *
     * @param name The name of the token (e.g. "YieldEDU Token").
     * @param symbol The symbol of the token (e.g. "YLD").
     * @param initialOwner The address that will be granted admin rights and ownership.
     *
     * Requirements:
     * - Can only be called once.
     */
    function initialize(
        string memory name,
        string memory symbol,
        address initialOwner,
        IERC20 asset
    ) public initializer {
        __UUPSUpgradeable_init();

        __ERC20_init(name, symbol);
        __ERC4626_init(asset);

        __AccessControl_init();
        __Ownable_init(initialOwner);

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    /**
     * @dev Overrides the `_deposit` function to restrict access to accounts with MINTER_ROLE.
     */
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override onlyRole(MINTER_ROLE) {
        super._deposit(caller, receiver, assets, shares);
    }

    /**
     * @dev Overrides the `_withdraw` function to restrict access to accounts with MINTER_ROLE.
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override onlyRole(MINTER_ROLE) {
        super._withdraw(caller, receiver, owner, assets, shares);
    }

    /**
     * @notice Collects yield rewards from the dEDU contract (`asset()`).
     * @dev Only callable by addresses with the CLAIMER_ROLE.
     *
     * This function internally calls `_claimRewardsFrom`, which:
     * - Retrieves the reward token by calling `asset()` on the dEDU contract.
     * - Calls `mintGainz()` on the reward token, if implemented.
     * - Calls `claimRewards()` on the dEDU contract to trigger reward distribution.
     * - Transfers the claimed rewards to the specified recipient (`to`), if provided.
     * - Emits a {RewardClaimed} event.
     *
     * Requirements:
     * - Caller must have the CLAIMER_ROLE.
     * - The dEDU contract must implement `asset()` and `claimRewards()`.
     * - The reward token must optionally implement `mintGainz()` and `transfer()`.
     *
     * @param to The address to receive the claimed rewards. If the zero address, rewards remain in this contract.
     * @return amount The amount of rewards successfully claimed.
     */
    function collectYields(
        address to
    ) external onlyRole(CLAIMER_ROLE) returns (uint256 amount) {
        amount = _claimRewardsFrom(asset(), to);
    }

    /**
     * @dev Authorizes a contract upgrade.
     * Restricted to the current owner.
     *
     * @param newImplementation Address of the new implementation contract.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
