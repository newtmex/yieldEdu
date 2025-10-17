// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ContentFixture, MockERC20} from "./ContentFixture.sol";
import {Content} from "../../contracts/contents/Content.sol";

contract ContentTest is ContentFixture {
    address verifier = makeAddr("verifier");
    address randomUser = makeAddr("randomUser");

    function setUp() public {
        // The ContentFixture constructor already deployed Content + MockYLD
        vm.label(address(content), "Content");
        vm.label(address(mockYLD), "MockYLD");
    }

    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testInitializeSetsCorrectValues() public view {
        (
            uint256 id,
            string memory title,
            string memory description,
            address token
        ) = content.getContentInfo();

        string memory expectedTitle = "Intro to DeFi";
        string
            memory expectedDesc = "A foundational course on decentralized finance concepts.";

        // Verify metadata
        assertEq(
            id,
            uint256(keccak256(abi.encode(expectedTitle, expectedDesc)))
        );
        assertEq(title, expectedTitle);
        assertEq(description, expectedDesc);
        assertEq(token, address(mockYLD));
    }

    function testAdminHasRolesAfterInitialization() public view {
        // owner comes from GeneralFixture
        assertTrue(content.hasRole(content.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(content.hasRole(content.ADMIN_ROLE(), owner));
    }

    /*//////////////////////////////////////////////////////////////
                            VERIFIER MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function testAdminCanAddVerifier() public {
        vm.startPrank(owner);

        vm.expectEmit(true, true, true, true);
        emit Content.VerifierUpdated(verifier, true);

        content.setVerifier(verifier, true);

        vm.stopPrank();

        assertTrue(content.hasRole(content.VERIFIER_ROLE(), verifier));
    }

    function testAdminCanRemoveVerifier() public {
        vm.startPrank(owner);
        content.setVerifier(verifier, true);
        vm.stopPrank();

        assertTrue(content.hasRole(content.VERIFIER_ROLE(), verifier));

        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit Content.VerifierUpdated(verifier, false);
        content.setVerifier(verifier, false);
        vm.stopPrank();

        assertFalse(content.hasRole(content.VERIFIER_ROLE(), verifier));
    }

    function testNonAdminCannotSetVerifier() public {
        vm.startPrank(randomUser);

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                randomUser,
                content.ADMIN_ROLE()
            )
        );

        content.setVerifier(verifier, true);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    function testGetContentInfoReturnsExpectedValues() public view {
        (
            uint256 id,
            string memory title,
            string memory description,
            address token
        ) = content.getContentInfo();

        assertEq(id, uint256(keccak256(abi.encode(title, description))));
        assertEq(token, address(mockYLD));
    }
}
