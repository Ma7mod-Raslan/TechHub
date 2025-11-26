import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code2, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  page?: string;
  active?: boolean;
}

interface SidebarProps {
  menuItems: MenuItem[];
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student' | 'instructor' | 'admin';
  activePage?: string;
}

export default function Sidebar({ menuItems, navigate, logout, userRole, activePage }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`sidebar-${userRole}-collapsed`);
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, [userRole]);

  // Ensure collapsed state doesn't hide labels on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // on small screens, un-collapse so labels are visible inside drawer
        setIsCollapsed(false);
      }
      // if you resize to desktop, close mobile drawer
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(`sidebar-${userRole}-collapsed`, String(newState));
  };

  const toggleMobile = () => {
    setMobileOpen(prev => !prev);
  };

  const getDashboardPage = () => {
    switch (userRole) {
      case 'admin':
        return 'admin-dashboard';
      case 'instructor':
        return 'home';
      case 'student':
        return 'home';
      default:
        return 'home';
    }
  };

  // base width values
  const expandedWidth = '260px';
  const collapsedWidth = '72px';

  return (
    <>
      {/* Hamburger button (visible only on mobile) */}
      <button
        aria-label="Open sidebar"
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md lg:hidden"
      >
        {/* simple icon - could replace with lucide menu icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile when open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={{ x: -300 }}
        animate={{
          x: mobileOpen ? 0 : 0,
          width: isCollapsed ? collapsedWidth : expandedWidth
        }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        // IMPORTANT: lg:flex makes it behave as regular sidebar on desktop.
        // On mobile we control visibility via mobileOpen and fixed positioning.
        className={`
          bg-white border-r h-screen overflow-hidden shadow-sm z-50
          flex flex-col
          ${mobileOpen ? 'fixed left-0 top-0' : 'lg:relative'}
          lg:flex
          ${mobileOpen ? 'block' : 'hidden lg:block'}
        `}
        style={{
          minWidth: isCollapsed ? collapsedWidth : expandedWidth,
          '--sb-expanded': expandedWidth,
          '--sb-collapsed': collapsedWidth
        } as React.CSSProperties}
      >
        <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
          <div className="p-6">
            {/* Logo and Toggle */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  navigate(getDashboardPage());
                  setMobileOpen(false); // close on mobile when navigating
                }}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {!isCollapsed && (
                  <>
                    <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                      TechHub
                    </span>
                  </>
                )}
              </motion.div>

              {isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl cursor-pointer mx-auto"
                  onClick={() => {
                    navigate(getDashboardPage());
                    setMobileOpen(false);
                  }}
                >
                  <Code2 className="h-6 w-6 text-white" />
                </motion.div>
              )}

              {!isCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </div>

            {/* Collapse Button when sidebar is collapsed */}
            {isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="w-full p-2 mb-6 rounded-lg hover:bg-gradient-to-r hover:from-violet-100 hover:to-cyan-100 transition-all duration-200 flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            )}

            {/* Menu Items */}
            <nav className="space-y-2">
              <TooltipProvider delayDuration={0}>
                {menuItems.map((item, index) => {
                  const isActive = item.active || item.page === activePage;

                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ x: isCollapsed ? 0 : 4 }}
                          onClick={() => {
                            if (item.page) navigate(item.page);
                            setMobileOpen(false); // close drawer on mobile when navigating
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-200'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 hover:shadow-md'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" style={{ opacity: 1 }} />
                          <motion.span
                            animate={{
                              opacity: isCollapsed ? 0 : 1,
                              width: isCollapsed ? 0 : 'auto'
                            }}
                            transition={{
                              width: { duration: 0.3, ease: 'easeInOut' },
                              opacity: { duration: 0.2, ease: 'easeInOut' }
                            }}
                            className="whitespace-nowrap overflow-hidden"
                            style={{ display: isCollapsed ? 'none' : 'block' }}
                          >
                            {item.label}
                          </motion.span>
                        </motion.button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-gray-900 text-white">
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </nav>
          </div>

          {/* Sign Out - Fixed at bottom */}
          <div className="mt-auto p-6 border-t">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-600 hover:bg-red-50 hover:shadow-md ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" style={{ opacity: 1 }} />
                    <motion.span
                      animate={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto'
                      }}
                      transition={{
                        width: { duration: 0.3, ease: 'easeInOut' },
                        opacity: { duration: 0.2, ease: 'easeInOut' }
                      }}
                      className="whitespace-nowrap overflow-hidden"
                      style={{ display: isCollapsed ? 'none' : 'block' }}
                    >
                      Sign Out
                    </motion.span>
                  </motion.button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-gray-900 text-white">
                    <p>Sign Out</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
