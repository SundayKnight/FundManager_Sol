import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";


import { FundManager } from "../typechain";

const NAME = "MyToken";

describe("FundManager contract unit tests", function () {
  let FundManager;
  let fundManager: FundManager;
  let owner: SignerWithAddress, receiver: SignerWithAddress, user2: SignerWithAddress, users:SignerWithAddress[];

  beforeEach(async () => {
    const FundManager = await ethers.getContractFactory("FundManager");
    users = await ethers.getSigners();
    owner = users[0];
    receiver = users[1];
    user2 = users[2];
    fundManager = await FundManager.connect(owner).deploy();
    await fundManager.deployed();
    const myContractDeployedAddress = await fundManager.address;
  });
  
  describe("Initial statement",async () => { 
    it("should return owner address",async () => {
      console.log(`owner address ${await owner.address}`);
      expect(await owner.address).to.be.equal(owner.address);
    });
    it("should number of foundations to be equal zero",async () => {
      expect(await fundManager.numberOfFoundationsCreated()).to.be.equal(0);
    });
  });
  describe("Check functionality",async () => {
    it("should create foundation correctly",async () => {
      const description = 'Test Foundation';
      const tx = await fundManager.createFoundation(receiver.address, description)
        const result = await tx.wait()
        let event = result.events!.filter((x: any) => {
        return x.event == 'Create'
        })
        let eventArg = event[0].args?.foundation;
      
      const foundationAddress = await fundManager.ownersOfFunds(eventArg);
      expect(foundationAddress).to.equal(await owner.address);
    });
    it("should send funds to receiver",async () => {
      // Create a foundation
      const donationReceiver = receiver.address;
      const donationReceiverBalance = await ethers.provider.getBalance(donationReceiver);
      const description = "Help for the needy";
      const tx = await fundManager.createFoundation(receiver.address, description, { value: ethers.utils.parseUnits("1","ether") })
        const result = await tx.wait()
        let event = result.events!.filter((x: any) => {
        return x.event == 'Create'
      })
      let eventArg = event[0].args?.foundation;      // Get the foundation address

      // Transfer funds to the donation receiver
      const amount = ethers.utils.parseUnits("0.5","ether");
      const txx = await fundManager.transferFundsToReceiver(eventArg, amount);
      // Wait for the transaction to be mined
      await txx.wait();

      // Check that the balance of the donation receiver has increased
      expect(await ethers.provider.getBalance(donationReceiver)).to.be.equal(donationReceiverBalance.add(amount));
    });

  });
  describe("Events check",async () => {
    it("should emit Create event",async () => {
      const amount = 1000;
      const donationReceiver = await receiver.getAddress();
      const description = "Help for the needy";
      await expect(await fundManager.createFoundation(donationReceiver, description, { value: ethers.utils.parseEther("1") })).to.emit(fundManager,"Create");

    });
    it("should emit Transfer event",async () => {
      // Create a foundation
      const donationReceiver = await receiver.getAddress();
      const description = "Help for the needy";
      
      const tx = await fundManager.createFoundation(receiver.address, description, { value: ethers.utils.parseUnits("1","ether") })
        const result = await tx.wait()
        let event = result.events!.filter((x: any) => {
        return x.event == 'Create'
      })
      let eventArg = event[0].args?.foundation; 
      // Transfer funds to the donation receiver
      const amount = ethers.utils.parseEther("0.5");
      const txx = await fundManager.transferFundsToReceiver(eventArg, amount);

      // Wait for the transaction to be mined
      await txx.wait();

      // Check that the balance of the donation receiver has increased
      expect(txx).to.emit(fundManager, "Transfer").withArgs(eventArg, amount);
    });
  });
  describe("Negative scenarios",async () => {
    it("shouldn't send funds to reciever for not an owner",async () => {
      const donationReceiver = await receiver.getAddress();
      const description = "Help for the needy";
      await fundManager.createFoundation(donationReceiver, description, { value: ethers.utils.parseEther("1") });
      
      // Get the foundation address
      const foundationAddress = await fundManager.ownersOfFunds(fundManager.address);
 
      // Attempt to transfer funds from the foundation using a different address
      const tx = fundManager.connect(user2).transferFundsToReceiver(foundationAddress, ethers.utils.parseEther("0.5"));
 
      // Expect the transaction to be reverted with NotAnOwnerError
      await expect(tx).to.be.revertedWithCustomError(fundManager,"NotAnOwnerError");
    });
          
  });
});