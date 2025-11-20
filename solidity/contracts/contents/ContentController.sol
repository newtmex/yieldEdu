// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import {STokenHandler} from "../abstracts/STokenHandler.sol";
import {ContentFactory} from "../abstracts/ContentFactory.sol";
// import {UserModule} from "../abstracts/UserModule.sol";
import {ISToken} from "../tokens/ISToken.sol";
import {Content} from "./Content.sol";

contract ContentController is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ContentFactory,
    // UserModule,
    STokenHandler,
    ERC4626Upgradeable
{
    /// @custom:storage-location erc7201:yieldedu.contentcontroller.storage
    struct ControllerStorage {
        address feeCollector;
        uint256 deployFee;
    }

    bytes32 private constant CONTROLLER_STORAGE_SLOT =
        keccak256("yieldedu.contentcontroller.storage");

    function _getControllerStorage()
        internal
        pure
        returns (ControllerStorage storage $)
    {
        bytes32 slot = CONTROLLER_STORAGE_SLOT;
        assembly {
            $.slot := slot
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner,
        address sToken_,
        IERC20 asset_,
        address feeCollector_
    ) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(owner);
        __sTokenHandler_init(ISToken(sToken_));
        __ERC4626_init(asset_);

        // ---------------------------------------------------------
        // Create and initialize the Content Beacon
        // ---------------------------------------------------------
        address proxyAdmin = msg.sender;
        address contentImpl = address(new Content());
        UpgradeableBeacon beacon = new UpgradeableBeacon(
            contentImpl,
            proxyAdmin
        );

        // Pass beacon address into ContentFactory initializer
        __ContentFactory_init(address(beacon));

        // ---------------------------------------------------------
        // Store controller-specific settings
        // ---------------------------------------------------------
        ControllerStorage storage $ = _getControllerStorage();
        $.feeCollector = feeCollector_;
        $.deployFee = 10 ether;
    }

    // -------------------------------------------------------------
    //                CONTENT DEPLOYMENT
    // -------------------------------------------------------------
    function deployContent(
        string memory title,
        string memory description
    ) external returns (address content, string memory symbol) {
        ControllerStorage storage $ = _getControllerStorage();

        // Charge deploy fee
        IERC20(asset()).transferFrom(msg.sender, $.feeCollector, $.deployFee);

        return
            _createContent(
                msg.sender,
                title,
                description,
                asset(),
                address(sToken()),
                owner()
            );
    }

    // -------------------------------------------------------------
    //                      OWNER SETTERS
    // -------------------------------------------------------------
    function setDeployFee(uint256 newFee) external onlyOwner {
        ControllerStorage storage $ = _getControllerStorage();
        $.deployFee = newFee;
    }

    function deployFee() public view returns (uint256) {
        return _getControllerStorage().deployFee;
    }

    // -------------------------------------------------------------
    //                ERC1155 Receiver Hook
    // -------------------------------------------------------------
    function _onERC1155Received(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal override returns (bytes4) {}

    // -------------------------------------------------------------
    //                UUPS Authorization
    // -------------------------------------------------------------
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
