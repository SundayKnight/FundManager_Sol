import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('getSumOfDonations', 'Get sum of donations')
  .addParam('address', 'Address of Contract')
  .setAction(async (taskArgs, { ethers }) => {
	const myToken = await ethers.getContractFactory('Donation');
	const contract = myToken.attach(taskArgs.address!);
	const owner = contract.owner();
	console.log(`Owner address: ${owner}`);
	console.log(`Owner address: ${owner}`);
	const contractTx: BigNumber = await contract.getSumOfDonations();
	console.log(`Sum of Donations: ${contractTx}`);
  });
