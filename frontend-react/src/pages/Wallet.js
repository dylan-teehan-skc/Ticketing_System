import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
    const { web3, connectWithMetaMask, createWallet, connectWithKeystore, account } = useWeb3();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [keystoreFile, setKeystoreFile] = useState(null);
    const [keystorePassword, setKeystorePassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newWalletDetails, setNewWalletDetails] = useState(null);
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    const handleCreateWallet = async () => {
        setError('');
        setLoading(true);

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            setLoading(false);
            return;
        }

        try {
            const walletDetails = await createWallet(password);
            setNewWalletDetails(walletDetails);
            alert('Wallet created successfully! Please save your private key and keystore file securely.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectMetaMask = async () => {
        setError('');
        setLoading(true);
        try {
            await connectWithMetaMask();
            alert('Successfully connected to MetaMask!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeystoreUpload = async () => {
        setError('');
        setLoading(true);

        if (!keystoreFile) {
            setError('Please select a keystore file');
            setLoading(false);
            return;
        }

        if (!keystorePassword) {
            setError('Please enter your keystore password');
            setLoading(false);
            return;
        }

        try {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                try {
                    const keystore = JSON.parse(e.target.result);
                    await connectWithKeystore(keystore, keystorePassword);
                    alert('Successfully connected with keystore!');
                } catch (err) {
                    console.error('Keystore upload error:', err);
                    setError('Invalid keystore file or password');
                } finally {
                    setLoading(false);
                }
            };
            fileReader.onerror = () => {
                setError('Error reading keystore file');
                setLoading(false);
            };
            fileReader.readAsText(keystoreFile);
        } catch (err) {
            console.error('File handling error:', err);
            setError('Error processing keystore file');
            setLoading(false);
        }
    };

    const downloadKeystore = () => {
        const wallet = localStorage.getItem('wallet');
        if (!wallet) return;
        
        const blob = new Blob([wallet], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet_${account.substring(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Wallet Management
                    </h1>
                </div>

                {/* Connection Status and Details */}
                {account && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-green-800">
                                        Connected with Wallet
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">MetaMask Address</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        value={account}
                                        readOnly
                                        className="flex-1 block w-full rounded-md border-gray-300 bg-white"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(account)}
                                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {newWalletDetails && (
                                <>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">New Wallet Address</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                value={newWalletDetails.address}
                                                readOnly
                                                className="flex-1 block w-full rounded-md border-gray-300 bg-white"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(newWalletDetails.address)}
                                                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">Private Key</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type={showPrivateKey ? "text" : "password"}
                                                value={newWalletDetails.privateKey}
                                                readOnly
                                                className="flex-1 block w-full rounded-md border-gray-300 bg-white"
                                            />
                                            <button
                                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                {showPrivateKey ? 'Hide' : 'Show'}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(newWalletDetails.privateKey)}
                                                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <p className="mt-2 text-sm text-red-600">
                                            ⚠️ Important: Save this private key securely. It cannot be recovered if lost!
                                        </p>
                                    </div>
                                </>
                            )}

                            {localStorage.getItem('walletType') === 'local' && (
                                <div className="mt-4">
                                    <button
                                        onClick={downloadKeystore}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Download Keystore File
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Top Row: Create Wallet and MetaMask */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Create New Wallet Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create New Wallet</h2>
                            <div className="space-y-4">
                                {error && error.includes('Password') && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter a password for the Key Store"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Confirm password"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateWallet}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Wallet'}
                                </button>
                            </div>
                        </div>

                        {/* Connect MetaMask Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Connect MetaMask</h2>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                {error && error.includes('MetaMask') && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4 w-full">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                    alt="MetaMask Logo"
                                    className="h-24 w-24"
                                />
                                <p className="text-gray-600 text-center">
                                    Connect your existing MetaMask wallet to manage your tickets
                                </p>
                                <button
                                    onClick={handleConnectMetaMask}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                                >
                                    {loading ? 'Connecting...' : 'Connect MetaMask'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Upload Keystore */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Upload Keystore</h2>
                        <div className="max-w-xl mx-auto space-y-4">
                            {error && error.includes('keystore') && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label htmlFor="keystoreFile" className="block text-sm font-medium text-gray-700">
                                    Keystore File
                                </label>
                                <input
                                    type="file"
                                    id="keystoreFile"
                                    accept=".json"
                                    onChange={(e) => setKeystoreFile(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="keystorePassword" className="block text-sm font-medium text-gray-700">
                                    Keystore Password
                                </label>
                                <input
                                    type="password"
                                    id="keystorePassword"
                                    value={keystorePassword}
                                    onChange={(e) => setKeystorePassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter your keystore password"
                                />
                            </div>
                            <button
                                onClick={handleKeystoreUpload}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? 'Connecting...' : 'Upload Keystore'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet; 