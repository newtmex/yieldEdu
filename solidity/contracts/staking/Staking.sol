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
/// @notice Enables staking of native ETH or dEDU ERC-20 to mint sTokens and YLD tokens.
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

    /**
     * @dev Constructor that disables initializers to prevent the implementation contract from being initialized.
     * This is a security measure to ensure that the implementation contract cannot be misused.
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the staking contract with the provided token addresses and owner.
    /// @param _dedu Address of the dEDU ERC-20 token.
    /// @param _sToken Address of the sToken contract (ERC-1155).
    /// @param _yld Address of the YLD ERC-20 reward token.
    /// @param owner Address that will be granted ownership rights.
    function initialize(
        address _wedu,
        address _dedu,
        address _sToken,
        address _yld,
        address owner
    ) public initializer {
        __Ownable_init(owner);
        __UUPSUpgradeable_init();

        StakingStorage storage $ = _getStakingStorage();
        $.wedu = WEDU(payable(_wedu));
        $.dEDUToken = IdEDU(_dedu);
        $.sToken = ISToken(_sToken);
        $.yldToken = IYLDToken(_yld);
    }

    // -------------------------------------------------------------
    //                          STAKE LOGIC
    // -------------------------------------------------------------

    /// @notice Stake native ETH which is wrapped into dEDU via `receiveFor`.
    /// @param tokenType The type of sToken to mint (e.g., Learner or Scholar).
    function stakeEDU(ISToken.TokenType tokenType) external payable {
        StakingStorage storage $ = _getStakingStorage();

        $.dEDUToken.receiveFor{value: msg.value}(address(this));

        _mintStakePair(_msgSender(), tokenType);
    }

    /// @notice Stake existing dEDU ERC-20 tokens.
    /// @param tokenType The type of sToken to mint.
    /// @param amount The amount of dEDU to transfer and stake.
    function stakeWEDU(ISToken.TokenType tokenType, uint256 amount) external {
        StakingStorage storage $ = _getStakingStorage();
        address from = _msgSender();

        // Transfer WEDU from sender to this contract
        $.wedu.transferFrom(from, address(this), amount);

        // Convert WEDU to ETH (withdraw) and deposit to dEDU
        $.wedu.withdraw(amount);
        $.dEDUToken.receiveFor{value: amount}(address(this));

        _mintStakePair(from, tokenType);
    }

    /// @notice Stake existing WEDU ERC-20 tokens.
    /// @param tokenType The type of sToken to mint.
    /// @param amount The amount of WEDU to transfer and stake.
    function stakeDEDU(ISToken.TokenType tokenType, uint256 amount) external {
        StakingStorage storage $ = _getStakingStorage();

        address from = _msgSender();
        $.dEDUToken.transferFrom(from, address(this), amount);

        _mintStakePair(from, tokenType);
    }

    /// @dev Internal function that mints a pair of sToken and YLD tokens for a user.
    /// @param to Recipient of the minted tokens.
    /// @param tokenType The type of sToken to mint (e.g., Learner or Scholar).
    /// @return tokenId The ID of the newly minted sToken.
    function _mintStakePair(
        address to,
        ISToken.TokenType tokenType
    ) internal returns (uint256 tokenId) {
        ISToken.TokenAttributes memory attributes;
        attributes.tokenType = tokenType;

        StakingStorage storage $ = _getStakingStorage();

        uint256 dEDUBalance = $.dEDUToken.balanceOf(address(this));
        uint256 yldSupply = $.yldToken.totalSupply();
        uint256 sTokenSupply = $.sToken.totalSupply();

        if (yldSupply != sTokenSupply) {
            revert SupplyMismatch();
        }

        if (dEDUBalance <= yldSupply) {
            revert InsufficientDEDU();
        }

        // Calculate the amount of tokens to mint based on excess dEDU.
        uint256 amount = dEDUBalance - yldSupply;

        tokenId = $.sToken.sTokenMint(to, amount, attributes);
        $.yldToken.mint(to, amount);
    }

    // -------------------------------------------------------------
    //                          UPGRADE LOGIC
    // -------------------------------------------------------------

    /// @dev UUPS authorization function.
    /// @param newImplementation Address of the new implementation contract.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    receive() external payable {
        // Accept ETH deposits directly
    }
}
