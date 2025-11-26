// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IUserModule
/// @notice Interface for the UserModule contract.
interface IUserModule {
    /// @title Referral System
    /// @notice Defines user and referral structures for the referral system.
    struct ReferralInfo {
        uint256 id; // Unique identifier for the referral
        address referralAddress; // Address of the referred user
    }

    struct User {
        uint256 id; // Unique identifier for the user
        address addr; // Address of the user
        uint256 referrerId; // ID of the referrer, if any
        uint256[] referrals; // List of referral IDs associated with the user
    }

    /// @notice Event emitted when a new user registers.
    event UserRegistered(
        uint256 indexed userId,
        address indexed userAddress,
        uint256 indexed referrerId
    );

    /// @notice Event emitted when a referral is added.
    event ReferralAdded(uint256 indexed referrerId, uint256 indexed referralId);

    /// @notice Gets the referrer ID and address of a given user.
    /// @param userAddress The address of the user.
    /// @return referrerId The ID of the referrer, or 0 if none.
    /// @return referrerAddress The address of the referrer, or address(0) if none.
    function getReferrer(
        address userAddress
    ) external view returns (uint256 referrerId, address referrerAddress);

    /// @notice Retrieves the list of referrals for a given user.
    /// @param userAddress The address of the user.
    /// @return referrals An array of `ReferralInfo` structs representing the user's referrals.
    function getReferrals(
        address userAddress
    ) external view returns (ReferralInfo[] memory);

    /// @notice Retrieves the user ID for a given address.
    /// @param userAddress The address of the user.
    /// @return The user ID.
    function getUserId(address userAddress) external view returns (uint256);

    /// @notice Retrieves the address of a user given their ID.
    /// @param id The user ID.
    /// @return The user's address.
    function userIdToAddress(uint256 id) external view returns (address);

    /// @notice Returns the total number of registered users.
    /// @return The total user count.
    function totalUsers() external view returns (uint256);
}
