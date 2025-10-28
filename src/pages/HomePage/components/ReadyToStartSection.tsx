// src/features/public/components/ReadyToStartSection.tsx

import React from 'react';

const ReadyToStartSection: React.FC = () => {
    return (
        <section className="bg-gradient-to-r from-blue-700 to-purple-800 py-20 text-white">
            <div className="container mx-auto px-4 md:px-8 text-center">
                <h2 className="text-4xl font-extrabold mb-4">
                    Ready to Start Learning?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                    Join our community today and take the first step toward achieving your goals
                </p>
                
                <div className="flex justify-center space-x-4">
                    {/* زر Sign Up Now */}
                    <button className="bg-white text-purple-700 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-200 transition duration-300">
                        Sign Up Now
                    </button>
                    {/* زر Start Teaching */}
                    <button className="bg-transparent border border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-purple-700 transition duration-300">
                        Start Teaching
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReadyToStartSection;