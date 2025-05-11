// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract TicketToken is IERC20 {
    string public name = "Event Ticket Token";
    string public symbol = "TICKET";
    uint8 public decimals = 0; // Tickets are whole units
    uint256 private _totalSupply;
    uint256 public maxSupply; // Maximum number of tickets that can be minted
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    address public owner;
    address public minter;  // Add minter role
    
    event MinterChanged(address indexed previousMinter, address indexed newMinter);
    event MaxSupplyChanged(uint256 oldMaxSupply, uint256 newMaxSupply);
    
    constructor(uint256 _maxSupply) {
        owner = msg.sender;
        maxSupply = _maxSupply;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }
    
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "New minter is the zero address");
        address oldMinter = minter;
        minter = _minter;
        emit MinterChanged(oldMinter, _minter);
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
    
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Mint to zero address");
        require(_totalSupply + amount <= maxSupply, "Exceeds maximum supply");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyMinter {
        require(from != address(0), "Burn from zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        
        _totalSupply -= amount;
        _balances[from] -= amount;
        
        emit Transfer(from, address(0), amount);
    }
} 