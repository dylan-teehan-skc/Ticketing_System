import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const CheckBalance = () => {
    const { web3, contract, account } = useWeb3();
    const [userType, setUserType] = useState('attendee');
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [balanceData, setBalanceData] = useState(null);
    const [error, setError] = useState(null);
    const [venueStats, setVenueStats] = useState(null);

    useEffect(() => {
        if (account) {
            setWalletAddress(account);
        }
    }, [account]);

    const checkBalance = async () => {
        if (!web3 || !contract) {
            setError('Web3 or contract not initialized');
            return;
        }

        if (userType !== 'venue' && !web3.utils.isAddress(walletAddress)) {
            setError('Invalid wallet address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (userType === 'venue') {
                // Get total supply and max supply
                const maxSupply = await contract.methods.maxSupply().call();
                const ticketPrice = await contract.methods.ticketPrice().call();

                // Get contract's balance (remaining tickets)
                const contractBalance = await contract.methods.balanceOf(contract._address).call();
                const remainingTickets = Number(contractBalance);
                
                // Calculate tickets sold (maxSupply - remaining tickets)
                const ticketsSold = Number(maxSupply) - remainingTickets;

                // Calculate percentage sold
                const percentageSold = (ticketsSold / Number(maxSupply) * 100).toFixed(1);

                // Calculate total revenue
                const totalRevenue = web3.utils.toBN(ticketPrice)
                    .mul(web3.utils.toBN(ticketsSold));

                setVenueStats({
                    totalSupply: ticketsSold,
                    maxSupply,
                    percentageSold,
                    totalRevenue: web3.utils.fromWei(totalRevenue, 'ether'),
                    ticketsRemaining: remainingTickets
                });
            } else if (userType === 'attendee') {
                // Get ETH balance
                const ethBalance = await web3.eth.getBalance(walletAddress);
                
                // Get ticket balance
                const ticketBalance = await contract.methods.balanceOf(walletAddress).call();
                
                // Get ticket price and calculate total value
                const ticketPrice = await contract.methods.ticketPrice().call();
                const totalValue = web3.utils.toBN(ticketPrice)
                    .mul(web3.utils.toBN(ticketBalance));

                setBalanceData({
                    ethBalance: web3.utils.fromWei(ethBalance, 'ether'),
                    ticketBalance,
                    totalValue: web3.utils.fromWei(totalValue, 'ether')
                });
            } else if (userType === 'doorman') {
                const ticketBalance = await contract.methods.balanceOf(walletAddress).call();
                const ticketCount = parseInt(ticketBalance);
                
                setBalanceData({
                    ticketCount,
                    isValid: ticketCount > 0
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-center mb-8">Check Balance</h1>

                <div className="card space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Your Role
                        </label>
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="input"
                        >
                            <option value="attendee">Event Attendee</option>
                            <option value="doorman">Doorman</option>
                            <option value="venue">Venue</option>
                        </select>
                    </div>

                    {userType !== 'venue' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Wallet Address
                            </label>
                            <input
                                type="text"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                placeholder="0x..."
                                className="input"
                            />
                        </div>
                    )}

                    <button
                        onClick={checkBalance}
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Checking...' : 'Check Balance'}
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

                    {venueStats && userType === 'venue' && (
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Tickets Remaining</h3>
                                    <p className="text-2xl font-bold text-primary-600">{venueStats.ticketsRemaining}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Tickets Sold</h3>
                                    <p className="text-2xl font-bold text-primary-600">{Number(venueStats.maxSupply) - Number(venueStats.ticketsRemaining)}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Maximum Supply</h3>
                                    <p className="text-2xl font-bold text-primary-600">{venueStats.maxSupply}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Percentage Sold</h3>
                                    <p className="text-2xl font-bold text-primary-600">{venueStats.percentageSold}%</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                                    <p className="text-2xl font-bold text-primary-600">{venueStats.totalRevenue} ETH</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {balanceData && userType !== 'venue' && (
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            {userType === 'attendee' && (
                                <>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-medium text-gray-900">ETH Balance</h3>
                                        <p className="text-2xl font-bold text-primary-600">{balanceData.ethBalance} ETH</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-medium text-gray-900">Ticket Balance</h3>
                                        <p className="text-2xl font-bold text-primary-600">{balanceData.ticketBalance} tickets</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-medium text-gray-900">Total Value</h3>
                                        <p className="text-2xl font-bold text-primary-600">{balanceData.totalValue} ETH</p>
                                    </div>
                                </>
                            )}

                            {userType === 'doorman' && (
                                <div className={`p-4 rounded-lg ${balanceData.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {balanceData.isValid ? (
                                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {balanceData.isValid ? 'Valid Ticket Holder' : 'No Tickets Found'}
                                            </h3>
                                            <p className="text-2xl font-bold text-primary-600">
                                                {balanceData.ticketCount} tickets
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckBalance; 