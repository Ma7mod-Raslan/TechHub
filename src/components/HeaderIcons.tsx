import { Bell, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { UserRole } from '../App';
import { NavigateFn } from '../types/Navigation';

interface HeaderIconsProps {
  userRole: UserRole;
  navigate: NavigateFn;
  logout: () => void;
  currentPage?: string;
}

export default function HeaderIcons({ navigate, logout, userRole, currentPage }: HeaderIconsProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {

    const fetchUnread = async () => {
      try {

        const token = localStorage.getItem("accessToken");

        const res = await fetch(
          "${API_URL}/api/notifications/unread-count",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        setUnreadCount(data.unread);

      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();

  }, []);

  // Smart visibility: hide notifications icon when on notifications page
  const showNotifications = currentPage !== 'notifications';

  // Smart visibility: hide Profile/Settings options when on respective pages
  const showProfileOption = currentPage !== 'profile';
  const showSettingsOption = currentPage !== 'settings';

  return (
    <div className="flex items-center gap-2">
      {/* Notifications Bell - hidden when on notifications page */}
      {showNotifications && (
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 transition-all duration-300"
          onClick={() => {
            if (userRole === 'instructor') navigate('instructor-notifications');
            else if (userRole === 'student') navigate('student-notifications');
            else if (userRole === 'admin') navigate('admin-notifications');
          }}
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white">
            {unreadCount}
          </Badge>
        </Button>
      )}

      {/* Profile Icon with Dropdown */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gradient-to-r hover:from-violet-100 hover:to-cyan-100 transition-all duration-300 group"
          title="Profile"
        >
          <User className="h-5 w-5 text-gray-700 group-hover:text-violet-600" />
          <ChevronDown className="h-4 w-4 text-gray-700 group-hover:text-violet-600" />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20"
              >
                {/* Profile option - hidden when on profile page */}
                {showProfileOption && (
                  <button
                    onClick={() => {
                      if (userRole === 'student') navigate('student-profile');
                      else if (userRole === 'instructor') navigate('instructor-profile');
                      else if (userRole === 'admin') navigate('admin-profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                )}

                {/* Settings option - hidden when on settings page, shown for students and instructors */}
                {showSettingsOption && (userRole === 'student' || userRole === 'instructor') && (
                  <button
                    onClick={() => {
                      if (userRole === 'student') navigate('student-settings');
                      else if (userRole === 'instructor') navigate('instructor-settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                )}

                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}