// src/features/public/components/MissionSection.tsx

import React from 'react';

// بيانات وهمية لـ Our Mission
const missionItems = [
    { 
        icon: '📚', // استبدلي هذا بـIcon Component حقيقي (مثلاً من Lucide/Feather)
        title: 'Interactive Learning',
        description: 'Hands-on exercises and real-world projects to build practical skills that employers value.'
    },
    { 
        icon: '🏅',
        title: 'Earn Certificates',
        description: 'Receive industry-recognized certificates upon course completion to showcase your expertise.'
    },
    { 
        icon: '📈',
        title: 'Career Growth',
        description: 'Learn in-demand skills that help you advance your career and increase your earning potential.'
    },
];

const MissionSection: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-8 text-center">
                
                {/* العنوان الرئيسي والآيقونة */}
                <div className="mb-12">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mb-4">
                        <span className="text-2xl">🎯</span> {/* آيقونة Our Mission */}
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Our Mission
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Empowering learners worldwide to achieve their career goals through accessible, high-quality education
                    </p>
                </div>

                {/* كروت الرسالة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {missionItems.map((item, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
                            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg mb-4 text-2xl">
                                {item.icon} 
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {item.title}
                            </h3>
                            <p className="text-gray-500">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MissionSection;