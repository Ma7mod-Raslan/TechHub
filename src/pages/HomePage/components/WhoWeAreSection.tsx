// src/features/public/components/WhoWeAreSection.tsx

import React from 'react';

// بيانات وهمية لأعضاء الفريق
const teamMembers = [
    { name: 'Mahmoud Raslan', role: 'Co-founder & Lead Developer', avatar: '🧑' },
    { name: 'Toqa', role: 'Co-Founder & Product Manager', avatar: '👩' },
    { name: 'Basmala', role: 'Co-founder & UX Designer', avatar: '👧' },
];

const WhoWeAreSection: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-8 text-center">
                
                {/* العنوان الرئيسي والآيقونة */}
                <div className="mb-12">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center bg-green-50 rounded-full mb-4">
                        <span className="text-2xl">👥</span> 
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Who We Are
                    </h2>
                    <p className="text-gray-600 max-w-4xl mx-auto mb-8">
                        We are a dedicated team of 3 members — 1 boy and 2 girls — passionate about education and technology. Our platform brings together expert instructors and motivated learners in a collaborative environment designed for success...
                    </p>
                </div>

                {/* كروت الفريق */}
                <div className="flex justify-center space-x-8">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="w-64">
                            {/* مكان الصورة/Avatar */}
                            <div className="mx-auto w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl mb-4">
                                {member.avatar} 
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">
                                {member.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                                {member.role}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhoWeAreSection;