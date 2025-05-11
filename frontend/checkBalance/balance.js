let web3;
let ticketToken;

// ERC20 ABI for token interactions
const IERC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// Initialize Web3 with Holesky network
async function initialize() {
    console.log('Initializing...');
    try {
        web3 = new Web3("https://holesky.drpc.org");
        console.log('Web3 instance:', web3);
        
        // Initialize contract
        const ticketTokenAddress = localStorage.getItem('ticketTokenAddress');
        console.log('Ticket Token Address:', ticketTokenAddress);
        
        if (!ticketTokenAddress) {
            console.error('No ticket token address found in localStorage');
            alert('Ticket Token contract address not found. Please make sure the contract is deployed and the address is set.');
            return;
        }
        
        ticketToken = new web3.eth.Contract(IERC20_ABI, ticketTokenAddress);
        console.log('Contract initialized:', ticketToken);
        
        // Verify contract is deployed
        try {
            const code = await web3.eth.getCode(ticketTokenAddress);
            if (code === '0x' || code === '') {
                console.error('No contract code found at address:', ticketTokenAddress);
                alert('No contract found at the specified address. Please make sure the contract is deployed.');
                return;
            }
            console.log('Contract code found at address:', ticketTokenAddress);
        } catch (error) {
            console.error('Error checking contract deployment:', error);
            alert('Error checking contract deployment: ' + error.message);
            return;
        }
        
        updateForm();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Error initializing Web3: ' + error.message);
    }
}

function updateForm() {
    console.log('Updating form...');
    const userType = document.getElementById('userType').value;
    console.log('Selected user type:', userType);
    
    // Hide all forms
    document.getElementById('attendeeForm').style.display = 'none';
    document.getElementById('doormanForm').style.display = 'none';
    document.getElementById('venueForm').style.display = 'none';
    
    // Show selected form
    document.getElementById(userType + 'Form').style.display = 'block';
}

async function checkBalance() {
    console.log('Checking balance...');
    if (!web3) {
        console.error('Web3 not initialized');
        alert('Web3 not initialized. Please refresh the page.');
        return;
    }

    if (!ticketToken) {
        console.error('Ticket Token contract not initialized');
        alert('Ticket Token contract not initialized. Please make sure the contract is deployed and the address is set.');
        return;
    }

    const address = document.getElementById('walletAddress').value;
    console.log('Wallet address:', address);
    
    if (!address) {
        alert('Please enter a wallet address');
        return;
    }
    
    if (!web3.utils.isAddress(address)) {
        alert('Invalid wallet address!');
        return;
    }

    try {
        // Get ETH balance
        console.log('Fetching ETH balance...');
        const ethBalance = await web3.eth.getBalance(address);
        console.log('ETH balance:', ethBalance);
        
        // Get token balance
        console.log('Fetching ticket balance...');
        const ticketBalance = await ticketToken.methods.balanceOf(address).call();
        console.log('Ticket balance:', ticketBalance);
        
        // Get token details
        console.log('Fetching token details...');
        const tokenName = await ticketToken.methods.name().call();
        console.log('Token name:', tokenName);
        const tokenSymbol = await ticketToken.methods.symbol().call();
        console.log('Token symbol:', tokenSymbol);
        const tokenDecimals = await ticketToken.methods.decimals().call();
        console.log('Token decimals:', tokenDecimals);
        const totalSupply = await ticketToken.methods.totalSupply().call();
        console.log('Total supply:', totalSupply);
        
        displayBalance({
            ethBalance: web3.utils.fromWei(ethBalance, 'ether'),
            ticketBalance: ticketBalance,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            tokenDecimals: tokenDecimals,
            totalSupply: totalSupply
        });
    } catch (error) {
        console.error('Balance check error:', error);
        alert('Error checking balance: ' + error.message);
    }
}

async function verifyTicket() {
    console.log('Verifying ticket...');
    if (!web3 || !ticketToken) {
        console.error('Web3 or contract not initialized');
        alert('Web3 or contract not initialized. Please refresh the page.');
        return;
    }

    const address = document.getElementById('attendeeAddress').value;
    console.log('Attendee address:', address);
    
    if (!web3.utils.isAddress(address)) {
        alert('Invalid wallet address!');
        return;
    }

    try {
        const ticketBalance = await ticketToken.methods.balanceOf(address).call();
        const tokenName = await ticketToken.methods.name().call();
        const tokenSymbol = await ticketToken.methods.symbol().call();
        
        if (ticketBalance > 0) {
            displayBalance({
                ticketBalance: ticketBalance,
                tokenName: tokenName,
                tokenSymbol: tokenSymbol,
                message: 'Ticket is valid!'
            });
        } else {
            displayBalance({
                ticketBalance: 0,
                tokenName: tokenName,
                tokenSymbol: tokenSymbol,
                message: 'No valid ticket found!'
            });
        }
    } catch (error) {
        console.error('Ticket verification error:', error);
        alert('Error verifying ticket: ' + error.message);
    }
}

async function checkDistribution() {
    console.log('Checking distribution...');
    if (!web3 || !ticketToken) {
        console.error('Web3 or contract not initialized');
        alert('Web3 or contract not initialized. Please refresh the page.');
        return;
    }

    const address = document.getElementById('venueAddress').value;
    console.log('Venue address:', address);
    
    if (!web3.utils.isAddress(address)) {
        alert('Invalid wallet address!');
        return;
    }

    try {
        const totalSupply = await ticketToken.methods.totalSupply().call();
        const venueBalance = await ticketToken.methods.balanceOf(address).call();
        const tokenName = await ticketToken.methods.name().call();
        const tokenSymbol = await ticketToken.methods.symbol().call();
        
        displayBalance({
            totalSupply: totalSupply,
            venueBalance: venueBalance,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            message: 'Distribution Information'
        });
    } catch (error) {
        console.error('Distribution check error:', error);
        alert('Error checking distribution: ' + error.message);
    }
}

function displayBalance(data) {
    console.log('Displaying balance data:', data);
    const resultDiv = document.getElementById('balanceResult');
    const detailsDiv = document.getElementById('balanceDetails');
    
    let html = '<div class="balance-info">';
    
    if (data.message) {
        html += `<div class="alert ${data.ticketBalance > 0 ? 'alert-success' : 'alert-error'}">${data.message}</div>`;
    }
    
    if (data.ethBalance) {
        html += `
            <div class="info-item">
                <h3>ETH Balance</h3>
                <div class="info-value">${data.ethBalance} ETH</div>
            </div>`;
    }
    
    if (data.tokenName) {
        html += `
            <div class="info-item">
                <h3>Token Name</h3>
                <div class="info-value">${data.tokenName}</div>
            </div>`;
    }
    
    if (data.tokenSymbol) {
        html += `
            <div class="info-item">
                <h3>Token Symbol</h3>
                <div class="info-value">${data.tokenSymbol}</div>
            </div>`;
    }
    
    if (data.ticketBalance !== undefined) {
        html += `
            <div class="info-item">
                <h3>Ticket Balance</h3>
                <div class="info-value">${data.ticketBalance} ${data.tokenSymbol || 'tickets'}</div>
            </div>`;
    }
    
    if (data.totalSupply !== undefined) {
        html += `
            <div class="info-item">
                <h3>Total Supply</h3>
                <div class="info-value">${data.totalSupply} ${data.tokenSymbol || 'tickets'}</div>
            </div>`;
    }
    
    if (data.venueBalance !== undefined) {
        html += `
            <div class="info-item">
                <h3>Venue Balance</h3>
                <div class="info-value">${data.venueBalance} ${data.tokenSymbol || 'tickets'}</div>
            </div>`;
    }
    
    html += '</div>';
    
    detailsDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    
    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .balance-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .info-item {
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-item h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.1em;
        }
        .info-value {
            font-size: 1.2em;
            color: #007bff;
            font-weight: bold;
            word-break: break-all;
        }
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 6px;
            font-weight: bold;
        }
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.checkBalance = checkBalance;
window.verifyTicket = verifyTicket;
window.checkDistribution = checkDistribution;
window.updateForm = updateForm;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initialize); 