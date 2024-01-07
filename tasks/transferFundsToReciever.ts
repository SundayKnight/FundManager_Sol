import { task } from 'hardhat/config';
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('transferFundsToReciever', 'Transfer fund to reciever')
  .addParam('contractaddress', 'FundManager Contract address')
  .addParam('address', 'Foundation address')
  .addParam('amount', 'Amount to send')
  .setAction(async ({address, amount, contractaddress}, { ethers }) => {
	const myToken = await ethers.getContractFactory('FundManager')
	const contract = myToken.attach(contractaddress!);

	const contractTx: ContractTransaction = await contract.transferFundsToReceiver(address, amount);
	const contractReceipt: ContractReceipt = await contractTx.wait();
	const event = contractReceipt.events?.find(event => event.event === 'Transfer');
	const evFrom: Address = event?.args!['from'];
	const eValue: BigNumber = event?.args!['value'];
	console.log(`Address of foundation: ${evFrom}`);
	console.log(`Value: ${eValue}`);
  });
