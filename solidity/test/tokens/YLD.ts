import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

describe("YLDToken (TypeScript)", function () {
  let YLDToken: ContractFactory;
  let yld: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  const NAME = "Yield Token";
  const SYMBOL = "YLD";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners() as SignerWithAddress[];
    YLDToken = await ethers.getContractFactory("YLDToken");
    yld = await upgrades.deployProxy(
      YLDToken,
      [NAME, SYMBOL, owner.address],
      { initializer: "initialize" }
    ) as Contract;
    await yld.deployed();
  });

  it("should initialize with correct name and symbol", async function () {
    expect(await yld.name()).to.equal(NAME);
    expect(await yld.symbol()).to.equal(SYMBOL);
  });

  it("should set owner correctly", async function () {
    expect(await yld.owner()).to.equal(owner.address);
  });

  it("owner should have DEFAULT_ADMIN_ROLE", async function () {
    const DEFAULT_ADMIN_ROLE: string = await yld.DEFAULT_ADMIN_ROLE();
    expect(
      await yld.hasRole(DEFAULT_ADMIN_ROLE, owner.address)
    ).to.be.true;
  });

  it("should grant MINTER_ROLE by admin", async function () {
    const MINTER_ROLE: string = await yld.MINTER_ROLE();
    await yld.grantRole(MINTER_ROLE, addr1.address);
    expect(
      await yld.hasRole(MINTER_ROLE, addr1.address)
    ).to.be.true;
  });

  it("should allow minter to mint tokens", async function () {
    const MINTER_ROLE: string = await yld.MINTER_ROLE();
    await yld.grantRole(MINTER_ROLE, addr1.address);
    const amount = ethers.utils.parseEther("100");
    await yld.connect(addr1).mint(addr2.address, amount);
    expect(await yld.balanceOf(addr2.address)).to.equal(amount);
  });

  it("should not allow non-minter to mint tokens", async function () {
    const amount = ethers.utils.parseEther("100");
    await expect(
      yld.connect(addr1).mint(addr2.address, amount)
    ).to.be.revertedWith(
      `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await yld.MINTER_ROLE()}`
    );
  });

  it("should upgrade contract by owner", async function () {
    const YLDTokenV2: ContractFactory = await ethers.getContractFactory("YLDToken");
    const upgraded = await upgrades.upgradeProxy(yld.address, YLDTokenV2) as Contract;
    expect(upgraded.address).to.equal(yld.address);
  });

  it("should not upgrade contract by non-owner", async function () {
    const YLDTokenV2: ContractFactory = await ethers.getContractFactory("YLDToken");
    await expect(
      upgrades.upgradeProxy(yld.address, YLDTokenV2, { signer: addr1 })
    ).to.be.reverted;
  });
});
