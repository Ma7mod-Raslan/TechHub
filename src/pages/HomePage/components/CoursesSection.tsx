// src/features/public/components/CoursesSection.tsx

import React from 'react';

// بيانات وهمية للكورسات
const topCourses = [
    { title: 'Complete React.js Masterclass', instructor: 'Dr. Sarah Wilson', students: '17,500', rating: 4.8, level: 'Intermediate' },
    { title: 'Python for Data Science', instructor: 'Prof. Ahmed Khan', students: '8,900', rating: 4.9, level: 'Beginner' },
    { title: 'Machine Learning Fundamentals', instructor: 'Dr. Emily Chen', students: '5,600', rating: 4.7, level: 'Advanced' },
];

const CoursesSection: React.FC = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 text-center">
                
                {/* العنوان الرئيسي */}
                <div className="mb-12">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mb-4">
                        <span className="text-2xl">📖</span> 
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Explore Top Courses
                    </h2>
                    <p className="text-lg text-gray-600">
                        Discover our most popular courses and start learning today
                    </p>
                </div>

                {/* كروت الكورسات */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {topCourses.map((course, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-left transition duration-300 hover:shadow-2xl">
                            {/* Tags */}
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                                {course.level}
                            </span>
                            
                            {/* Rating */}
                            <div className="float-right text-yellow-500 font-bold flex items-center">
                                ★ {course.rating}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                by {course.instructor}
                            </p>
                            
                            <div className="text-gray-600 mb-6">
                                🧑‍🎓 {course.students} students
                            </div>

                            <button className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition duration-300">
                                View More
                            </button>
                        </div>
                    ))}
                </div>

                <button className="bg-transparent border border-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300">
                    Browse All Courses
                </button>
            </div>
        </section>
    );
};

export default CoursesSection;