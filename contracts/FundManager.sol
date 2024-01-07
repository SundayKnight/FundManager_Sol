// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "contracts/Donation.sol";

/**
 * @title FundManager
 * @dev The FundManager contract facilitates the creation and management of donation funds.
 */
contract FundManager {
    uint256 public numberOfFoundationsCreated; // The total number of foundations created.

    mapping(address => address) public ownersOfFunds; // Mapping of foundation addresses to their respective owners.

    event Create(address indexed foundation, address indexed owner); // Event emitted upon the creation of a new foundation.
    event Transfer(address indexed from, uint256 value); // Event emitted upon the transfer of funds.
    error NotAnOwnerError(address caller); // Error for unauthorized access.

    /**
     * @dev Creates a new foundation with the specified donation receiver and description.
     * @param donationReceiver The address of the donation receiver.
     * @param description The description of the foundation.
     */
    function createFoundation(
        address donationReceiver,
        string memory description
    ) external payable {
        // Create a new Donation contract with the provided donation receiver and description.
        Donation donation = new Donation{value: msg.value}(donationReceiver, description);
        // Assign the sender as the owner of the newly created foundation.
        ownersOfFunds[address(donation)] = msg.sender;
        // Increment the total number of foundations created.
        numberOfFoundationsCreated += 1;
        // Emit an event to indicate the creation of a new foundation.
        emit Create(address(donation), msg.sender);
    }

    /**
     * @dev Transfers funds from the specified foundation to the donation receiver.
     * @param foundationAddress The address of the foundation from which funds are to be transferred.
     * @param amount The amount of funds to be transferred.
     */
    function transferFundsToReceiver(
        address payable foundationAddress,
        uint256 amount
    ) external {
        // Ensure that the sender is the owner of the specified foundation.
        if (ownersOfFunds[foundationAddress] != msg.sender) {
            revert NotAnOwnerError(msg.sender);
        }
        // Retrieve the Donation contract associated with the specified foundation address.
        Donation donation = Donation(foundationAddress);
        // Transfer the specified amount of funds to the donation receiver.
        donation.sendFundsToReceiver(amount);
        // Emit an event to indicate the transfer of funds.
        emit Transfer(foundationAddress, amount);
    }
}
