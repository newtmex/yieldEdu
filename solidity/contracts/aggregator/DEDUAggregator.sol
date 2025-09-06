// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenSwapCaller.sol";
import {IYLDToken} from "../tokens/IYLDToken.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title DEDUAggregator
 * @notice Claims rewards from the YLDToken, swaps them to dEDU, and sends them back to the YLDToken contract.
 * @dev Upgradeable via UUPS. Access controlled via AccessControl.
 */
contract DEDUAggregator is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    TokenSwapCaller
{
    /// @dev Role required to execute yield aggregation.
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    /// @custom:storage-location erc7201:yieldedu.deduaggregator.storage
    struct AggregatorStorage {
        address router;
        address yldToken;
    }

    bytes32 private constant AGGREGATOR_STORAGE_SLOT =
        keccak256("yieldedu.deduaggregator.storage");

    // Storage getter for ERC-7201 layout
    function _getAggregatorStorage()
        internal
        pure
        returns (AggregatorStorage storage $)
    {
        bytes32 slot = AGGREGATOR_STORAGE_SLOT;
        assembly {
            $.slot := slot
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the aggregator with router and YLDToken addresses.
     * @param _router Address of the DEX router (e.g., Uniswap, GainzSwap).
     * @param _yldToken Address of the YieldEDU YLDToken contract.
     * @param admin The address to receive DEFAULT_ADMIN_ROLE and EXECUTOR_ROLE.
     */
    function initialize(
        address _router,
        address _yldToken,
        address admin
    ) external initializer {
        require(_router != address(0), "Aggregator: invalid router");
        require(_yldToken != address(0), "Aggregator: invalid YLD token");
        require(admin != address(0), "Aggregator: invalid admin");

        __UUPSUpgradeable_init();
        __Ownable_init(admin);
        __AccessControl_init();

        AggregatorStorage storage $ = _getAggregatorStorage();
        $.router = _router;
        $.yldToken = _yldToken;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, admin);
    }

    /**
     * @notice Claims yield from YLDToken, swaps it to dEDU, and sends to YLDToken.
     * @param path The swap path [rewardToken, ..., dEDU].
     * @param amountOutMin Minimum acceptable output in dEDU.
     * @param deadline Unix timestamp after which the swap reverts.
     * @return yieldCollected The original yield amount claimed.
     * @return deduReceived The final amount of dEDU received.
     */
    function claimAndSwapToDEDU(
        address[] calldata path,
        uint256 amountOutMin,
        uint256 deadline
    )
        external
        onlyRole(EXECUTOR_ROLE)
        returns (uint256 yieldCollected, uint256 deduReceived)
    {
        AggregatorStorage storage $ = _getAggregatorStorage();
        require(path.length >= 2, "Aggregator: invalid swap path");

        address dedu = path[path.length - 1];
        address yieldReceiver = $.yldToken;

        yieldCollected = IYLDToken($.yldToken).collectYields(address(this));
        require(yieldCollected > 0, "Aggregator: no rewards collected");

        IERC20(path[0]).approve($.router, yieldCollected);

        uint256 balanceBefore = IERC20(dedu).balanceOf(yieldReceiver);

        {
            uint256[] memory amounts = _swapExactTokensForTokens(
                $.router,
                yieldCollected,
                amountOutMin,
                path,
                yieldReceiver,
                deadline
            );

            deduReceived = amounts[amounts.length - 1];
        }

        uint256 balanceAfter = IERC20(dedu).balanceOf(yieldReceiver);
        uint256 actualReceived = balanceAfter - balanceBefore;

        require(
            actualReceived >= deduReceived,
            "Aggregator: yield contract did not receive expected dEDU"
        );
    }

    /// @dev Authorizes UUPS upgrades. Restricted to owner.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
