// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IYLDToken} from "./IYLDToken.sol";

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
    ERC20Upgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IYLDToken
{
    /// @notice Role identifier for accounts allowed to mint tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

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
        address initialOwner
    ) public initializer {
        __ERC20_init(name, symbol);
        __AccessControl_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    /**
     * @notice Mints new tokens to the specified address.
     * @dev Caller must have the MINTER_ROLE.
     *
     * @param to The address to receive the newly minted tokens.
     * @param amount The number of tokens to mint (in wei).
     *
     * Emits a {Transfer} event from the zero address.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
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
