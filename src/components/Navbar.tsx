import { useState } from 'react';
import { Search, Bell, User, Menu, Code2, Settings, ChevronDown, LogOut, X, Home, BookOpen, Info, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';
import { useNavigate } from 'react-router-dom';
import HeaderIcons from "./HeaderIcons";

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: UserRole;
  transparent?: boolean;
  logout?: () => void;
}


export default function Navbar({ isLoggedIn = false, userRole = 'guest', transparent = false, logout }: NavbarProps) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const menuLinks =
    userRole === 'admin'
      ? []
      : [
        { label: 'Home', page: '/', icon: Home },
        { label: 'Courses', page: '/courses', icon: BookOpen },
        { label: 'About', page: '/about', icon: Info },
        { label: 'Contact', page: '/contact', icon: Mail },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 border-b ${transparent ? 'bg-white/80 backdrop-blur-lg' : 'bg-white'
        }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (userRole === 'admin') navigate('/admin/dashboard');
              else if (userRole === 'instructor') navigate('/');
              else if (userRole === 'student') navigate('/');
              else navigate('/');
            }}
          >
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl">
              <Code2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="text-lg md:text-xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              TechHub
            </span>
          </motion.div>

          {/* Desktop Navigation Links - Between Logo and Search */}
          <div className="hidden lg:flex items-center gap-1">
            {menuLinks.map((link) => (
              <Button
                key={link.page}
                variant="ghost"
                onClick={() => navigate(link.page)}
                className="flex items-center gap-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            ))}
          </div>


          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="transition-all duration-300 hidden sm:flex"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <HeaderIcons logout={logout!} userRole={userRole} />
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search - Show below on mobile */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t bg-white overflow-hidden sm:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Menu Links */}
              {menuLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    navigate(link.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors"
                >
                  <link.icon className="h-5 w-5 text-gray-600" />
                  <span>{link.label}</span>
                </button>
              ))}

              {isLoggedIn && (
                <>
                  <div className="border-t my-2" />

                  {/* Mobile notifications */}
                  <button
                    onClick={() => {
                      if (userRole === 'instructor') navigate('/instructor/notifications');
                      else if (userRole === 'student') navigate('/student/notifications');
                      else if (userRole === 'admin') navigate('/admin/notifications');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors"
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span>Notifications</span>
                    <Badge className="ml-auto bg-red-500">3</Badge>
                  </button>

                  {/* Mobile profile */}
                  <button
                    onClick={() => {
                      if (userRole === 'instructor') navigate('/instructor/profile');
                      else if (userRole === 'student') navigate('/student/profile');
                      else if (userRole === 'admin') navigate('/admin/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span>Profile</span>
                  </button>

                  {/* Mobile settings */}
                  <button
                    onClick={() => {
                      if (userRole === 'instructor') navigate('/instructor/settings');
                      else if (userRole === 'student') navigate('/student/settings');
                      else if (userRole === 'admin') navigate('/admin/settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t my-2" />

                  {/* Mobile logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}