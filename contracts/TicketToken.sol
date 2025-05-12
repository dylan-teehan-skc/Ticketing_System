// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract TicketToken is IERC20 {
    string public name = "Event Ticket Token";
    string public symbol = "TICKET";
    uint8 public decimals = 0; // Tickets are whole units
    uint256 private _totalSupply;
    uint256 public maxSupply; // Maximum number of tickets that can be minted
    uint256 public ticketPrice; // Price per ticket in Wei
    bool public salesActive;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    address public owner;
    
    event TicketPurchased(address buyer, uint256 amount);
    event TicketReturned(address seller, uint256 amount);
    event SalesStatusChanged(bool active);
    event TicketPriceChanged(uint256 newPrice);
    event MaxSupplyChanged(uint256 oldMaxSupply, uint256 newMaxSupply);
    
    constructor(uint256 _maxSupply, uint256 _ticketPrice) {
        require(_maxSupply > 0, "Max supply must be greater than 0");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        
        owner = msg.sender;
        maxSupply = _maxSupply;
        ticketPrice = _ticketPrice;
        salesActive = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function setMaxSupply(uint256 _newMaxSupply) external onlyOwner {
        require(_newMaxSupply >= _totalSupply, "New max supply cannot be less than current supply");
        uint256 oldMaxSupply = maxSupply;
        maxSupply = _newMaxSupply;
        emit MaxSupplyChanged(oldMaxSupply, _newMaxSupply);
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) external override returns (bool) {
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        require(sender != address(0), "Transfer from zero address");
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[sender] >= amount, "Insufficient balance");
        require(_allowances[sender][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _allowances[sender][msg.sender] -= amount;
        
        emit Transfer(sender, recipient, amount);
        return true;
    }
    
    function buyTicket() external payable {
        require(salesActive, "Ticket sales are not active");
        require(msg.value >= ticketPrice, "Insufficient payment");
        
        // Calculate number of tickets based on payment
        uint256 ticketAmount = msg.value / ticketPrice;
        require(_totalSupply + ticketAmount <= maxSupply, "Exceeds maximum supply");
        
        // Mint tickets to buyer
        _totalSupply += ticketAmount;
        _balances[msg.sender] += ticketAmount;
        
        // Refund excess payment
        uint256 excess = msg.value - (ticketAmount * ticketPrice);
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        emit Transfer(address(0), msg.sender, ticketAmount);
        emit TicketPurchased(msg.sender, ticketAmount);
    }
    
    function returnTicket(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(_balances[msg.sender] >= amount, "Insufficient tickets");
        
        // Burn the tickets
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        
        // Refund the payment in ETH
        payable(msg.sender).transfer(amount * ticketPrice);
        
        emit Transfer(msg.sender, address(0), amount);
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