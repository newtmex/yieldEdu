// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "../tokens/ISToken.sol";
import "../tokens/IYLDToken.sol";
import "../external/IdEDU.sol";
import "../external/WEDU.sol";

import {IStaking} from "./IStaking.sol";

/// @title Staking Contract
/// @notice Enables staking of native ETH, WEDU, or dEDU to mint sTokens and YLD tokens.
/// @dev Implements ERC-7201-compliant storage layout and UUPS upgradeable architecture.
contract Staking is
    IStaking,
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // -------------------------------------------------------------
    //                         STORAGE LAYOUT
    // -------------------------------------------------------------

    /// @custom:storage-location erc7201:staking.main
    struct StakingStorage {
        WEDU wedu;
        IdEDU dEDUToken;
        ISToken sToken;
        IYLDToken yldToken;
    }

    /// @custom:storage-location erc7201:staking.main
    bytes32 private constant STAKING_STORAGE_LOCATION =
        keccak256("staking.main");

    /// @dev Internal getter for accessing storage struct via ERC-7201 pattern.
    function _getStakingStorage()
        private
        pure
        returns (StakingStorage storage $)
    {
        bytes32 position = STAKING_STORAGE_LOCATION;
        assembly {
            $.slot := position
        }
    }

    // -------------------------------------------------------------
    //                          INITIALIZER
    // -------------------------------------------------------------

    /// @dev Constructor that disables initializers to prevent misuse of implementation contract.
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the staking contract with the provided token addresses and owner.
    /// @param _wedu Address of the WEDU ERC-20 token.
    /// @param _sToken Address of the sToken contract (ERC-1155).
    /// @param _yld Address of the YLD ERC-20 reward token.
    /// @param owner Address that will be granted ownership rights.
    function initialize(
        address _wedu,
        address _sToken,
        address _yld,
        address owner
    ) public initializer {
        __Ownable_init(owner);
        __UUPSUpgradeable_init();

        StakingStorage storage $ = _getStakingStorage();

        $.wedu = WEDU(payable(_wedu));
        $.sToken = ISToken(_sToken);
        $.yldToken = IYLDToken(_yld);

        $.dEDUToken = IdEDU($.yldToken.asset());

        grantAUMInfiniteAllowance();
    }

    // -------------------------------------------------------------
    //                          STAKE LOGIC
    // -------------------------------------------------------------

    /// @notice Stake native ETH which is wrapped into dEDU via `receiveFor`.
    /// @param tokenType The type of sToken to mint (e.g., Learner or Scholar).
    /// @return tokenId The ID of the minted sToken.
    /// @return shares The number of YLD shares minted.
    function stakeEDU(
        ISToken.TokenType tokenType
    ) external payable returns (uint256 tokenId, uint256 shares) {
        StakingStorage storage $ = _getStakingStorage();

        $.dEDUToken.receiveFor{value: msg.value}(address(this));

        return _mintStakePair(_msgSender(), tokenType);
    }

    /// @notice Stake existing WEDU ERC-20 tokens.
    /// @dev Internally unwraps WEDU to ETH and deposits it into dEDU, then stakes.
    /// @param tokenType The type of sToken to mint.
    /// @param amount The amount of WEDU to transfer and stake.
    /// @return tokenId The ID of the minted sToken.
    /// @return shares The number of YLD shares minted.
    function stakeWEDU(
        ISToken.TokenType tokenType,
        uint256 amount
    ) external returns (uint256 tokenId, uint256 shares) {
        StakingStorage storage $ = _getStakingStorage();
        address from = _msgSender();

        $.wedu.transferFrom(from, address(this), amount);
        $.wedu.withdraw(amount);
        $.dEDUToken.receiveFor{value: amount}(address(this));

        return _mintStakePair(from, tokenType);
    }

    /// @notice Stake existing dEDU ERC-20 tokens directly.
    /// @param tokenType The type of sToken to mint.
    /// @param amount The amount of dEDU to transfer and stake.
    /// @return tokenId The ID of the minted sToken.
    /// @return shares The number of YLD shares minted.
    function stakeDEDU(
        ISToken.TokenType tokenType,
        uint256 amount
    ) external returns (uint256 tokenId, uint256 shares) {
        StakingStorage storage $ = _getStakingStorage();

        address from = _msgSender();
        $.dEDUToken.transferFrom(from, address(this), amount);

        return _mintStakePair(from, tokenType);
    }

    /**
     * @dev Mints an sToken and corresponding YLD shares for the specified user and token type.
     *
     * Requirements:
     * - Contract must hold dEDU prior to minting.
     * - sToken and YLD total supplies must remain synchronized.
     *
     * @param to Address receiving the sToken and YLD tokens.
     * @param tokenType Enum representing the sToken type (e.g., Learner, Scholar).
     * @return tokenId ID of the newly minted sToken.
     * @return shares Amount of YLD shares minted.
     */
    function _mintStakePair(
        address to,
        ISToken.TokenType tokenType
    ) internal returns (uint256 tokenId, uint256 shares) {
        ISToken.TokenAttributes memory attributes;
        attributes.tokenType = tokenType;

        StakingStorage storage $ = _getStakingStorage();

        uint256 assets = $.dEDUToken.balanceOf(address(this));
        _assertSufficientDEDU(assets);

        shares = $.yldToken.deposit(assets, to);
        tokenId = $.sToken.sTokenMint(to, shares, attributes);

        if ($.yldToken.totalSupply() != $.sToken.totalSupply()) {
            revert SupplyMismatch();
        }

        emit Staked(to, tokenId, assets, shares, tokenType);
    }

    /**
     * @dev Ensures that the contract holds a non-zero amount of dEDU.
     * Reverts with {InsufficientDEDU} if balance is zero.
     * @param amount The dEDU balance to check.
     */
    function _assertSufficientDEDU(uint256 amount) internal pure {
        if (amount == 0) {
            revert InsufficientDEDU();
        }
    }

    /**
     * @notice Unstakes a previously staked position by burning the user's sToken and redeeming their YLD shares.
     * @dev This function:
     *  - Burns the caller’s sToken and YLD tokens.
     *  - Computes the ETH-equivalent redemption value using the dEDU balance.
     *  - Distributes 30% of the yield to the user, and ploughs back 70% into the protocol.
     *  - Transfers both portions as dEDU (not raw ETH).
     *
     * Requirements:
     * - Caller must own the sToken position.
     * - `shares` must equal the user's YLD and sToken amounts for the given `tokenId`.
     * - Contract must hold sufficient dEDU.
     *
     * Yield Distribution:
     * - 70% of yield is retained by the protocol for redistribution (educators, funders, learners, protocol).
     * - 30% of yield is returned to the user along with principal.
     *
     * Emits a {Unstaked} event.
     *
     * @param tokenId The ERC-1155 token ID of the sToken being burned.
     * @param shares The amount of shares to redeem (both sToken and YLD).
     * @return amount Total dEDU redeemed (principal + yield before redistribution).
     */
    function unStake(
        uint256 tokenId,
        uint256 shares
    ) external returns (uint256 amount) {
        StakingStorage storage $ = _getStakingStorage();

        address owner = _msgSender();

        // Burn the sToken and YLD tokens
        $.sToken.sTokenBurn(owner, tokenId, shares);
        amount = $.yldToken.redeem(shares, address(this), owner);

        _assertSufficientDEDU(amount);

        // Transfer to user and protocol
        $.dEDUToken.transfer(owner, amount);

        // Emit unstake event
        emit Unstaked(owner, tokenId, shares, amount);
    }

    // -------------------------------------------------------------
    //                          MAINTENANCE
    // -------------------------------------------------------------

    /**
     * @notice Grants the YLD contract infinite allowance to transfer dEDU on behalf of this contract.
     * @dev Enables seamless deposit/redemption operations via the YLD token contract.
     */
    function grantAUMInfiniteAllowance() public {
        StakingStorage storage $ = _getStakingStorage();
        $.dEDUToken.approve(address($.yldToken), type(uint256).max);
    }

    /// @notice Accepts direct ETH transfers.
    receive() external payable {}

    // -------------------------------------------------------------
    //                       UPGRADE AUTHORIZATION
    // -------------------------------------------------------------

    /// @dev UUPS authorization function to control who can upgrade the contract.
    /// @param newImplementation Address of the new implementation contract.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
