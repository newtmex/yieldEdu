// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {GeneralFixture} from "../GeneralFixture.sol";
import {Content} from "../../contracts/contents/Content.sol";

import {YLDTokenFixture} from "../tokens/YLDTokenFixture.sol";
import {STokenFixture} from "../tokens/STokenFixture.sol";

contract ContentFixture is GeneralFixture, YLDTokenFixture, STokenFixture {
    Content public content;
    bytes notAllowedError = abi.encodeWithSignature("NotAllowed()");
    address public contentController = makeAddr("contentController");

    constructor() {
        // Deploy Content implementation
        Content implementation = new Content();

        string memory title = "Intro to DeFi";
        string
            memory description = "A foundational content on decentralized finance concepts.";
        uint256 contentId = uint256(keccak256(abi.encode(title, description)));

        // Encode initializer call
        bytes memory initData = abi.encodeWithSelector(
            Content.initialize.selector,
            contentId,
            title,
            description,
            address(yld),
            address(sToken),
            owner
        );

        // Deploy proxy
        vm.startPrank(contentController);
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        vm.stopPrank();

        // Cast to Content
        content = Content(address(proxy));

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

        vm.startPrank(to);
        sToken.safeTransferFrom(to, address(content), nonce, amount, "");
        sToken.setApprovalForAll(contentController, true);
        vm.stopPrank();

        vm.prank(contentController);
        sToken.safeTransferFrom(contentController, to, nonce, amount, "");
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
