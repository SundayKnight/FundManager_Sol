import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task("createFoundation", 'Create new foundation')
  .addParam('contract', 'Address of Contract')
  .addParam('address', 'Reciever address')
  .addParam('description', 'Description for foundation')
  .addParam('amount',"Amount")
  .setAction(async (taskArgs, {ethers}) => {
	const myToken = await ethers.getContractFactory('FundManager')
	const contract = myToken.attach(taskArgs.contract);
	const contractTx: ContractTransaction = await contract.createFoundation(taskArgs.address,taskArgs.description,{value: taskArgs.amount});
	const contractReceipt: ContractReceipt = await contractTx.wait();
	const event = contractReceipt.events?.find(event => event.event === "Create");
	const evAddress: Address = event?.args!['foundation'];
	const eOwner: Address = event?.args!['owner'];
	console.log(`Address of foundation: ${evAddress}`);
	console.log(`Owner: ${eOwner}`);
  });
