import { expect } from "chai";
import { ethers } from "hardhat";

import { Donation } from "../typechain";

const NAME = "MyToken";
const INITIAL_AMOUNT = ethers.utils.parseUnits("1", "ether"); // 10^18


describe("Donation contract unit tests", function () {
  let Donation;
  let donation: Donation;
  let owner: SignerWithAddress, receiver: SignerWithAddress, user2: SignerWithAddress, users:SignerWithAddress[];

  beforeEach(async () => {
    const Donation = await ethers.getContractFactory("Donation");
    users = await ethers.getSigners();
    owner = users[0];
    receiver = users[1];
    user2 = users[2];
    donation = await Donation.connect(owner).deploy(receiver.getAddress(), NAME);
  });
  
  describe("Initial statement",async () => { 
    it("should return owner address",async () => {
      expect(await donation.owner()).to.be.equal(owner.address);
    });
    it("should have the correct name",async () => {
      const tName: String = await donation.description();
      expect(tName).to.be.equal(NAME);
    });
    it("should have correct reciever address",async () => {
      const receiverAddress = await donation.donationsReceiver();
      expect(receiver.address).to.be.equal(receiverAddress);
    });
    it("should have the correct balance",async () => {
      const tBalance: Number = await donation.getSumOfDonations();
      expect(tBalance).to.be.equal(0);
    });
  });
  describe("Check functionality",async () => {
    it("should donate correct amount",async () => {
      const amount = ethers.utils.parseUnits("1000","wei");
      const balanceA = await donation.getSumOfDonations();
      await donation.donate({value: amount});
      expect(await donation.getSumOfDonations()).to.be.equal(amount.add(balanceA));
    });
    it("should send funds to receiver",async () => {
      const amount = ethers.utils.parseUnits("1000","wei");
      const balanceA = await ethers.provider.getBalance(await donation.donationsReceiver());
      await donation.donate({value: amount});
      await donation.sendFundsToReceiver(amount);
      expect(await ethers.provider.getBalance(await donation.donationsReceiver())).to.be.equal(amount.add(balanceA));
    });
    it("should return corerct array of donators", async () => {
      const amount = ethers.utils.parseUnits("1000","wei");
      await donation.connect(user2).donate({value: amount});
      const charityAddresses = await donation.getDonators();
      expect(charityAddresses[0]).to.be.equal(user2.address);
    });
    it("should update charity addresses on donation", async () => {
      const initialCharityAddresses = await donation.getDonators();
      const donationValue = ethers.utils.parseUnits("1000","wei");
      await donation.connect(user2).donate({ value: donationValue });
      const updatedCharityAddresses = await donation.getDonators();
      expect(updatedCharityAddresses.length).to.equal(initialCharityAddresses.length + 1);
    });
  });
  describe("Events check",async () => {
    it("should emit Transfer event",async () => {
      const amount = 1000;
      await expect( await donation.donate({value:amount})).to.emit(donation,"Transfer").withArgs(owner.address,amount);
    });
  });
  describe("Negative scenarios",async () => {
    it("shouldn't donate zero amount",async () => {
      await expect(donation.connect(user2).donate()).to.be.revertedWithCustomError(donation,'InsufficentAmountError');
    });
    it("shouldn't send funds to reciever more than donations amount",async () => {
      const amount = ethers.utils.parseUnits("10","ether");
      await expect(donation.sendFundsToReceiver(amount)).to.be.revertedWithCustomError(donation,'InsufficentAmountError');
    });
    it("shouldn't send funds to reciever for not an owner",async () => {
      const amount = ethers.utils.parseUnits("1","ether");
      await donation.donate({value: amount});
      await expect(donation.connect(user2).sendFundsToReceiver(amount)).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should revert call on failure",async () => {
      const nonPayableContract = await ethers.getContractFactory("Lock");
      const nonPayableInstance = await nonPayableContract.deploy();
      Donation = await ethers.getContractFactory("Donation");
      users = await ethers.getSigners();
      owner = users[0];
      donation = await Donation.connect(owner).deploy(nonPayableInstance.address, NAME, {value:INITIAL_AMOUNT});
      await expect(donation.sendFundsToReceiver(ethers.utils.parseEther("1"))).to.be.reverted;
    });
    it('should receive Ether and increase total donations', async () => {
      const balanceA = await donation.getSumOfDonations();
      const amount = ethers.utils.parseUnits("1","ether"); 
      const address = await donation.address;
      const transaction  = {
        to: address,
        value: amount, 
      };
      await user2.sendTransaction(transaction);
      const balanceB = await donation.getSumOfDonations();
      expect(balanceB).to.equal(balanceA.add(amount));
    });
    it("shouldn't add address on second donation to array of donators", async () => {
      const initialCharityAddresses = await donation.getDonators();
      const donationValue = ethers.utils.parseUnits("1000","wei");
      
      await donation.connect(user2).donate({ value: donationValue });
      const updatedCharityAddresses = await donation.getDonators();
      expect(updatedCharityAddresses.length).to.equal(initialCharityAddresses.length + 1);

      await donation.connect(user2).donate({ value: donationValue });
      const updatedCharityAddressesB = await donation.getDonators();
      expect(updatedCharityAddressesB.length).to.equal(updatedCharityAddresses.length);
    }); 
  });
});