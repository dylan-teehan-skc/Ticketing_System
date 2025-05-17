// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract TicketToken is IERC20 {

    string public name = "Event Ticket Token";
    string public symbol = "TICKET";
    uint8 public constant decimals = 0;  // Tickets are whole units
    uint256 private _totalSupply;
    uint256 public maxSupply;
    uint256 public ticketPrice; 
    bool public salesActive;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    address public owner;
    
    // Events
    event TicketPurchased(address indexed buyer, uint256 amount);
    event TicketSold(address indexed seller, uint256 amount);
    event SalesStatusChanged(bool active);
    event TicketPriceChanged(uint256 newPrice);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenSalesActive() {
        require(salesActive, "Ticket sales are not active");
        _;
    }
    
    // Constructor  
    constructor(uint256 _maxSupply, uint256 _ticketPrice) {
        require(_maxSupply > 0, "Max supply must be greater than 0");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        
        owner = msg.sender;
        maxSupply = _maxSupply;
        ticketPrice = _ticketPrice;
        salesActive = true;
        
        // Mint all tickets to the contract
        _mint(address(this), _maxSupply);
    }
    
    // ERC20 Functions
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
        return true;
    }
    
    // Ticket-specific functions
    function buyTicket() external payable whenSalesActive {
        require(msg.value >= ticketPrice, "Insufficient payment");
        
        uint256 ticketAmount = msg.value / ticketPrice;
        require(ticketAmount > 0, "Must buy at least 1 ticket");
        require(_balances[address(this)] >= ticketAmount, "Not enough tickets available");
        
        // Transfer tickets from contract to buyer
        _transfer(address(this), msg.sender, ticketAmount);
        
        // Refund excess payment
        uint256 excess = msg.value - (ticketAmount * ticketPrice);
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Excess payment refund failed");
        }
        
        emit TicketPurchased(msg.sender, ticketAmount);
    }
    
    function sellTicket(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(_balances[msg.sender] >= amount, "Insufficient tickets");
        require(address(this).balance >= amount * ticketPrice, "Contract has insufficient funds");
        
        // Transfer tickets back to contract
        _transfer(msg.sender, address(this), amount);
        
        // Calculate and send payment
        uint256 payment = amount * ticketPrice;
        (bool success, ) = payable(msg.sender).call{value: payment}("");
        require(success, "Payment transfer failed");
        
        emit TicketSold(msg.sender, amount);
    }
    
    // Owner functions
    function setSalesStatus(bool _active) external onlyOwner {
        salesActive = _active;
        emit SalesStatusChanged(_active);
    }
    
    function setTicketPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        ticketPrice = _newPrice;
        emit TicketPriceChanged(_newPrice);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Internal functions
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Transfer from zero address");
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[sender] >= amount, "Transfer amount exceeds balance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Mint to zero address");
        require(_totalSupply + amount <= maxSupply, "Exceeds max supply");
        
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
    
    // Receive external SETH function
    receive() external payable {
        revert("Use buyTicket() to purchase tickets");
    }
} 