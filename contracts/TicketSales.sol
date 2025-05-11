// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TicketToken.sol";

contract TicketSales {
    TicketToken public ticketToken;
    address public owner;
    uint256 public ticketPrice;
    bool public salesActive;
    
    event TicketPurchased(address buyer, uint256 amount);
    event TicketReturned(address seller, uint256 amount);
    event SalesStatusChanged(bool active);
    event TicketPriceChanged(uint256 newPrice);
    
    constructor(
        address _ticketToken,
        uint256 _ticketPrice
    ) {
        require(_ticketToken != address(0), "Ticket token address cannot be zero");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        
        try TicketToken(_ticketToken).owner() returns (address tokenOwner) {
            require(tokenOwner != address(0), "Invalid token contract: owner is zero address");
        } catch {
            revert("Invalid token contract: contract does not exist or is not a TicketToken");
        }
        
        ticketToken = TicketToken(_ticketToken);
        owner = msg.sender;
        ticketPrice = _ticketPrice;
        salesActive = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier salesOpen() {
        require(salesActive, "Ticket sales are not active");
        _;
    }
    
    function buyTicket() external payable salesOpen {
        require(msg.value >= ticketPrice, "Insufficient payment");
        
        // Calculate number of tickets based on payment
        uint256 ticketAmount = msg.value / ticketPrice;
        
        // Mint tickets to buyer
        ticketToken.mint(msg.sender, ticketAmount);
        
        // Refund excess payment
        uint256 excess = msg.value - (ticketAmount * ticketPrice);
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        emit TicketPurchased(msg.sender, ticketAmount);
    }
    
    function returnTicket(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(ticketToken.balanceOf(msg.sender) >= amount, "Insufficient tickets");
        
        // Burn the tickets
        ticketToken.burn(msg.sender, amount);
        
        // Refund the payment in SETH
        payable(msg.sender).transfer(amount * ticketPrice);
        
        emit TicketReturned(msg.sender, amount);
    }
    
    function setSalesStatus(bool _active) external onlyOwner {
        salesActive = _active;
        emit SalesStatusChanged(_active);
    }
    
    function setTicketPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        ticketPrice = _newPrice;
        emit TicketPriceChanged(_newPrice);
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    receive() external payable {
        revert("Please use buyTicket() function to purchase tickets");
    }
} 