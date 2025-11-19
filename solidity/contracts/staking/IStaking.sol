// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../tokens/ISToken.sol";

/**
 * @title IStaking
 * @notice Interface for the YieldEDU Staking contract.
 *
 * @dev
 * Includes core events and errors for staking, unstaking,
 * and token minting logic. Any contract implementing this
 * interface must follow the same event signatures and revert
 * patterns.
 */
interface IStaking {
    // -------------------------------------------------------------
    //                           ERRORS
    // -------------------------------------------------------------

    /// @notice Thrown when the sToken supply and YLD token supply diverge.
    error SupplyMismatch();

    /// @notice Thrown when attempting to mint stake shares without holding dEDU.
    error InsufficientDEDU();

    // -------------------------------------------------------------
    //                           EVENTS
    // -------------------------------------------------------------

    /**
     * @notice Emitted when a user completes a stake using ETH, WEDU, or dEDU.
     *
     * @param user       The address that performed the stake.
     * @param tokenId    The ID of the minted sToken representing the position.
     * @param amount     The amount of asset staked (in dEDU equivalent).
     * @param shares     The amount of YLD shares minted to the user.
     * @param tokenType  The type of sToken minted (Learner or Scholar).
     */
    event Staked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 shares,
        ISToken.TokenType tokenType
    );

    /**
     * @notice Emitted when a user unstakes their position and redeems YLD shares.
     *
     * @param user             The address receiving the redeemed amount.
     * @param tokenId          The ID of the sToken burned.
     * @param shares           The number of shares redeemed.
     * @param withdrawnAmount  The redeemed dEDU amount transferred out.
     */
    event Unstaked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 shares,
        uint256 withdrawnAmount
    );

    // -------------------------------------------------------------
    //                   EXTERNAL FUNCTION HEADERS
    // -------------------------------------------------------------

    function stakeEDU(
        ISToken.TokenType tokenType
    ) external payable returns (uint256 tokenId, uint256 shares);

    function stakeWEDU(
        ISToken.TokenType tokenType,
        uint256 amount
    ) external returns (uint256 tokenId, uint256 shares);

    function stakeDEDU(
        ISToken.TokenType tokenType,
        uint256 amount
    ) external returns (uint256 tokenId, uint256 shares);

    function unStake(
        uint256 tokenId,
        uint256 shares
    ) external returns (uint256 amount);

    function grantAUMInfiniteAllowance() external;
}
