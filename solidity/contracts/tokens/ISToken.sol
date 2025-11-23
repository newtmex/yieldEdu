// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISFT} from "../abstracts/ISFT.sol";
import {sTokenLib} from "./sTokenLib.sol";

/// @title ISToken
/// @notice Interface for YieldEDU's Semi-Fungible Token (sToken) contract.
/// @dev Extends the ERC-1155 standard to represent learner and scholar positions within the YieldEDU ecosystem.
///      Each sToken can hold on-chain attributes, including its type and binding status to specific content.
///      This interface defines the core functionality for minting, burning, and updating token bindings.
interface ISToken is ISFT {
    // -------------------------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------------------------

    /**
     * @notice Emitted when a token’s binding state changes.
     * @param user The address whose token binding was updated.
     * @param nonce The token ID (nonce) whose binding state changed.
     * @param bound A boolean indicating the new binding state (`true` if bound, `false` if unbound).
     * @param content The address of the content contract associated with the new binding.
     */
    event BindingUpdated(
        address indexed user,
        uint256 indexed nonce,
        bool bound,
        address content
    );

    // -------------------------------------------------------------------------
    // DATA STRUCTURES
    // -------------------------------------------------------------------------

    /**
     * @notice Enumerates the two categories of sTokens within the YieldEDU protocol.
     * @dev Each token type corresponds to a specific role in the learning or funding process.
     * @param Learner Represents access tokens used by learners to participate in courses.
     * @param Scholar Represents tokens allocated to fund scholarships or content creation.
     */
    enum TokenType {
        Learner,
        Scholar
    }

    /**
     * @notice Represents the metadata and on-chain attributes of an sToken.
     * @dev Includes the token’s category (`TokenType`) and its binding details to a content.
     * @param tokenType The classification of the token (`Learner` or `Scholar`).
     * @param binding The current binding information for the token (if any).
     * @param __gap Reserved storage space for future upgrades (maintains storage layout compatibility).
     */
    struct TokenAttributes {
        TokenType tokenType;
        Binding binding;
        uint256[47] __gap;
    }

    /**
     * @notice Contains the content binding data associated with an sToken.
     * @dev Used to record when a token becomes attached to a content and the expected completion timeline.
     * @param content The address of the content contract this token is bound to.
     * @param enrolledAt The timestamp when the binding (enrollment) was created.
     * @param completeAfter The expected completion timestamp of the content.
     */
    struct Binding {
        address content;
        uint256 enrolledAt;
        uint256 completeAfter;
    }

    // -------------------------------------------------------------------------
    // EXTERNAL FUNCTIONS
    // -------------------------------------------------------------------------

    /**
     * @notice Mints a new sToken to a specified address with the given attributes.
     * @dev Only callable by accounts holding the `MINTER_ROLE`.
     *      Each mint operation generates a unique `nonce` (token ID) representing a new position.
     * @param to The address that will receive the minted tokens.
     * @param amount The quantity of tokens to mint.
     * @param attributes The metadata structure defining the token type and initial binding state.
     * @return nonce The unique token ID assigned to the newly minted sToken.
     */
    function sTokenMint(
        address to,
        uint256 amount,
        TokenAttributes calldata attributes
    ) external returns (uint256 nonce);

    /**
     * @notice Burns a specified amount of an sToken from a given address.
     * @dev Can only be called by authorized entities (e.g., content or protocol contracts).
     *      Burning typically occurs when a learning position is closed or a scholarship cycle ends.
     * @param from The address from which the tokens will be burned.
     * @param nonce The token ID to burn.
     * @param amount The amount of tokens to burn.
     */
    function sTokenBurn(address from, uint256 nonce, uint256 amount) external;

    /**
     * @notice Updates the binding information for a user’s sToken.
     * @dev This function manages the token’s lifecycle between bound and unbound states.
     *      - When binding: links a token to a content contract.
     *      - When unbinding: detaches the token and triggers a return transfer if applicable.
     *      Only callable by entities with the `BINDING_UPDATE_ROLE`.
     * @param user The address that owns the token being updated.
     * @param nonce The token ID (nonce) whose binding will be updated.
     * @param binding The new binding data to assign (or empty struct to unbind).
     * @param data Additional data passed to hooks or content contracts during unbinding.
     */
    function updateBinding(
        address user,
        uint256 nonce,
        Binding memory binding,
        bytes memory data
    ) external;
}
