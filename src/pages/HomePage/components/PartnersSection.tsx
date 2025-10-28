// src/features/public/components/PartnersSection.tsx

import React from 'react';

// بيانات وهمية للشركاء
const partners = [
    { name: 'TechCorp', logo: 'TC' },
    { name: 'InnovateLabs', logo: 'IL' },
    { name: 'DataSystems', logo: 'DS' },
    { name: 'CloudFirst', logo: 'CF' },
    { name: 'AI Solutions', logo: 'AI' },
    { name: 'DevHub', logo: 'DH' },
];

const PartnersSection: React.FC = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 text-center">
                
                {/* العنوان الرئيسي */}
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                    Our Partners
                </h2>
                <p className="text-xl text-gray-600 mb-12">
                    Trusted by leading organizations worldwide
                </p>

                {/* شعارات الشركاء (Logos Grid) */}
                <div className="flex justify-center flex-wrap gap-8">
                    {partners.map((partner, index) => (
                        <div key={index} className="w-28 h-28 flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-md">
                            {/* مكان اللوجو (تم وضع اختصار اسم الشركة مؤقتاً) */}
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full text-xl font-bold text-gray-600 mb-2">
                                {partner.logo}
                            </div>
                            <p className="text-sm text-gray-500">{partner.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PartnersSection;