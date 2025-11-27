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

interface NavbarProps {
  navigate: (page: string) => void;
  isLoggedIn?: boolean;
  userRole?: 'student' | 'instructor' | 'admin' | 'guest';
  transparent?: boolean;
  logout?: () => void;
}

export default function Navbar({ navigate, isLoggedIn = false, userRole = 'guest', transparent = false, logout }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('login');
  };

  const menuLinks = [
    { label: 'Home', page: 'home', icon: Home },
    { label: 'Courses', page: 'all-courses', icon: BookOpen },
    { label: 'About', page: 'about', icon: Info },
    { label: 'Contact', page: 'contact', icon: Mail },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 border-b ${
        transparent ? 'bg-white/80 backdrop-blur-lg' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (userRole === 'admin') navigate('admin-dashboard');
              else if (userRole === 'instructor') navigate('home');
              else if (userRole === 'student') navigate('home');
              else navigate('home');
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

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for courses, tutorials, or topics..."
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('login')}
                  className="transition-all duration-300 hidden sm:flex"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('signup')} 
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {/* Notifications - Hidden on small mobile */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hidden sm:flex"
                  onClick={() => {
                    if (userRole === 'instructor') navigate('instructor-notifications');
                    else if (userRole === 'student') navigate('student-notifications');
                    else if (userRole === 'admin') navigate('admin-notifications');
                  }}
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                    3
                  </Badge>
                </Button>

                {/* Profile Dropdown - Hidden on mobile, show in menu */}
                <div className="hidden sm:block">
                  <DropdownMenu onOpenChange={setIsProfileOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 px-3 cursor-pointer hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-all duration-300"
                      >
                        <User className="h-5 w-5" />
                        <motion.div
                          animate={{ rotate: isProfileOpen ? 180 : 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-white shadow-lg border rounded-lg z-[100]"
                      sideOffset={8}
                    >
                      <DropdownMenuItem 
                        onClick={() => {
                          if (userRole === 'instructor') navigate('instructor-profile');
                          else if (userRole === 'student') navigate('student-profile');
                          else if (userRole === 'admin') navigate('admin-profile');
                        }}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors duration-200"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          if (userRole === 'instructor') navigate('instructor-settings');
                          else if (userRole === 'student') navigate('student-settings');
                          else if (userRole === 'admin') navigate('admin-settings');
                        }}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors duration-200"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
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
                      if (userRole === 'instructor') navigate('instructor-notifications');
                      else if (userRole === 'student') navigate('student-notifications');
                      else if (userRole === 'admin') navigate('admin-notifications');
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
                      if (userRole === 'instructor') navigate('instructor-profile');
                      else if (userRole === 'student') navigate('student-profile');
                      else if (userRole === 'admin') navigate('admin-profile');
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
                      if (userRole === 'instructor') navigate('instructor-settings');
                      else if (userRole === 'student') navigate('student-settings');
                      else if (userRole === 'admin') navigate('admin-settings');
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

              {!isLoggedIn && (
                <>
                  <div className="border-t my-2" />
                  <button
                    onClick={() => {
                      navigate('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span>Login</span>
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