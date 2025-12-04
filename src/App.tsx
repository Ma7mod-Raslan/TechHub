import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Verification from './pages/auth/Verification';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyResetCode from './pages/auth/VerifyResetCode';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/MyCourses';
import InstructorAnalytics from './pages/instructor/Analytics';
import InstructorProfile from './pages/instructor/Profile';
import InstructorSettings from './pages/instructor/Settings';
import InstructorNotifications from './pages/instructor/Notifications';
import InstructorContact from './pages/instructor/Contact';
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentAssignments from './pages/student/Assignments';
import StudentCertificates from './pages/student/Certificates';
import StudentCompiler from './pages/student/Compiler';
import StudentRoadmaps from './pages/student/Roadmaps';
import StudentProfile from './pages/student/Profile';
import StudentSettings from './pages/student/Settings';
import StudentNotifications from './pages/student/Notifications';
import StudentContact from './pages/student/Contact';

import CourseDetails from './pages/CourseDetails';
import AllCourses from './pages/AllCourses';
import Community from './pages/Community';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
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
      case 'verification':
        return <Verification navigate={navigate} />;
      case 'forgot-password':
        return <ForgotPassword navigate={navigate} />;
      case 'verify-reset-code':
        return <VerifyResetCode navigate={navigate} />;
      case 'reset-password':
        return <ResetPasswordPage navigate={navigate} />;
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
      // Student Routes
      case 'student-dashboard':
        return <StudentDashboard navigate={navigate} logout={logout} userRole="student" />;
      case 'student-courses':
        return <StudentCourses navigate={navigate} logout={logout} userRole="student" />;
      case 'student-assignments':
        return <StudentAssignments navigate={navigate} logout={logout} userRole="student" />;
      case 'student-certificates':
        return <StudentCertificates navigate={navigate} logout={logout} userRole="student" />;
      case 'student-compiler':
        return <StudentCompiler navigate={navigate} logout={logout} userRole="student" />;
      case 'student-roadmaps':
        return <StudentRoadmaps navigate={navigate} logout={logout} userRole="student" />;
      case 'student-profile':
        return <StudentProfile navigate={navigate} logout={logout} userRole="student" />;
      case 'student-settings':
        return <StudentSettings navigate={navigate} logout={logout} userRole="student" />;
      case 'student-notifications':
        return <StudentNotifications navigate={navigate} logout={logout} userRole="student" />;
      case 'student-contact':
        return <StudentContact navigate={navigate} logout={logout} userRole="student" />;

      // Shared Routes
      case 'course-details':
        return <CourseDetails navigate={navigate} userRole={userRole} />;
      case 'all-courses':
        return <AllCourses navigate={navigate} isLoggedIn={userRole !== 'guest'} userRole={userRole} logout={logout} />;
      case 'community':
        if (userRole === 'guest') {
          return <Home navigate={navigate} logout={logout} />;
        }
        return <Community navigate={navigate} logout={logout} userRole={userRole} initialCommunityId={navigationState?.communityId} />;
      case 'about':
        return <About navigate={navigate} />;
      case 'contact':
        return <Contact navigate={navigate} />;
      default:
        return <NotFound navigate={navigate} />;
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