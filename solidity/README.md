## 📘 YieldEDU Smart Contracts – Integration Guide for Front-End Developers

This guide walks you through deploying and integrating the YieldEDU staking protocol in a production frontend environment. It covers core contract deployment, staking/unstaking flows, and contract roles.

run

```ts
 npx hardhat node //in another terminal
 npx hardhat run scripts/deploy.ts --network localhost  //to generate abis and addresses remember to have ponder running

```

---

### 🧱 Contracts Overview

| Contract   | Purpose                                                                    |
| ---------- | -------------------------------------------------------------------------- |
| `Staking`  | Main gateway for staking ETH, WEDU, or dEDU to earn yield and mint sTokens |
| `YLDToken` | Yield-bearing ERC-20 token, minted on stake, burned on un-stake            |
| `sToken`   | ERC-1155 semi-fungible tokens representing course-bound staking access     |
| `WEDU`     | Wrapped ETH implementation used as staking input                           |
| `MockDEDU` | Mock dEDU yield-bearing token (replace with GainzSwap’s in production)     |

---

### 🛠️ Deployment

Ensure you have **Hardhat**, **ethers**, and **@openzeppelin/hardhat-upgrades** installed.

#### 1. Deploy `YLDToken` and `MockDEDU`

```ts
const { yldToken, mockAsset: dEDUToken } = await deployYLDToken();
```

#### 2. Deploy `sToken`

```ts
const { sToken } = await deploySToken();
```

#### 3. Deploy `WEDU` and `Staking` with constructor dependencies

```ts
const { staking, wedu } = await deployStakingContract({
	yldAddress: yldToken.getAddress(),
	sTokenAddress: sToken.getAddress(),
});
```

#### 4. Grant Roles to Staking Contract

```ts
await yldToken.grantRole(await yldToken.MINTER_ROLE(), staking.getAddress());
await sToken.grantRole(await sToken.MINTER_ROLE(), staking.getAddress());
```

---

### 🧾 Staking APIs

#### stakeEDU

```ts
await staking.connect(user).stakeEDU(courseId, { value: amount });
```

- Stakes native ETH
- Mints `YLD` (ERC-20) and `sToken` (ERC-1155)

#### stakeWEDU

```ts
await wedu.connect(user).deposit({ value: amount });
await wedu.connect(user).approve(staking, amount);
await staking.connect(user).stakeWEDU(courseId, amount);
```

- Stakes `WEDU` tokens

#### stakeDEDU

```ts
await dEDUToken.connect(user).mint(user.address, amount);
await dEDUToken.connect(user).approve(staking, amount);
await staking.connect(user).stakeDEDU(courseId, amount);
```

- Stakes dEDU (e.g., aLSDAI or stETH in production)

---

### 🔁 Unstaking & Yield Redemption

After simulated or real yield has been accrued to `YLDToken`, users can unstake:

```ts
await yldToken.connect(user).approve(staking, shares);
await staking.connect(user).unStake(tokenId, shares);
```

- Burns `YLD`, transfers base token + yield to user
- Can trigger fee logic and share distribution

---

### 🧪 Test & Verify

Tests cover:

- ✅ ETH/WEDU/dEDU staking
- ✅ Correct minting of YLD/sToken
- ✅ Yield accrual
- ✅ Unstake + yield redemption

Run with:

```bash
npx hardhat test
```

---

### 📦 Frontend Integration Notes

- **Contract Addresses**: Persist deployed addresses via `.env` or frontend config
- **ABI Imports**: Export ABI JSON from `artifacts/` and load with `ethers.Contract`
- **Events**: Listen for `Staked`, `Unstaked` to trigger UI updates
- **Course Selection**: Use the `courseId` argument to represent different SFT types
- **Wallets**: Must support sending native ETH and ERC-20 approvals

---

### 🧩 Example Frontend Call (ETH Staking)

```ts
const staking = new ethers.Contract(STAKING_ADDRESS, stakingABI, signer);
await staking.stakeEDU(0, { value: ethers.utils.parseEther("1") });
```

---

### 🔐 Roles to Set in Production

| Contract | Role          | Grantee          |
| -------- | ------------- | ---------------- |
| YLDToken | `MINTER_ROLE` | Staking contract |
| sToken   | `MINTER_ROLE` | Staking contract |

---

### 🚀 Next Steps

- Replace `MockDEDU` with real yield-bearing assets via GainzSwap
- Implement on-chain course metadata for sToken
- Add frontend UI for staking flows, claim history, yield stats
