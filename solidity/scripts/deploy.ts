import { ethers, artifacts, network } from "hardhat";
import fs from "fs";
import path from "path";
import deployYLDToken from "../utils/yldToken";
import deploySToken from "../utils/sToken";
import deployStakingContract from "../utils/stakingContract";

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying with:", deployer.address);

	const { yldToken, mockAsset: dEDUToken } = await deployYLDToken();

	const { sToken } = await deploySToken();
	const { staking, wedu } = await deployStakingContract({
		yldAddress: await yldToken.getAddress(),
		sTokenAddress: await sToken.getAddress(),
	});

	// Grant MINTER_ROLE to staking contract
	await yldToken.grantRole(
		await yldToken.MINTER_ROLE(),
		await staking.getAddress()
	);
	await sToken.grantRole(
		await sToken.MINTER_ROLE(),
		await staking.getAddress()
	);

	// Mint dEDU and deposit WEDU to deployer

	const amount = ethers.parseEther("1000");

	// 1. Mint dEDU tokens directly to your wallet
	await dEDUToken.mint(deployer.address, amount);
	console.log(`Minted ${amount} dEDU to ${deployer.address}`);

	// 2. Deposit native token (ETH) to get WEDU tokens (wrapped dEDU)
	const wrapAmount = ethers.parseEther("500");

	// Make sure your deployer wallet has enough ETH for wrapping
	await network.provider.send("hardhat_setBalance", [
		deployer.address,
		"0x10000000000000000000000", // large ETH balance
	]);

	await wedu.connect(deployer).deposit({ value: wrapAmount });
	console.log(`Wrapped ${wrapAmount} ETH into WEDU for ${deployer.address}`);

	// Save deployment addresses
	const addresses = {
		yldToken: await yldToken.getAddress(),
		dEDUToken: await dEDUToken.getAddress(),
		sToken: await sToken.getAddress(),
		staking: await staking.getAddress(),
		wedu: await wedu.getAddress(),
	};

	const deploymentsPath = path.join(
		__dirname,
		"../../app/dapp/investors/contract-deployments/deployments.json"
	);

	const deploymentsPath2 = path.join(
		__dirname,
		"../../app/ponder/contract-deployments/deployments.json"
	);
	fs.mkdirSync(path.dirname(deploymentsPath), { recursive: true });
	fs.writeFileSync(deploymentsPath, JSON.stringify(addresses, null, 2));

	fs.mkdirSync(path.dirname(deploymentsPath2), { recursive: true });
	fs.writeFileSync(deploymentsPath2, JSON.stringify(addresses, null, 2));

	// export ABIs for frontend
	const abiDir = path.join(
		__dirname,
		"../../app/dapp/investors/contract-deployments/abis"
	);
	const abiDir2 = path.join(
		__dirname,
		"../../app/ponder/contract-deployments/abis"
	);
	fs.mkdirSync(abiDir, { recursive: true });
	fs.mkdirSync(abiDir2, { recursive: true });

	for (const name of ["Staking", "YLDToken", "SToken", "MockDEDU", "WEDU"]) {
		const artifact = await artifacts.readArtifact(name);
		fs.writeFileSync(
			path.join(abiDir, `${name}.json`),
			JSON.stringify(artifact, null, 2)
		);
		fs.writeFileSync(
			path.join(abiDir2, `${name}.json`),
			JSON.stringify(artifact, null, 2)
		);
	}

	console.log("✅ All contracts deployed and artifacts exported.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
