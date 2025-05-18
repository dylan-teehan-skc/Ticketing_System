import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const TransferTicket = () => {
    const { web3, contract, account } = useWeb3();
    const [ticketAmount, setTicketAmount] = useState(1);
    const [currentBalance, setCurrentBalance] = useState('0');
    const [ticketPrice, setTicketPrice] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [contractEthBalance, setContractEthBalance] = useState('0');

    useEffect(() => {
        const loadData = async () => {
            if (contract && account && web3) {
                try {
                    const [balance, price, contractBalance] = await Promise.all([
                        contract.methods.balanceOf(account).call(),
                        contract.methods.ticketPrice().call(),
                        web3.eth.getBalance(contract._address)
                    ]);
                    setCurrentBalance(balance);
                    setTicketPrice(web3.utils.fromWei(price, 'ether'));
                    setContractEthBalance(web3.utils.fromWei(contractBalance, 'ether'));
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }
        };

        loadData();
    }, [contract, account, web3]);

    const transferTickets = async () => {
        if (!web3 || !contract || !account) {
            setError('Web3 or contract not initialized');
            return;
        }

        if (ticketAmount <= 0) {
            setError('Please enter a valid number of tickets');
            return;
        }

        if (parseInt(ticketAmount) > parseInt(currentBalance)) {
            setError('Insufficient ticket balance');
            return;
        }

        setLoading(true);
        setError(null);
        setTransactionStatus('Processing return...');

        let pollInterval;
        try {
            const refundAmount = (parseFloat(ticketPrice) * ticketAmount).toFixed(4);
            const tx = await contract.methods.sellTicket(ticketAmount).send({ from: account });
            
            // Update UI immediately after transaction is sent
            setTransactionStatus(`Transaction sent! Waiting for confirmation...`);
            
            // Start polling for transaction receipt
            const startTime = Date.now();
            pollInterval = setInterval(async () => {
                try {
                    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
                    if (receipt) {
                        clearInterval(pollInterval);
                        if (receipt.status) {
                            // Update balance and show success message
                            const newBalance = await contract.methods.balanceOf(account).call();
                            setCurrentBalance(newBalance);
                            setTransactionStatus(`Tickets successfully returned! You will receive ${refundAmount} ETH as a refund.`);
                            
                            // Update contract balance
                            const newContractBalance = await web3.eth.getBalance(contract._address);
                            setContractEthBalance(web3.utils.fromWei(newContractBalance, 'ether'));
                        } else {
                            setError('Transaction failed. Please check MetaMask or Etherscan for details.');
                        }
                        setLoading(false);
                    } else if (Date.now() - startTime > 60000) { // 1 minute timeout
                        clearInterval(pollInterval);
                        setTransactionStatus('Transaction is taking longer than expected. Please check MetaMask or Etherscan to confirm if your ticket was returned.');
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Error checking transaction:', err);
                    clearInterval(pollInterval);
                    setError('Error checking transaction status. Please check MetaMask or Etherscan.');
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
            console.error('Return error:', error);
            const message = error?.message || '';
            if (message.includes('user rejected')) {
                setError('Transaction was rejected by the user.');
            } else if (message.includes('Amount must be greater than 0')) {
                setError('You must return at least 1 ticket.');
            } else if (message.includes('Insufficient tickets')) {
                setError('You do not have enough tickets to return this amount.');
            } else if (message.includes('Contract has insufficient funds')) {
                setError('The contract does not have enough ETH to refund you. Please contact the event organizer.');
            } else if (message.includes('Payment transfer failed')) {
                setError('Refund payment failed. Please try again or contact support.');
            } else if (message.includes('insufficient funds')) {
                setError('Your wallet does not have enough ETH to pay for gas.');
            } else {
                if (!message.includes('Failed to check for transaction receipt')) {
                    setError('Error returning tickets: ' + message);
                }
            }
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-center">Return Tickets</h1>

                {account && (
                    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-green-800">Connected with Wallet</h3>
                        </div>
                        <label className="block text-sm font-medium text-green-800 mb-1">Wallet Address</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={account}
                                readOnly
                                className="bg-white border border-gray-300 rounded px-2 py-1 font-mono text-gray-800 w-full focus:outline-none text-s"
                                style={{ minWidth: '0' }}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(account);
                                    alert('Address copied to clipboard!');
                                }}
                                className="ml-2 px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}

                <div className="card space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                            <span className="font-medium">Your Current Balance:</span>{' '}
                            <span className="font-mono">{currentBalance} tickets</span>
                        </p>
                        <p className="text-gray-700 mt-2">
                            <span className="font-medium">Refund Amount:</span>{' '}
                            <span className="font-mono">{(parseFloat(ticketPrice) * ticketAmount).toFixed(4)} ETH</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Tickets to Return
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={ticketAmount}
                            onChange={(e) => setTicketAmount(parseInt(e.target.value))}
                            className="input"
                        />
                    </div>

                    <button
                        onClick={transferTickets}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Return Tickets'}
                    </button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {transactionStatus && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Transaction Status</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>{transactionStatus}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-xs z-50">
                <div className="mb-1"><span className="font-semibold">Contract ETH Balance:</span> {contractEthBalance} ETH</div>
                <div><span className="font-semibold">Your Ticket Balance:</span> {currentBalance}</div>
            </div>
        </div>
    );
};

export default TransferTicket; 