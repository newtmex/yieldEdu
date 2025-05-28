// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "../tokens/ISToken.sol";
import "../tokens/IYLDToken.sol";
import "../external/IdEDU.sol";
import "../external/WEDU.sol";

/// @title Staking Contract
/// @notice Enables staking of native ETH, WEDU, or dEDU to mint sTokens and YLD tokens.
/// @dev Implements ERC-7201-compliant storage layout and UUPS upgradeable architecture.
contract Staking is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // -------------------------------------------------------------
    //                            ERRORS
    // -------------------------------------------------------------

    /// @dev Thrown when YLD and sToken total supply are not equal.
    error SupplyMismatch();

    /// @dev Thrown when the contract does not hold enough dEDU to mint corresponding tokens.
    error InsufficientDEDU();

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

    /// @dev Internal function that mints a pair of sToken and YLD tokens for a user.
    /// @param to Recipient of the minted tokens.
    /// @param tokenType The type of sToken to mint (e.g., Learner or Scholar).
    /// @return tokenId The ID of the newly minted sToken.
    /// @return shares The number of YLD shares minted.
    function _mintStakePair(
        address to,
        ISToken.TokenType tokenType
    ) internal returns (uint256 tokenId, uint256 shares) {
        ISToken.TokenAttributes memory attributes;
        attributes.tokenType = tokenType;

        StakingStorage storage $ = _getStakingStorage();

        uint256 assets = $.dEDUToken.balanceOf(address(this));
        if (assets == 0) {
            revert InsufficientDEDU();
        }

        shares = $.yldToken.deposit(assets, to);
        tokenId = $.sToken.sTokenMint(to, shares, attributes);

        if ($.yldToken.totalSupply() != $.sToken.totalSupply()) {
            revert SupplyMismatch();
        }
    }

    // -------------------------------------------------------------
    //                          MAINTENANCE
    // -------------------------------------------------------------

    /// @notice Grants the YLD token contract infinite approval to pull dEDU from this contract.
    /// @dev Required for the YLD token's deposit mechanism to function.
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
