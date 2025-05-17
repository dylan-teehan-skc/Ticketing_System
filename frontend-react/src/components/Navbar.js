import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', text: 'Home' },
        { path: '/wallet', text: 'Wallet' },
        { path: '/balance', text: 'Check Balance' },
        { path: '/buy-ticket', text: 'Buy Ticket' },
        { path: '/transfer', text: 'Return Ticket' }
    ];

    return (
        <nav className="bg-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <h1 className="text-2xl font-bold text-white">
                            Blockchain Ticketing System
                        </h1>
                    </div>
                    <div className="flex space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    location.pathname === item.path
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-primary-600 hover:text-white'
                                }`}
                            >
                                {item.text}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 