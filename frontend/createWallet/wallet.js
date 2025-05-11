// Wait for web3 to be initialized
async function initialize() {
    try {
        const initialized = await initWeb3();
        if (!initialized) {
            throw new Error('Failed to initialize Web3');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize Web3. Please make sure MetaMask is installed and connected.');
    }
}

async function createWallet() {
    if (!web3) {
        alert('Web3 is not initialized. Please try again.');
        return;
    }

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        // Create new account
        const account = web3.eth.accounts.create();
        
        // Encrypt private key with password
        const encryptedWallet = web3.eth.accounts.encrypt(account.privateKey, password);
        
        // Store wallet data in localStorage
        localStorage.setItem('wallet', JSON.stringify(encryptedWallet));
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', account.address);
        localStorage.setItem('walletType', 'local');
        
        // Display wallet details
        document.getElementById('walletAddress').textContent = account.address;
        document.getElementById('privateKey').textContent = account.privateKey;
        document.getElementById('network').textContent = 'Local Wallet';
        
        // Show wallet details section
        document.getElementById('createWalletForm').style.display = 'none';
        document.getElementById('connectWalletForm').style.display = 'none';
        document.getElementById('walletDetails').style.display = 'block';
        document.getElementById('privateKeyGroup').style.display = 'block';
        
        alert('Wallet created successfully! Please save your private key securely.');
    } catch (error) {
        console.error('Wallet creation error:', error);
        alert('Error creating wallet: ' + error.message);
    }
}

async function connectWallet() {
    try {
        const connected = await initWeb3();
        if (!connected) {
            throw new Error('Failed to connect to MetaMask');
        }

        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const chainId = await web3.eth.getChainId();
        
        // Display wallet details
        document.getElementById('walletAddress').textContent = accounts[0];
        document.getElementById('network').textContent = getNetworkName(chainId);
        
        // Show wallet details section
        document.getElementById('createWalletForm').style.display = 'none';
        document.getElementById('connectWalletForm').style.display = 'none';
        document.getElementById('walletDetails').style.display = 'block';
        document.getElementById('privateKeyGroup').style.display = 'none';
        
        // Store connected state
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
        localStorage.setItem('walletType', 'metamask');
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Error connecting wallet: ' + error.message);
    }
}

function disconnectWallet() {
    // Clear stored wallet data
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    localStorage.removeItem('wallet');
    
    // Reset UI
    document.getElementById('createWalletForm').style.display = 'block';
    document.getElementById('connectWalletForm').style.display = 'block';
    document.getElementById('walletDetails').style.display = 'none';
}

function downloadWallet() {
    const wallet = localStorage.getItem('wallet');
    if (!wallet) {
        alert('No wallet found to download!');
        return;
    }

    const blob = new Blob([wallet], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getNetworkName(chainId) {
    switch (chainId) {
        case 1:
            return 'Ethereum Mainnet';
        case 11155111:
            return 'Sepolia Testnet';
        default:
            return 'Unknown Network';
    }
}

// Check if wallet is already connected
window.onload = async function() {
    try {
        await initialize();
        const walletConnected = localStorage.getItem('walletConnected');
        const walletType = localStorage.getItem('walletType');
        
        if (walletConnected === 'true') {
            if (walletType === 'metamask') {
                const connected = await initWeb3();
                if (connected) {
                    const accounts = await web3.eth.getAccounts();
                    const chainId = await web3.eth.getChainId();
                    
                    document.getElementById('walletAddress').textContent = accounts[0];
                    document.getElementById('network').textContent = getNetworkName(chainId);
                    document.getElementById('privateKeyGroup').style.display = 'none';
                }
            } else if (walletType === 'local') {
                const wallet = JSON.parse(localStorage.getItem('wallet'));
                document.getElementById('walletAddress').textContent = wallet.address;
                document.getElementById('privateKey').textContent = 'Private key is encrypted';
                document.getElementById('network').textContent = 'Local Wallet';
                document.getElementById('privateKeyGroup').style.display = 'block';
            }
            
            document.getElementById('createWalletForm').style.display = 'none';
            document.getElementById('connectWalletForm').style.display = 'none';
            document.getElementById('walletDetails').style.display = 'block';
        }
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize wallet. Please try again.');
    }
}; 