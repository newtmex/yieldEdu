// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenSwapCaller.sol";
import {IYLDToken} from "../tokens/IYLDToken.sol";
import {ISToken} from "../tokens/ISToken.sol";
import {IStaking} from "../staking/IStaking.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC1155HolderUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";

import {sTokenLib} from "../tokens/sTokenLib.sol";

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
    TokenSwapCaller,
    ERC1155HolderUpgradeable
{
    using sTokenLib for bytes;

    /// @dev Role required to execute yield aggregation.
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    /// @custom:storage-location erc7201:yieldedu.deduaggregator.storage
    struct AggregatorStorage {
        address router;
        IYLDToken yldToken;
        ISToken sToken;
        IStaking staking;
        IERC4626 contentController;
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
        __ERC1155Holder_init();

        AggregatorStorage storage $ = _getAggregatorStorage();
        $.router = _router;
        $.yldToken = IYLDToken(_yldToken);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, admin);
    }

    /**
     * @notice Sets the sToken, ContentController, and Staking contract addresses.
     * @dev
     *  - Can only be called once.
     *  - Only callable by the contract owner.
     *  - Ensures none of the addresses are zero.
     *  - Locks configuration permanently after initialization.
     *
     * @param _sToken Address of the deployed ISToken contract.
     * @param _contentController Address of the ContentController (ERC4626 vault).
     * @param _staking Address of the Staking contract.
     */
    function configureCoreContracts(
        address _sToken,
        address _contentController,
        address _staking
    ) external onlyOwner {
        require(_sToken != address(0), "Aggregator: invalid sToken");
        require(
            _contentController != address(0),
            "Aggregator: invalid controller"
        );
        require(_staking != address(0), "Aggregator: invalid staking");

        AggregatorStorage storage $ = _getAggregatorStorage();

        // Ensure this function is only called once.
        require(
            address($.sToken) == address(0) &&
                address($.contentController) == address(0) &&
                address($.staking) == address(0),
            "Aggregator: already configured"
        );

        $.sToken = ISToken(_sToken);
        $.contentController = IERC4626(_contentController);
        $.staking = IStaking(_staking);
    }

    /**
     * @notice Collects protocol-wide YLD rewards, swaps them into dEDU, stakes a portion
     *         on behalf of the protocol, and routes YLD shares to the content controller
     *         for further distribution.
     *
     * @dev
     *  Workflow:
     *   1. Collect accumulated $Gainz yields from the YLDToken contract.
     *   2. Swap collected $Gainz → dEDU via the provided router swap path.
     *   3. Stake 70% of received dEDU into the Staking contract as a Scholar position.
     *   4. Transfer the resulting YLD shares to the ContentController (if active).
     *   5. Send remaining dEDU to the YLDToken contract as reserve “show-up” rewards.
     *
     *  Requirements:
     *   - Caller must have `EXECUTOR_ROLE`.
     *   - The swap path must contain at least two tokens ($Gainz → … → dEDU).
     *   - Non-zero yield must be available.
     *
     * @param swapPath    The token route the AMM router will follow to convert YLD → dEDU.
     * @param amountOutMin Minimum expected output amount for the YLD→dEDU swap (slippage control).
     * @param deadline     Deadline timestamp for swap execution.
     *
     * @return gainzCollected The total $Gainz rewards retrieved from the YLDToken.
     * @return deduReceived   The final amount of dEDU obtained after token swap.
     */
    function accumulateRewards(
        address[] calldata swapPath,
        uint256 amountOutMin,
        uint256 deadline
    )
        external
        onlyRole(EXECUTOR_ROLE)
        returns (uint256 gainzCollected, uint256 deduReceived)
    {
        AggregatorStorage storage $ = _getAggregatorStorage();

        // --- Validate swap path ---
        require(swapPath.length >= 2, "Aggregator: invalid swap path");

        // Identify final token in route → expected to be dEDU
        IERC20 dedu = IERC20(swapPath[swapPath.length - 1]);
        address receiver = address(this);

        IYLDToken yldToken = $.yldToken;

        // --- Step 1: Collect protocol-wide YLD yield ---
        gainzCollected = yldToken.collectYields(address(this));
        require(gainzCollected > 0, "Aggregator: no rewards collected");

        // Approve router to pull the YLD for swapping
        IERC20(swapPath[0]).approve($.router, gainzCollected);

        // --- Step 2: Swap YLD → dEDU ---
        {
            uint256[] memory amounts = _swapExactTokensForTokens(
                $.router,
                gainzCollected,
                amountOutMin,
                swapPath,
                receiver,
                deadline
            );

            deduReceived = amounts[amounts.length - 1];
        }

        // --- Step 3: Stake 70% of converted dEDU as Scholar ---
        IStaking staking = $.staking;
        uint256 stakeAmount = (7 * deduReceived) / 10;

        dedu.approve(address(staking), stakeAmount);
        // stakeDEDU returns: (sTokenId, yldShares)
        (, uint256 yldShares) = staking.stakeDEDU(
            ISToken.TokenType.Scholar,
            stakeAmount
        );

        // --- Step 4: If ContentController exists (active), fund it with YLD shares ---
        IERC4626 contentController = $.contentController;
        if (contentController.totalSupply() > 0) {
            yldToken.transfer(address(contentController), yldShares);
        }

        // --- Step 5: Any remaining dEDU is sent to YLDToken contract as reserve rewards ---
        uint256 remaining = dedu.balanceOf(address(this));
        if (remaining > 0) {
            dedu.transfer(address(yldToken), remaining);
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155HolderUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Called when the contract receives a single ERC1155 token.
     * @dev Only accepts tokens from the sToken contract.
     */
    function onERC1155Received(
        address /** operator */,
        address /** from */,
        uint256 /** tokenId */,
        uint256 /** value */,
        bytes memory /** data */
    ) public override onlySToken returns (bytes4) {
        ISToken sToken = _getAggregatorStorage().sToken;
        uint256[] memory nonces = sToken.getNonces(address(this));

        uint256 learnerNonce;
        uint256 scholarNonce;
        for (uint256 i = 0; i < nonces.length; i++) {
            uint256 nonce = nonces[i];
            ISToken.TokenType tokenType = sToken
                .getRawTokenAttributes(nonce)
                .decode()
                .tokenType;

            if (tokenType == ISToken.TokenType.Learner) {
                learnerNonce = _mergeNonce(sToken, learnerNonce, nonce);
            } else if (tokenType == ISToken.TokenType.Scholar) {
                scholarNonce = _mergeNonce(sToken, scholarNonce, nonce);
            } else {
                revert("UKNOWN TOKEN TYPE");
            }
        }

        return this.onERC1155Received.selector;
    }

    function _mergeNonce(
        ISToken sToken,
        uint256 prevNonce,
        uint256 nonce
    ) internal returns (uint256) {
        if (prevNonce == 0) {
            return nonce;
        } else {
            uint256[] memory ids = new uint256[](2);
            ids[0] = prevNonce;
            ids[1] = nonce;

            return sToken.mergeTransferFrom(address(this), address(this), ids);
        }
    }

    /**
     * @notice Batch transfers are not supported.
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public view override onlySToken returns (bytes4) {
        revert("BATCH_NOT_SUPPORTED");
    }

    /**
     * @dev Modifier placeholder for access control.
     * @notice Replace or import this from your AccessControl module if not already present.
     */
    modifier onlySToken() {
        require(
            msg.sender == address(_getAggregatorStorage().sToken),
            "UNAUTHORIZED_STOKEN"
        );
        _;
    }

    /// @dev Authorizes UUPS upgrades. Restricted to owner.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
