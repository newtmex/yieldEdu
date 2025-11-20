// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IContent Interface
/// @notice Interface for the Content contract to expose external functions, events, and errors.
interface IContent {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error InvalidController();
    error InvalidBindAmount();
    error InsufficientValue();
    error SplitFailed();
    error NotScholarNorLearner();
    error NotAllowed();

    /*//////////////////////////////////////////////////////////////////////////
                                     EVENTS
    //////////////////////////////////////////////////////////////////////////*/

    event VerifierUpdated(
        address indexed oldVerifier,
        address indexed newVerifier
    );
    event CourseControllerUpdated(
        address indexed oldController,
        address indexed newController
    );
    event CourseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event MinBindAmountUpdated(
        uint256 oldMinBindAmount,
        uint256 newMinBindAmount
    );

    /*//////////////////////////////////////////////////////////////////////////
                                   VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function ADMIN_ROLE() external view returns (bytes32);

    function MIN_BIND() external pure returns (uint256);

    function BASIS_POINT() external pure returns (uint256);

    /// @notice Returns core content metadata
    /// @return name The content title
    /// @return symbol The content unique symbol
    /// @return description The content description
    /// @return sTokenId The ID of the associated sToken
    function getContentInfo()
        external
        view
        returns (
            string memory name,
            string memory symbol,
            string memory description,
            uint256 sTokenId
        );

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Add or remove verifier permissions
    /// @param verifier Address of the verifier
    function setVerifier(address verifier) external;

    /*//////////////////////////////////////////////////////////////////////////
                                 USER ACTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function enrollScholar(uint256 deadline, bytes calldata signature) external;

    /*//////////////////////////////////////////////////////////////////////////
                                   INITIALIZER
    //////////////////////////////////////////////////////////////////////////*/

    function initialize(
        string memory _title,
        string memory _description,
        string memory symbol,
        address _rewardToken,
        address _sToken,
        address _admin
    ) external;
}
