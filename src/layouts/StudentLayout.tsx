import React from 'react';
import { Outlet } from 'react-router-dom';

const StudentLayout: React.FC = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar (Placeholder) */}
            <aside className="w-64 bg-white shadow-xl p-4 flex flex-col space-y-4">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Student Panel</h1>
                <nav className="space-y-2">
                    <div className="text-gray-700 hover:text-blue-500 cursor-pointer">Dashboard</div>
                    <div className="text-gray-700 hover:text-blue-500 cursor-pointer">My Courses</div>
                    <div className="text-gray-700 hover:text-blue-500 cursor-pointer">Community</div>
                    <div className="text-gray-700 hover:text-blue-500 cursor-pointer">Settings</div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Header (Placeholder) */}
                <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-xl font-semibold">Welcome Back, Student!</h2>
                    <div className="text-gray-500">Notifications | Profile</div>
                </header>
                
                <main className="p-4 md:p-6 2xl:p-10 flex-1">
                    {/* هنا سيتم عرض محتوى الصفحة الحالية (Dashboard, My Courses, إلخ) */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
