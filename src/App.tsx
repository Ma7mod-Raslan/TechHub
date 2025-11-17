import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/MyCourses';
import InstructorAnalytics from './pages/instructor/Analytics';
import InstructorProfile from './pages/instructor/Profile';
import InstructorSettings from './pages/instructor/Settings';
import InstructorNotifications from './pages/instructor/Notifications';


import InstructorContact from './pages/instructor/Contact';


import { Toaster } from './components/ui/sonner';

export type UserRole = 'guest' | 'student' | 'instructor' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [navigationState, setNavigationState] = useState<any>(null);

  const logout = () => {
    setUserRole('guest');
    setCurrentPage('login');
    setNavigationState(null);
  };

  const navigate = (page: string, role?: UserRole, state?: any) => {
    // If navigating to home, don't log out - just go to home
    if (page === 'home') {
      setCurrentPage(page);
      setNavigationState(null);
      return;
    }
    
    // If navigating to login, reset role to guest
    if (page === 'login') {
      setUserRole('guest');
    }
    
    setCurrentPage(page);
    if (role) setUserRole(role);
    if (state) setNavigationState(state);
    else setNavigationState(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} isLoggedIn={userRole !== 'guest'} userRole={userRole} logout={logout} />;
      case 'login':
        return <Login navigate={navigate} />;
      case 'signup':
        return <SignUp navigate={navigate} />;
      case 'forgot-password':
        return <ForgotPassword navigate={navigate} />;
      // Instructor Routes
      case 'instructor-dashboard':
        return <InstructorDashboard navigate={navigate} logout={logout} userRole="instructor" />;
      case 'instructor-courses':
        return <InstructorCourses navigate={navigate} logout={logout} userRole="instructor" />;
      case 'instructor-analytics':
        return <InstructorAnalytics navigate={navigate} logout={logout} userRole="instructor" />;
      case 'instructor-profile':
        return <InstructorProfile navigate={navigate} logout={logout} userRole="instructor" />;
      case 'instructor-settings':
        return <InstructorSettings navigate={navigate} logout={logout} userRole="instructor" />;
      case 'instructor-notifications':
        return <InstructorNotifications navigate={navigate} logout={logout} userRole="instructor" />;
      case 'instructor-contact':
        return <InstructorContact navigate={navigate} logout={logout} userRole="instructor" />;
      
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <Toaster />
    </>
  );
}