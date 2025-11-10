// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IContent Interface
/// @notice Interface for the Content contract to expose external functions, events, and errors.
interface IContent {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event CourseControllerUpdated(
        address indexed oldController,
        address indexed newController
    );
    event CourseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event MinBindAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event StudentEnrolled(
        address indexed student,
        uint256 indexed originalTokenId,
        uint256 boundTokenId,
        uint256 boundAmount,
        address contentController,
        uint256 courseDuration,
        uint256 refundAmount
    );
    event BindingCreated(
        uint256 indexed boundTokenId,
        uint256 amount,
        address contentController,
        uint256 courseDuration
    );
    event VerifierUpdated(
        address indexed oldVerifier,
        address indexed newVerifier
    );

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error InvalidController();
    error InvalidBindAmount();
    error InsufficientValue();
    error SplitFailed();
    error NotScholarNorLearner();
    error NotAllowed();

    /*//////////////////////////////////////////////////////////////
                                 FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Add or remove verifier permissions
    /// @param verifier Address of the verifier
    function setVerifier(address verifier) external;

    /// @notice Returns core content metadata
    /// @return contentId The content ID
    /// @return name The content title
    /// @return description The content description
    /// @return sTokenId The ID of the associated sToken
    function getContentInfo()
        external
        view
        returns (
            uint256 contentId,
            string memory name,
            string memory description,
            uint256 sTokenId
        );
}
