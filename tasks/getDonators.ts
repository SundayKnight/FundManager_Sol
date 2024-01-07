import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('getDonators', 'Get donators addresses')
  .addParam('address', 'Address of Contract')
  .setAction(async (taskArgs, { ethers }) => {
	const myToken = await ethers.getContractFactory('Donation')
	const contract = myToken.attach(taskArgs.address);
	const contractTx = await contract.getDonators();
	console.log(`Charity addresses: ${contractTx}`);
  });
