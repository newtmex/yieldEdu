// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.28;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {IContent} from "../contents/IContent.sol";
import {ContentLib} from "../contents/ContentLib.sol";

abstract contract ContentFactory is Initializable {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @custom:storage-location erc7201:yieldedu.contentfactory.storage
    struct ContentFactoryStorage {
        EnumerableSet.AddressSet contents;
        address contentsBeacon; // set externally & stored in initializer
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

        // Deterministic symbol generation
        symbol = ContentLib.generateSymbol(title, creator);

        ContentFactoryStorage storage $ = _getContentFactoryStorage();

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
    }

    function getContentBySymbol(
        string memory symbol
    ) public view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(symbol));

        bytes memory creationCode = abi.encodePacked(
            type(BeaconProxy).creationCode,
            abi.encode(
                _getContentFactoryStorage().contentsBeacon,
                abi.encodeWithSelector(
                    IContent.initialize.selector,
                    symbol,
                    "", // irrelevant
                    "",
                    address(0),
                    address(0),
                    address(0)
                )
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(creationCode)
            )
        );

        address predicted = address(uint160(uint256(hash)));
        return isContent(predicted) ? predicted : address(0);
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
