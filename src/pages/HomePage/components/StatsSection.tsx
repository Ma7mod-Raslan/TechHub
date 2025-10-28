// src/features/public/components/StatsSection.tsx

import React from 'react';

// البيانات الوهمية
const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Courses' },
    { value: '200+', label: 'Instructors' },
];

const StatsSection: React.FC = () => {
    return (
        <section className="bg-white py-12">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex justify-around items-center text-center border-t border-b border-gray-200 py-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="w-1/3">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-1">
                                {stat.value}
                            </h2>
                            <p className="text-gray-500 font-medium">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;