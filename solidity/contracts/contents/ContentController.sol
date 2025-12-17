// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {STokenHandler} from "../abstracts/STokenHandler.sol";
import {ContentFactory} from "../abstracts/ContentFactory.sol";
import {UserModule} from "../abstracts/UserModule.sol";
import {ISToken} from "../tokens/ISToken.sol";
import {sTokenLib} from "../tokens/sTokenLib.sol";

contract ContentController is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ContentFactory,
    UserModule,
    STokenHandler,
    ERC4626Upgradeable
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using sTokenLib for bytes;

    /// @custom:storage-location erc7201:yieldedu.contentcontroller.storage
    struct ControllerStorage {
        address feeCollector;
        uint256 deployFee;
        mapping(address => EnumerableSet.AddressSet) contentStudents;
    }

    bytes32 private constant CONTROLLER_STORAGE_SLOT =
        keccak256("yieldedu.contentcontroller.storage");

    function _getControllerStorage()
        internal
        pure
        returns (ControllerStorage storage $)
    {
        bytes32 slot = CONTROLLER_STORAGE_SLOT;
        assembly {
            $.slot := slot
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner,
        address sToken_,
        IERC20 yldToken_,
        address feeCollector_,
        address contentBeacon_
    ) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(owner);

        __ContentFactory_init(contentBeacon_);
        __sTokenHandler_init(ISToken(sToken_));

        __ERC20_init("ContentContoller", "ctYLD");
        __ERC4626_init(yldToken_);

        // ---------------------------------------------------------
        // Store controller-specific settings
        // ---------------------------------------------------------
        ControllerStorage storage $ = _getControllerStorage();
        $.feeCollector = feeCollector_;
        $.deployFee = 10 ether;
    }

    // -------------------------------------------------------------
    //                CONTENT DEPLOYMENT
    // -------------------------------------------------------------
    function deployContent(
        string memory title,
        string memory description
    ) external returns (address content, string memory symbol) {
        ControllerStorage storage $ = _getControllerStorage();

        // Charge deploy fee
        IERC20(asset()).transferFrom(msg.sender, $.feeCollector, $.deployFee);

        return
            _createContent(
                msg.sender,
                title,
                description,
                asset(),
                address(sToken()),
                owner()
            );
    }

    // -------------------------------------------------------------
    //                      OWNER SETTERS
    // -------------------------------------------------------------
    function setDeployFee(uint256 newFee) external onlyOwner {
        ControllerStorage storage $ = _getControllerStorage();
        $.deployFee = newFee;
    }

    function deployFee() public view returns (uint256) {
        return _getControllerStorage().deployFee;
    }

    function feeCollector() public view returns (address) {
        return _getControllerStorage().feeCollector;
    }

    // -------------------------------------------------------------
    //                ERC1155 Receiver Hook
    // -------------------------------------------------------------
    function _onERC1155Received(
        address operator,
        address from,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal override returns (bytes4) {
        if (isContent(operator)) {
            __HandleContentEnrollment__(operator, tokenId, value, data);
        } else {
            __HandleUnbinding__(from, tokenId, value, data);
        }

        return this.onERC1155Received.selector;
    }

    function __HandleContentEnrollment__(
        address content,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal {
        ControllerStorage storage $ = _getControllerStorage();
        ISToken sToken_ = sToken();

        EnrollmentData memory enrollmentData = abi.decode(
            data,
            (EnrollmentData)
        );

        address student = enrollmentData.student;

        EnumerableSet.AddressSet storage stds = $.contentStudents[content];
        require(
            !stds.contains(student),
            "ContentController: Student already enrolled at content"
        );

        stds.add(student);

        // Create user ID if needed
        if (getUserId(student) == 0) {
            _createOrGetUserId(student, enrollmentData.referrerId);
        }

        // Create binding
        ISToken.Binding memory binding = ISToken.Binding({
            content: content,
            enrolledAt: block.timestamp,
            completeAfter: block.timestamp + enrollmentData.courseDuration
        });

        sToken_.updateBinding(address(this), student, tokenId, binding, data);

        // Mint shares to content contract
        _mint(content, value);
    }

    function __HandleUnbinding__(
        address student,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) internal {
        ControllerStorage storage $ = _getControllerStorage();
        ISToken sToken_ = sToken();

        // Load existing binding
        ISToken.Binding memory binding = sToken_
            .getRawTokenAttributes(tokenId)
            .decode()
            .binding;

        // Compute redeem amounts
        uint256 totalShares = maxRedeem(binding.content);
        uint256 assets = previewRedeem(totalShares);

        // Burn all shares at content
        _burn(binding.content, totalShares);

        // Send assets to content
        SafeERC20.safeTransfer(IERC20(asset()), binding.content, assets);

        emit Withdraw(
            student,
            binding.content,
            binding.content,
            assets,
            totalShares
        );

        // Decode unbind data
        ControllerUnbindData memory unbindData = abi.decode(
            data,
            (ControllerUnbindData)
        );

        (, address referrer) = getReferrer(student);

        // Update binding to empty & pass completion payload
        ISToken.Binding memory emptyBinding;
        bytes memory completionData = abi.encode(
            ContentCompleteData({
                signature: unbindData.signature,
                deadline: unbindData.deadline,
                assessmentPoints: unbindData.assessmentPoints,
                enrolledAt: binding.enrolledAt,
                completeAfter: binding.completeAfter,
                feeCollector: $.feeCollector,
                learner: student,
                referrer: referrer
            })
        );
        sToken_.updateBinding(
            address(this),
            student,
            tokenId,
            emptyBinding,
            completionData
        );

        // Mint protocol fee shares (difference)
        _mint(binding.content, totalShares - value);
    }

    modifier notAllowed() {
        if (msg.sender != address(this)) revert("NotAllowed");
        _;
    }

    function _deposit(
        address,
        address,
        uint256,
        uint256
    ) internal override notAllowed {}

    /**
     * @dev Withdraw/redeem common workflow.
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override notAllowed {}

    // -------------------------------------------------------------
    //                UUPS Authorization
    // -------------------------------------------------------------
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
