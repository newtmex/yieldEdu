// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IdEDU
 * @dev Interface for the dEDU token – a yield-bearing ERC-20 asset that represents staked ETH within GainzSwap, used within the YieldEDU protocol for yields.
 *
 * dEDU is minted by the GainzSwap staking engine and serves as the underlying asset through which YieldEDU generates sustainable, on-chain yield to fund education.
 * It abstracts liquid staking mechanics while enabling composability with the YieldEDU protocol’s dual-token model (sToken + YLD).
 *
 * Overview of its role in YieldEDU:
 * - Learners and backers enter the system by staking ETH (or existing dEDU) into the YieldEDU protocol.
 * - YieldEDU routes ETH deposits to GainzSwap’s strategy (e.g. LSTs, restaking, or DeFi strategies).
 * - GainzSwap mints and returns dEDU via `receiveFor`, held by the protocol to represent staked positions.
 * - In exchange, users receive:
 *   - `sToken`: A course-gating, semi-fungible position token (ERC-1155).
 *   - `YLD`: A fungible ERC-20 token representing claimable yield rights.
 * - dEDU accrues staking rewards while held by the protocol.
 * - Upon user exit or protocol-triggered burn of sToken and matching YLD:
 *   - The dEDU is burned, reducing the protocol’s staked position.
 *   - The underlying ETH + yield is redeemed.
 *   - Yield portion is extracted and redistributed as ETH rewards to:
 *     - Learners (on milestone completion),
 *     - Educators (based on course performance),
 *     - Funders (passive yield share).
 *     - YieldEDU Protocol (for protocol sustainability).
 *
 * This interface is intentionally minimal. YieldEDU does not manage dEDU issuance directly but integrates with this interface to stake ETH and track exposure.
 *
 * @notice Extends IERC20 with a single entry-point method for ETH deposits.
 */
interface IdEDU is IERC20 {
    /**
     * @notice Stakes ETH on behalf of a specified user and credits them with dEDU.
     * @dev ETH sent with this call is staked via GainzSwap’s internal mechanism. An equivalent amount of dEDU is minted to the `owner`.
     *
     * Used by YieldEDU to stake learner/sponsor deposits. The resulting dEDU is retained by the protocol contract as a yield-bearing position.
     *
     * Requirements:
     * - Caller must send a non-zero amount of ETH.
     * - `owner` must be a valid, non-zero address.
     *
     * @param owner The beneficiary address that receives the dEDU tokens, in this case must be the YieldEDU protocol.
     */
    function receiveFor(address owner) external payable;
}
