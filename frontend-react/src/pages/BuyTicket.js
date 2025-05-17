import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useLocation } from 'react-router-dom';

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    balanceContainer: {
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
        color: '#2c3e50',
        marginBottom: '30px',
        textAlign: 'center',
        fontSize: '2em',
    },
    eventDetails: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    eventTitle: {
        color: '#2c3e50',
        marginBottom: '10px',
        fontSize: '1.8em',
    },
    eventDate: {
        color: '#666',
        margin: '5px 0',
    },
    eventVenue: {
        color: '#666',
        margin: '5px 0',
    },
    eventDescription: {
        color: '#444',
        marginTop: '15px',
        lineHeight: '1.5',
    },
    ticketPurchase: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    priceInfo: {
        marginBottom: '20px',
    },
    priceText: {
        color: '#2c3e50',
        fontSize: '1.2em',
    },
    amountSelector: {
        marginBottom: '20px',
    },
    amountLabel: {
        display: 'block',
        marginBottom: '8px',
        color: '#2c3e50',
    },
    amountInput: {
        width: '100px',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1em',
    },
    totalPrice: {
        margin: '20px 0',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '4px',
    },
    totalText: {
        color: '#2c3e50',
        fontSize: '1.2em',
    },
    buyButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1.1em',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    buyButtonDisabled: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
    },
    errorMessage: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        textAlign: 'center',
    },
    successMessage: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '4px',
        textAlign: 'center',
    },
};

const BuyTicket = () => {
    const { web3, account, contract, buyTickets, getTicketPrice } = useWeb3();
    const [ticketPrice, setTicketPrice] = useState('0');
    const [amount, setAmount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const location = useLocation();
    const eventDetails = location.state?.eventDetails || {
        name: "Oasis: Ireland and UK Tour",
        date: "August 16, 2025",
        venue: "Three Arena, Dublin",
        description: "**OASIS ANNOUNCE THEIR FIRST UK AND IRELAND SHOWS IN SIXTEEN YEARS.** Oasis end years of feverish speculation with the confirmation of a long awaited run of UK and Ireland shows forming the domestic leg of their **OASIS LIVE 25** world tour. Oasis will hit **Cardiff, Manchester, London, Edinburgh and Dublin** in the summer of 2025. Their only shows in Europe next year, this will be one of the **biggest live moments and hottest tickets of the decade**."
    };

    useEffect(() => {
        const fetchTicketPrice = async () => {
            try {
                const price = await getTicketPrice();
                setTicketPrice(price);
            } catch (error) {
                console.error('Error fetching ticket price:', error);
                setError('Failed to fetch ticket price');
            }
        };

        fetchTicketPrice();
    }, [getTicketPrice]);

    const handleBuyTickets = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            setTransactionStatus('Processing purchase...');
            
            const tx = await buyTickets(amount);
            
            // Start polling for transaction receipt
            const startTime = Date.now();
            const pollInterval = setInterval(async () => {
                try {
                    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
                    if (receipt) {
                        clearInterval(pollInterval);
                        if (receipt.status) {
                            setSuccess(true);
                            setTransactionStatus('Tickets purchased successfully!');
                        } else {
                            setError('Transaction failed. Please check MetaMask or Etherscan for details.');
                        }
                        setLoading(false);
                    } else if (Date.now() - startTime > 60000) { // 1 minute timeout
                        clearInterval(pollInterval);
                        setError('Transaction is taking longer than expected. Please check MetaMask or Etherscan to confirm if your purchase was successful.');
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Error checking transaction:', err);
                }
            }, 2000); // Check every 2 seconds

        } catch (error) {
            console.error('Error buying tickets:', error);
            const message = error?.message || '';
            if (message.includes('user rejected')) {
                setError('Transaction was rejected by the user.');
            } else if (message.includes('insufficient funds')) {
                setError('Insufficient ETH balance to complete the purchase');
            } else if (message.includes('gas required exceeds allowance')) {
                setError('Insufficient gas to complete the transaction');
            } else {
                setError('Error purchasing tickets: ' + message);
            }
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-center mb-1 mt-10">Buy Tickets</h1>
            <div style={styles.container}>
                {account && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
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
                <div style={styles.balanceContainer}>
                    <div style={styles.eventDetails}>
                        <h2 style={styles.eventTitle}>{eventDetails.name}</h2>
                        <p style={styles.eventDate}>{eventDetails.date}</p>
                        <p style={styles.eventVenue}>{eventDetails.venue}</p>
                        <p style={styles.eventDescription}>
                            {eventDetails.description.split('**').map((part, index) => 
                                index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                            )}
                        </p>
                    </div>

                    <div style={styles.ticketPurchase}>
                        <div style={styles.priceInfo}>
                            <h3 style={styles.priceText}>Ticket Price: {ticketPrice} ETH</h3>
                        </div>

                        <div style={styles.amountSelector}>
                            <label htmlFor="amount" style={styles.amountLabel}>Number of Tickets:</label>
                            <input
                                type="number"
                                id="amount"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(parseInt(e.target.value))}
                                style={styles.amountInput}
                            />
                        </div>

                        <div style={styles.totalPrice}>
                            <h3 style={styles.totalText}>Total: {(parseFloat(ticketPrice) * amount).toFixed(4)} ETH</h3>
                        </div>

                        <button 
                            style={{
                                ...styles.buyButton,
                                ...(loading || !account ? styles.buyButtonDisabled : {})
                            }}
                            onClick={handleBuyTickets}
                            disabled={loading || !account}
                        >
                            {loading ? 'Processing...' : 'Buy Tickets'}
                        </button>

                        {transactionStatus && (
                            <div style={{
                                ...styles.successMessage,
                                backgroundColor: '#e3f2fd',
                                color: '#0d47a1'
                            }}>
                                {transactionStatus}
                            </div>
                        )}

                        {error && (
                            <div style={styles.errorMessage}>
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div style={styles.successMessage}>
                                Tickets purchased successfully! Your tickets have been added to your wallet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyTicket; 