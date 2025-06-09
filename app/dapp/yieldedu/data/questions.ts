export interface Question {
	id: number;
	question: string;
	answers: string[];
	correctAnswer: string;
}

export const questions: Question[] = [
	{
		id: 1,
		question: "What is blockchain?",
		answers: [
			"A type of database that stores data in blocks that are chained together",
			"A programming language",
			"A type of cryptocurrency",
		],
		correctAnswer:
			"A type of database that stores data in blocks that are chained together",
	},
	{
		id: 2,
		question: "What is a smart contract?",
		answers: [
			"A legal document",
			"Self-executing contract with terms directly written into code",
			"A type of cryptocurrency wallet",
		],
		correctAnswer:
			"Self-executing contract with terms directly written into code",
	},
	{
		id: 3,
		question: "What is a cryptocurrency wallet?",
		answers: [
			"A software program that stores private and public keys",
			"A bank account",
			"A type of blockchain",
		],
		correctAnswer: "A software program that stores private and public keys",
	},
	{
		id: 4,
		question: "What is mining in blockchain?",
		answers: [
			"Extracting precious metals from the earth",
			"The process of validating and adding transactions to the blockchain",
			"Creating new cryptocurrencies",
		],
		correctAnswer:
			"The process of validating and adding transactions to the blockchain",
	},
	{
		id: 5,
		question: "What is a consensus mechanism?",
		answers: [
			"A voting system for political elections",
			"A method for reaching agreement on the state of the blockchain",
			"A type of cryptocurrency",
		],
		correctAnswer:
			"A method for reaching agreement on the state of the blockchain",
	},
	{
		id: 6,
		question: "What is a block reward?",
		answers: [
			"A prize given in a lottery",
			"New cryptocurrency given to miners for successfully mining a block",
			"A type of smart contract",
		],
		correctAnswer:
			"New cryptocurrency given to miners for successfully mining a block",
	},
	{
		id: 7,
		question: "What is a 51% attack?",
		answers: [
			"When a single entity controls majority of network's mining power",
			"A type of cryptocurrency scam",
			"A blockchain upgrade process",
		],
		correctAnswer:
			"When a single entity controls majority of network's mining power",
	},
	{
		id: 8,
		question: "What is a hard fork?",
		answers: [
			"A radical change to the protocol creating two incompatible chains",
			"A type of cryptocurrency wallet",
			"A blockchain security feature",
		],
		correctAnswer:
			"A radical change to the protocol creating two incompatible chains",
	},
	{
		id: 9,
		question: "What is a private key in cryptocurrency?",
		answers: [
			"A secret password to access email",
			"A cryptographic key that allows spending of cryptocurrency",
			"A mining algorithm",
		],
		correctAnswer: "A cryptographic key that allows spending of cryptocurrency",
	},
	{
		id: 10,
		question: "What is DeFi?",
		answers: [
			"Decentralized Finance - financial services on blockchain",
			"Defined Finance - a type of banking",
			"Deferred Financial Investment",
		],
		correctAnswer: "Decentralized Finance - financial services on blockchain",
	},
	{
		id: 11,
		question: "What is an NFT?",
		answers: [
			"New Financial Token",
			"Non-Fungible Token - unique digital asset",
			"Network File Transfer",
		],
		correctAnswer: "Non-Fungible Token - unique digital asset",
	},
	{
		id: 12,
		question: "What is gas fee in Ethereum?",
		answers: [
			"Cost for car fuel",
			"Transaction fee paid to miners",
			"Energy bill payment",
		],
		correctAnswer: "Transaction fee paid to miners",
	},
	{
		id: 13,
		question: "What is a dApp?",
		answers: [
			"Digital Application",
			"Decentralized Application running on blockchain",
			"Database Application",
		],
		correctAnswer: "Decentralized Application running on blockchain",
	},
	{
		id: 14,
		question: "What is a Layer 2 solution?",
		answers: [
			"Secondary blockchain network",
			"Scaling solution built on top of base blockchain",
			"Backup database",
		],
		correctAnswer: "Scaling solution built on top of base blockchain",
	},
	{
		id: 15,
		question: "What is token staking?",
		answers: [
			"Selling cryptocurrencies",
			"Locking up tokens to support network operations",
			"Trading tokens",
		],
		correctAnswer: "Locking up tokens to support network operations",
	},
	{
		id: 16,
		question: "What is a DAO?",
		answers: [
			"Digital Asset Organization",
			"Decentralized Autonomous Organization",
			"Direct Access Operation",
		],
		correctAnswer: "Decentralized Autonomous Organization",
	},
	{
		id: 17,
		question: "What is a liquidity pool?",
		answers: [
			"Collection of funds locked in smart contract",
			"Bank savings account",
			"Mining pool",
		],
		correctAnswer: "Collection of funds locked in smart contract",
	},
	{
		id: 18,
		question: "What is Proof of Stake (PoS)?",
		answers: [
			"A validation method where validators stake tokens",
			"A type of mining hardware",
			"A cryptocurrency exchange",
		],
		correctAnswer: "A validation method where validators stake tokens",
	},
	{
		id: 19,
		question: "What is a cold wallet?",
		answers: [
			"A wallet stored in a freezer",
			"An offline cryptocurrency storage method",
			"A mobile wallet app",
		],
		correctAnswer: "An offline cryptocurrency storage method",
	},
	{
		id: 20,
		question: "What is MetaMask?",
		answers: [
			"A cryptocurrency wallet and gateway to blockchain apps",
			"A mining software",
			"A blockchain platform",
		],
		correctAnswer: "A cryptocurrency wallet and gateway to blockchain apps",
	},
	{
		id: 21,
		question: "What is a seed phrase?",
		answers: [
			"A list of words that gives access to a crypto wallet",
			"A type of blockchain",
			"A mining algorithm",
		],
		correctAnswer: "A list of words that gives access to a crypto wallet",
	},
	{
		id: 22,
		question: "What is a blockchain node?",
		answers: [
			"A computer participating in the blockchain network",
			"A smart contract platform",
			"A mining tool",
		],
		correctAnswer: "A computer participating in the blockchain network",
	},
	{
		id: 23,
		question: "What is market capitalization in cryptocurrency?",
		answers: [
			"The total value of a cryptocurrency's circulating supply",
			"The maximum number of coins that can be mined",
			"The number of exchanges listing the coin",
		],
		correctAnswer: "The total value of a cryptocurrency's circulating supply",
	},
	{
		id: 24,
		question: "What is a flash loan?",
		answers: [
			"A traditional bank loan",
			"An uncollateralized loan that must be repaid in the same transaction",
			"A long-term crypto loan",
		],
		correctAnswer:
			"An uncollateralized loan that must be repaid in the same transaction",
	},
	{
		id: 25,
		question: "What is gas optimization?",
		answers: [
			"A way to save fuel in vehicles",
			"Techniques to reduce transaction costs on blockchain",
			"A cryptocurrency exchange feature",
		],
		correctAnswer: "Techniques to reduce transaction costs on blockchain",
	},
	{
		id: 26,
		question: "What is the purpose of a blockchain explorer?",
		answers: [
			"To browse the internet",
			"To view and analyze blockchain transactions and data",
			"To store digital assets",
		],
		correctAnswer: "To view and analyze blockchain transactions and data",
	},
];

export function getRandomQuestions(QUESTIONS_PER_SESSION: number) {
	const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
	return shuffledQuestions.slice(0, QUESTIONS_PER_SESSION);
}
