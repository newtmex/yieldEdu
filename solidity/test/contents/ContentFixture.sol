// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Content} from "../../contracts/contents/Content.sol";
import {ContentLib} from "../../contracts/contents/ContentLib.sol";

import {ContentControllerFixture} from "./ContentControllerFixture.sol";

contract ContentFixture is ContentControllerFixture {
    Content public content;
    bytes notAllowedError = abi.encodeWithSignature("NotAllowed()");

    constructor() {
        uint256 deployFee = contentController.deployFee();
        string memory title = "Intro to DeFi";
        string
            memory description = "A foundational content on decentralized finance concepts.";

        _mintYLDToken(owner, deployFee);

        vm.startPrank(owner);
        yld.approve(address(contentController), deployFee);
        (address proxy, ) = contentController.deployContent(title, description);
        vm.stopPrank();

        content = Content(proxy);

        // Grant MINTER_ROLE to this contract
        yld.grantRole(yld.MINTER_ROLE(), address(this));
        sToken.grantRole(sToken.MINTER_ROLE(), address(this));
    }

    function _assertContentSTokenID(uint256 id) internal view {
        (, , , uint256 sTokenId) = content.getContentInfo();

        assertEq(id, sTokenId, "Expected sTokenId does not match");
    }

    function _assertUnauthorizedMintAndDeposit(
        address investor,
        uint256 shares,
        uint256 yield
    ) internal {
        vm.startPrank(investor);
        vm.expectRevert(notAllowedError);
        content.mint(shares, investor);

        vm.expectRevert(notAllowedError);
        content.deposit(yield, investor);
        vm.stopPrank();
    }

    function _simulateAuthorizedSTokenTransfer(
        address investor,
        uint256 tokenId,
        uint256 shares
    ) internal {
        vm.startPrank(investor);
        sToken.safeTransferFrom(
            investor,
            address(content),
            tokenId,
            shares,
            ""
        );
        vm.stopPrank();
    }

    function _assertPostMintVaultState(
        address investor,
        uint256 shares
    ) internal view {
        (, , , uint256 sTokenId) = content.getContentInfo();

        assertEq(
            content.balanceOf(investor),
            shares,
            "Expected Content shares minted for scholar"
        );

        assertGe(
            content.totalSupply(),
            sToken.balanceOf(address(content), sTokenId),
            "Vault should be balanced after mint"
        );
    }

    function _mintAndEnrollLearner(
        address to,
        uint256 amount
    ) internal returns (uint256 nonce) {
        nonce = _mintLearnerToken(to, amount);
        address controller = address(contentController);

        vm.startPrank(to);
        sToken.safeTransferFrom(to, address(content), nonce, amount, "");
        sToken.setApprovalForAll(controller, true);
        vm.stopPrank();

        vm.prank(controller);
        sToken.safeTransferFrom(controller, to, nonce, amount, "");
    }

    function _simulateYieldWithdraw(
        address investor,
        uint256 yield,
        uint256 shares
    ) internal {
        // Simulate yield accumulation
        _mintYLDToken(address(content), yield);

        vm.startPrank(investor);
        content.withdraw(yield, investor, investor);

        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(
                    keccak256(
                        "ERC4626ExceededMaxRedeem(address,uint256,uint256)"
                    )
                ),
                investor,
                shares,
                content.totalAssets()
            )
        );
        content.redeem(shares, investor, investor);
        vm.stopPrank();
    }
}
