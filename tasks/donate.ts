import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task("donate", 'Donate to contract')
  .addParam('address', 'Address of Contract')
  .addParam('amount', 'Amount to donate')
  .setAction(async (taskArgs, { ethers }) => {
	const myToken = await ethers.getContractFactory('Donation')
	const contract = myToken.attach(taskArgs.address);
	const contractTx: ContractTransaction = await contract.donate({value:taskArgs.amount});
	const contractReceipt: ContractReceipt = await contractTx.wait();
	const event = contractReceipt.events?.find(event => event.event === 'Transfer');
	const evFrom: Address = event?.args!['from'];
	const eAmount: BigNumber = event?.args!['value'];
	console.log(`Initiator: ${evFrom}`);
	console.log(`Amount: ${eAmount}`);
  });
