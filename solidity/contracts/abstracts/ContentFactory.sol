// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.28;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IContent} from "../contents/IContent.sol";
import {ContentLib} from "../contents/ContentLib.sol";

abstract contract ContentFactory is Initializable {
    using EnumerableSet for EnumerableSet.AddressSet;

    error ContentAlreadyExists();

    /// @custom:storage-location erc7201:yieldedu.contentfactory.storage
    struct ContentFactoryStorage {
        EnumerableSet.AddressSet contents;
        address contentsBeacon; // set externally & stored in initializer
        mapping(string => address) contentBySymbol;
    }

    bytes32 private constant CONTENT_FACTORY_STORAGE_SLOT =
        keccak256("yieldedu.contentfactory.storage");

    function _getContentFactoryStorage()
        internal
        pure
        returns (ContentFactoryStorage storage $)
    {
        bytes32 slot = CONTENT_FACTORY_STORAGE_SLOT;
        assembly {
            $.slot := slot
        }
    }

    // ---------------------------------------------------------
    //                  INITIALIZERS (UPGRADEABLE)
    // ---------------------------------------------------------

    function __ContentFactory_init(
        address contentsBeacon_
    ) internal onlyInitializing {
        __ContentFactory_init_unchained(contentsBeacon_);
    }

    function __ContentFactory_init_unchained(
        address contentsBeacon_
    ) internal onlyInitializing {
        require(contentsBeacon_ != address(0), "InvalidBeacon");
        _getContentFactoryStorage().contentsBeacon = contentsBeacon_;
    }

    // ---------------------------------------------------------
    //                  INTERNAL CREATE FUNCTION
    // ---------------------------------------------------------

    function _createContent(
        address creator,
        string memory title,
        string memory description,
        address rewardToken,
        address sToken,
        address admin
    ) internal returns (address content, string memory symbol) {
        if (
            creator == address(0) ||
            rewardToken == address(0) ||
            sToken == address(0) ||
            admin == address(0)
        ) {
            revert("ZeroAddress");
        }
        ContentFactoryStorage storage $ = _getContentFactoryStorage();

        // Deterministic symbol generation
        symbol = ContentLib.generateSymbol(title, creator);
        if ($.contentBySymbol[symbol] != address(0))
            revert ContentAlreadyExists();

        bytes32 salt = keccak256(abi.encodePacked(symbol));

        content = address(
            new BeaconProxy{salt: salt}(
                $.contentsBeacon,
                abi.encodeWithSelector(
                    IContent.initialize.selector,
                    title,
                    description,
                    symbol,
                    rewardToken,
                    sToken,
                    admin
                )
            )
        );

        // Transfer ownership
        Address.functionCall(
            content,
            abi.encodeWithSignature("transferOwnership(address)", creator)
        );

        $.contents.add(content);
        $.contentBySymbol[symbol] = content;
    }

    function ackSymbol(address content) public {
        ContentFactoryStorage storage $ = _getContentFactoryStorage();
        if ($.contents.contains(content)) {
            string memory symbol = ERC20(content).symbol();
            if ($.contentBySymbol[symbol] == address(0)) {
                $.contentBySymbol[symbol] = content;
            }
        }
    }

    function getContentBySymbol(
        string memory symbol
    ) public view returns (address) {
        return _getContentFactoryStorage().contentBySymbol[symbol];
    }

    // ---------------------------------------------------------
    //                     VIEW FUNCTIONS
    // ---------------------------------------------------------

    function contents() external view returns (address[] memory) {
        return _getContentFactoryStorage().contents.values();
    }

    function totalContents() public view returns (uint256) {
        return _getContentFactoryStorage().contents.length();
    }

    function isContent(address content) public view returns (bool) {
        return _getContentFactoryStorage().contents.contains(content);
    }

    function contentsBeacon() public view returns (address) {
        return _getContentFactoryStorage().contentsBeacon;
    }
}
