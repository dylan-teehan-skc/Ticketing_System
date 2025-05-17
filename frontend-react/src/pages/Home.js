import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const eventDetails = {
        name: "Oasis: Ireland and UK Tour",
        date: "August 16, 2025",
        venue: "Three Arena, Dublin",
        description: "**OASIS ANNOUNCE THEIR FIRST UK AND IRELAND SHOWS IN SIXTEEN YEARS.** Oasis end years of feverish speculation with the confirmation of a long awaited run of UK and Ireland shows forming the domestic leg of their **OASIS LIVE 25** world tour. Oasis will hit **Cardiff, Manchester, London, Edinburgh and Dublin** in the summer of 2025. Their only shows in Europe next year, this will be one of the **biggest live moments and hottest tickets of the decade**.",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
    };

    const handleEventClick = () => {
        navigate('/buy-ticket', { state: { eventDetails } });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                            Find Your Next Experience
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Discover and book tickets for the best events in your area
                        </p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="mt-8 max-w-xl mx-auto">
                        <div className="flex rounded-lg shadow-sm">
                            <input
                                type="text"
                                placeholder="Search for events, venues, or artists"
                                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => navigate('/buy-ticket')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-r-lg text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Event */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Event</h2>
                <div 
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={handleEventClick}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative h-64 md:h-full">
                            <img
                                src={eventDetails.image}
                                alt={eventDetails.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold text-gray-900">{eventDetails.name}</h3>
                            <p className="mt-2 text-gray-600">{eventDetails.date}</p>
                            <p className="mt-1 text-gray-600">{eventDetails.venue}</p>
                            <p className="mt-4 text-gray-700">
                                {eventDetails.description.split('**').map((part, index) => 
                                    index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                                )}
                            </p>
                            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Buy Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Connect your wallet to start buying and selling tickets
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/wallet')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 