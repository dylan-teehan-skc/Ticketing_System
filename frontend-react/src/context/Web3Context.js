import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const TICKET_TOKEN_ADDRESS = '0x4f48d5e57b0c9D8a9c17393358B013db34d04ae6';
    const TICKET_TOKEN_ABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_maxSupply",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_ticketPrice",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "oldMaxSupply",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "newMaxSupply",
                    "type": "uint256"
                }
            ],
            "name": "MaxSupplyChanged",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "active",
                    "type": "bool"
                }
            ],
            "name": "SalesStatusChanged",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "newPrice",
                    "type": "uint256"
                }
            ],
            "name": "TicketPriceChanged",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "TicketPurchased",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "TicketReturned",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "buyTicket",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "maxSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "sellTicket",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bool",
                    "name": "_active",
                    "type": "bool"
                }
            ],
            "name": "setSalesStatus",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_newPrice",
                    "type": "uint256"
                }
            ],
            "name": "setTicketPrice",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "salesActive",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "ticketPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdrawFunds",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ];

    const connectWithMetaMask = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3Instance = new Web3(window.ethereum);
                const contractInstance = new web3Instance.eth.Contract(TICKET_TOKEN_ABI, TICKET_TOKEN_ADDRESS);
                
                setWeb3(web3Instance);
                setContract(contractInstance);
                setAccount(accounts[0]);
                setError(null);
                
                return accounts[0];
            } else {
                throw new Error('MetaMask not installed');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const connectWithKeystore = async (keystoreFile, password) => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is required to connect');
            }

            // Parse the keystore JSON if it's a string
            const keystore = typeof keystoreFile === 'string' ? JSON.parse(keystoreFile) : keystoreFile;
            
            // Initialize Web3 with MetaMask provider
            const web3Instance = new Web3(window.ethereum);
            
            // Decrypt the keystore
            const account = await web3Instance.eth.accounts.decrypt(keystore, password);
            
            // Set up contract instance
            const contractInstance = new web3Instance.eth.Contract(TICKET_TOKEN_ABI, TICKET_TOKEN_ADDRESS);
            
            // Store wallet data in localStorage
            localStorage.setItem('wallet', JSON.stringify(keystore));
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', account.address);
            localStorage.setItem('walletType', 'keystore');
            localStorage.setItem('walletPassword', password);
            
            setWeb3(web3Instance);
            setContract(contractInstance);
            setAccount(account.address);
            setError(null);
            
            return {
                address: account.address,
                type: 'keystore'
            };
        } catch (error) {
            console.error('Keystore connection error:', error);
            setError(error.message);
            throw new Error('Invalid keystore file or password');
        }
    };

    const createWallet = async (password) => {
        try {
            // Create a new Web3 instance with a provider
            const web3Instance = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
            const account = web3Instance.eth.accounts.create();
            const keystore = await web3Instance.eth.accounts.encrypt(account.privateKey, password);
            
            // Store wallet data in localStorage
            localStorage.setItem('wallet', JSON.stringify(keystore));
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', account.address);
            localStorage.setItem('walletType', 'local');
            
            // Set up contract instance
            const contractInstance = new web3Instance.eth.Contract(TICKET_TOKEN_ABI, TICKET_TOKEN_ADDRESS);
            
            setWeb3(web3Instance);
            setContract(contractInstance);
            setAccount(account.address);
            setError(null);
            
            return {
                address: account.address,
                privateKey: account.privateKey,
                keystore: keystore
            };
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const buyTickets = async (amount) => {
        try {
            const price = await contract.methods.ticketPrice().call();
            const totalCost = web3.utils.toBN(price).mul(web3.utils.toBN(amount));
            
            const result = await contract.methods.buyTicket()
                .send({ 
                    from: account,
                    value: totalCost.toString()
                });
            
            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const sellTickets = async (amount) => {
        try {
            const result = await contract.methods.sellTicket(amount)
                .send({ from: account });
            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const getTicketPrice = async () => {
        try {
            const price = await contract.methods.ticketPrice().call();
            return web3.utils.fromWei(price, 'ether');
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const getBalance = async () => {
        try {
            const balance = await contract.methods.balanceOf(account).call();
            return balance;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const walletType = localStorage.getItem('walletType');
                const walletConnected = localStorage.getItem('walletConnected');

                if (walletConnected === 'true' && window.ethereum) {
                    if (walletType === 'metamask') {
                        await connectWithMetaMask();
                    } else if (walletType === 'local' || walletType === 'keystore') {
                        // Initialize Web3 with MetaMask provider
                        const web3Instance = new Web3(window.ethereum);
                        const contractInstance = new web3Instance.eth.Contract(TICKET_TOKEN_ABI, TICKET_TOKEN_ADDRESS);
                        const walletAddress = localStorage.getItem('walletAddress');
                        
                        // If it's a keystore wallet, we need to decrypt it
                        if (walletType === 'keystore') {
                            const keystore = JSON.parse(localStorage.getItem('wallet'));
                            const account = await web3Instance.eth.accounts.decrypt(keystore, localStorage.getItem('walletPassword'));
                            setAccount(account.address);
                        } else {
                            setAccount(walletAddress);
                        }
                        
                        setWeb3(web3Instance);
                        setContract(contractInstance);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize Web3:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const value = {
        web3,
        account,
        contract,
        loading,
        error,
        connectWithMetaMask,
        connectWithKeystore,
        createWallet,
        buyTickets,
        sellTickets,
        getTicketPrice,
        getBalance
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
}; 