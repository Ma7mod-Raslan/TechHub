import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { UserRole } from '../App';
import { NavigateFn } from '../types/Navigation';



interface MenuItem {
  icon: LucideIcon;
  label: string;
  page?: string;
  active?: boolean;
}


interface SidebarProps {
  menuItems: MenuItem[];
  navigate: NavigateFn;    
  logout: () => void;
  userRole: UserRole;
  activePage?: string;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}


export default function Sidebar({ menuItems, navigate, logout, userRole, activePage, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`sidebar-${userRole}-collapsed`);
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, [userRole]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(`sidebar-${userRole}-collapsed`, String(newState));
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

  const handleMobileNavigation = (page?: string) => {
    if (page) {
      navigate(page);
      setIsMobileOpen?.(false)

    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen?.(false)
              }
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Mobile Sidebar - full height with padding for header */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r shadow-2xl z-50 flex flex-col pt-20"
            >
              <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
                <div className="p-6">
                  {/* Logo */}
                  <div
                    className="flex items-center gap-2 cursor-pointer mb-8"
                    onClick={() => {
                      navigate(getDashboardPage());
                      setIsMobileOpen?.(false)

                    }}
                  >
                    <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                      TechHub
                    </span>
                  </div>

                  {/* Menu Items */}
                  <nav className="space-y-2">
                    {menuItems.map((item, index) => {
                      const isActive = item.active || item.page === activePage;

                      return (
                        <button
                          key={index}
                          onClick={() => handleMobileNavigation(item.page)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-200'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-cyan-50 hover:shadow-md'
                            }`}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Sign Out - Fixed at bottom */}
                <div className="mt-auto p-6 border-t">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileOpen?.(false)

                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-600 hover:bg-red-50 hover:shadow-md"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{
          x: 0,
          width: isCollapsed ? '72px' : '260px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white border-r h-screen sticky top-0 hidden lg:flex flex-col overflow-hidden shadow-sm z-20"
        style={{
          minWidth: isCollapsed ? '72px' : '260px',
          '--sb-expanded': '260px',
          '--sb-collapsed': '72px'
        } as React.CSSProperties}
      >
        <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
          <div className="p-6">
            {/* Logo and Toggle */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(getDashboardPage())}
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
                  onClick={() => navigate(getDashboardPage())}
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
                          onClick={() => item.page && navigate(item.page)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
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
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-600 hover:bg-red-50 hover:shadow-md ${isCollapsed ? 'justify-center' : ''
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