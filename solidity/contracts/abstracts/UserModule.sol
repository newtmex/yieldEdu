// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {IUserModule} from "./IUserModule.sol";

/// @title UserModule
/// @notice Contract for managing user registration and referral tracking.
abstract contract UserModule is IUserModule {
    /// @custom:storage-location erc7201:userModule.storage
    struct UserStorage {
        uint256 userCount; // Counter for user IDs
        mapping(address => User) users; // Mapping of user address to user data
        mapping(uint256 => address) userIdToAddress; // Mapping of user ID to address
    }
    // keccak256(abi.encode(uint256(keccak256("userModule.storage")) - 1)) & ~bytes32(uint256(0xff));
    bytes32 private constant USER_STORAGE_LOCATION =
        0x0038ec5cf8f0d1747ebb72ff0e651cf1b10ea4f74874fe0bde352ae49428c500;

    /// @notice Internal function to retrieve the storage struct.
    /// @return $ The storage struct containing user data.
    function _getUserStorage() private pure returns (UserStorage storage $) {
        assembly {
            $.slot := USER_STORAGE_LOCATION
        }
    }

    /*//////////////////////////////////////////////////////////////
                            USER MODULE LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Gets the referrer ID and address of a given user.
    /// @param userAddress The address of the user.
    /// @return referrerId The ID of the referrer, or 0 if none.
    /// @return referrerAddress The address of the referrer, or address(0) if none.
    function getReferrer(
        address userAddress
    ) public view returns (uint256 referrerId, address referrerAddress) {
        UserStorage storage $ = _getUserStorage();
        User storage user = $.users[userAddress];
        referrerId = user.referrerId;
        referrerAddress = $.userIdToAddress[referrerId];
    }

    /// @notice Retrieves the list of referrals for a given user.
    /// @param userAddress The address of the user.
    /// @return referrals An array of `ReferralInfo` structs representing the user's referrals.
    function getReferrals(
        address userAddress
    ) external view returns (ReferralInfo[] memory) {
        UserStorage storage $ = _getUserStorage();
        uint256[] storage referralIds = $.users[userAddress].referrals;
        uint256 length = referralIds.length;
        ReferralInfo[] memory referrals = new ReferralInfo[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 id = referralIds[i];
            referrals[i] = ReferralInfo(id, $.userIdToAddress[id]);
        }
        return referrals;
    }

    /// @notice Creates a new user or retrieves an existing user ID.
    /// @param userAddr The address of the user.
    /// @param referrerId The ID of the referrer.
    /// @return userId The unique ID assigned to the user.
    function _createOrGetUserId(
        address userAddr,
        uint256 referrerId
    ) internal returns (uint256 userId) {
        UserStorage storage $ = _getUserStorage();
        require(userAddr != address(0), "UserModule: Invalid user address");

        User storage user = $.users[userAddr];
        userId = user.id;

        if (userId != 0) return userId; // existing user

        // New user
        userId = ++$.userCount;
        user.id = userId;
        user.addr = userAddr;

        bool isRefAdded = false;
        if ($.userIdToAddress[referrerId] != address(0)) {
            user.referrerId = referrerId;
            $.users[$.userIdToAddress[referrerId]].referrals.push(userId);
            isRefAdded = true;

            emit ReferralAdded(referrerId, userId);
        }

        $.userIdToAddress[userId] = userAddr;
        emit UserRegistered(userId, userAddr, isRefAdded ? referrerId : 0);
    }

    /// @notice Retrieves the user ID for a given address.
    function getUserId(address userAddress) public view returns (uint256) {
        return _getUserStorage().users[userAddress].id;
    }

    /// @notice Retrieves the address of a user given their ID.
    function userIdToAddress(uint256 id) public view returns (address) {
        return _getUserStorage().userIdToAddress[id];
    }

    /// @notice Returns the total number of registered users.
    function totalUsers() external view returns (uint256) {
        return _getUserStorage().userCount;
    }
}
