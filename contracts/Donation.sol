// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Donation
 * @dev A smart contract for handling donations to a specified receiver.
 */
contract Donation is Ownable {
    uint256 totalDonationsAmount; // Total amount of donations received
    address _contract; // The contract address
    address[] charityAddresses; // Array of addresses of the donators
    address public immutable donationsReceiver; // The address of the receiver
    string public description; // Description of the donation

    mapping(address => uint256) private _donations; // Mapping of addresses to donation amounts

    error InsufficentAmountError(address caller); // Error for insufficient donation amount
    error NotAnOwnerError(address caller); // Error for unauthorized access by non-owner

    event Transfer(address indexed from, uint256 value); // Event for transfer of donation

    /**
     * @dev Constructor to initialize the Donation contract.
     * @param _donationReceiver The address of the donation receiver
     * @param _description The description of the donation
     */
    constructor(address _donationReceiver, string memory _description) Ownable() payable {
        description = _description;
        donationsReceiver = _donationReceiver;
        if (msg.value > 0) {
            storeDonate();    
        }
    }

    /**
     * @dev Internal function to store the donation from the sender.
     */
    function storeDonate() internal {
        if (_donations[tx.origin] == 0) {
            charityAddresses.push(tx.origin);
        }
        _donations[tx.origin] += msg.value;
        totalDonationsAmount += msg.value;
        emit Transfer(tx.origin, msg.value);     
    }

    /**
     * @dev External function for making a donation.
     */
    function donate() external payable {
        if (msg.value <= 0) { 
            revert InsufficentAmountError(msg.sender);
        }
        storeDonate();       
    }

    /**
     * @dev External function to send funds to the receiver.
     * @param amount The amount of funds to be sent
     */
    function sendFundsToReceiver(uint256 amount) external payable onlyOwner {
        if (amount > totalDonationsAmount) {
            revert InsufficentAmountError(msg.sender);
        }
        (bool sent, ) = donationsReceiver.call{value: amount}(""); // Sending funds to the receiver
        if (sent) {
            emit Transfer(msg.sender, amount);
        } else {
            revert();
        }
    }

    /**
     * @dev External function to get the list of donators' addresses.
     * @return An array of addresses of the donators
     */
    function getDonators() external view returns(address[] memory) {
        return charityAddresses;
    }

    /**
     * @dev External function to get the total sum of donations received.
     * @return The total sum of donations received
     */
    function getSumOfDonations() external view returns(uint256) {
        return totalDonationsAmount;
    }

    /**
     * @dev Fallback function to receive donations.
     */
    receive() external payable {
        storeDonate();     
    }
}