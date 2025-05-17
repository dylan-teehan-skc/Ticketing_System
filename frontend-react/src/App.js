import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Wallet from './pages/Wallet';
import CheckBalance from './pages/CheckBalance';
import TransferTicket from './pages/TransferTicket';
import BuyTicket from './pages/BuyTicket';

const App = () => {
    return (
        <Web3Provider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route path="/balance" element={<CheckBalance />} />
                            <Route path="/transfer" element={<TransferTicket />} />
                            <Route path="/buy-ticket" element={<BuyTicket />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </Web3Provider>
    );
};

export default App; 