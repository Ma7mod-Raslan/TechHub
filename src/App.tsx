import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

import Home from './pages/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Verification from './pages/auth/Verification';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyResetCode from './pages/auth/VerifyResetCode';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Instructor
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/MyCourses';
import InstructorCourseView from './pages/instructor/CourseView';
import InstructorAssignments from './pages/instructor/Assignments';
import InstructorManageAssignment from "./pages/instructor/ManageAssignment";
import InstructorCreateAssignment from "./pages/instructor/CreateAssignment";
import InstructorEditCourse from './pages/instructor/EditCourse';
import InstructorCreateCourse from './pages/instructor/CreateCourse';
import InstructorProfile from './pages/instructor/Profile';
import InstructorSettings from './pages/instructor/Settings';
import InstructorNotifications from './pages/instructor/Notifications';
import InstructorContact from './pages/instructor/Contact';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentAssignments from './pages/student/Assignments';
import StudentAssignmentDetails from "./pages/student/AssignmentDetails";
import StudentAssignmentFeedback from './pages/student/AssignmentFeedback';
import StudentCertificates from './pages/student/Certificates';
import StudentCompiler from './pages/student/Compiler';
import StudentRoadmaps from './pages/student/Roadmaps';
import StudentRoadmapDetails from './pages/student/RoadmapDetails';
import StudentProfile from './pages/student/Profile';
import StudentSettings from './pages/student/Settings';
import StudentNotifications from './pages/student/Notifications';
import StudentContact from './pages/student/Contact';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminCourseDetails from './pages/admin/CourseDetails';
import AdminReports from './pages/admin/Reports';
import AdminCommunities from './pages/admin/Communities';
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/Settings';
import AdminNotifications from './pages/admin/Notifications';

// Shared
import CourseDetails from './pages/CourseDetails';
import CourseDetailsGuest from './pages/CourseDetailsGuest';
import AllCourses from './pages/AllCourses';
import Community from './pages/Community';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import { Toaster } from './components/ui/sonner';
import PageWrapper from './types/animation';

export type UserRole = 'guest' | 'student' | 'instructor' | 'admin';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingVerification");

    setUserRole('guest');
    navigate('/login');
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserRole(parsed.role);
    } else {
      setUserRole('guest');
    }
  }, []);

  if (userRole === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Auth */}
          <Route path="/" element={<PageWrapper><Home isLoggedIn={isLoggedIn} userRole={userRole} logout={logout} /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
          <Route path="/verification" element={<PageWrapper><Verification /></PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
          <Route path="/verify-reset-code" element={<PageWrapper><VerifyResetCode /></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={<PageWrapper><InstructorDashboard logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/courses" element={<PageWrapper><InstructorCourses logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/community" element={<PageWrapper><Community userRole="instructor" logout={logout} /></PageWrapper>} />
          <Route path="/instructor/course-view" element={<PageWrapper><InstructorCourseView logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/edit-course" element={<PageWrapper><InstructorEditCourse logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/create-course" element={<PageWrapper><InstructorCreateCourse logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/assignments" element={<PageWrapper><InstructorAssignments /></PageWrapper>} />
          <Route path="/instructor/manage-assignment" element={<PageWrapper><InstructorManageAssignment /></PageWrapper>} />
          <Route path="/instructor/create-assignment" element={<PageWrapper><InstructorCreateAssignment /></PageWrapper>} />
          <Route path="/instructor/profile" element={<PageWrapper><InstructorProfile logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/settings" element={<PageWrapper><InstructorSettings logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/notifications" element={<PageWrapper><InstructorNotifications logout={logout} userRole="instructor" /></PageWrapper>} />
          <Route path="/instructor/contact" element={<PageWrapper><InstructorContact logout={logout} userRole="instructor" /></PageWrapper>} />


          {/* Student */}
          <Route path="/student/dashboard" element={<PageWrapper><StudentDashboard logout={logout} userRole="student" /></PageWrapper>} />
          <Route path="/student/courses" element={<PageWrapper><StudentCourses logout={logout} userRole="student" /></PageWrapper>} />
          <Route path="/student/community" element={<PageWrapper><Community userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/assignments" element={<PageWrapper><StudentAssignments userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/assignment-details" element={<PageWrapper><StudentAssignmentDetails userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/assignment-feedback" element={<PageWrapper><StudentAssignmentFeedback userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/certificates" element={<PageWrapper><StudentCertificates userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/compiler" element={<PageWrapper><StudentCompiler userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/roadmaps" element={<PageWrapper><StudentRoadmaps userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/roadmap-details" element={<PageWrapper><StudentRoadmapDetails userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/profile" element={<PageWrapper><StudentProfile userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/settings" element={<PageWrapper><StudentSettings userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/notifications" element={<PageWrapper><StudentNotifications userRole="student" logout={logout} /></PageWrapper>} />
          <Route path="/student/contact" element={<PageWrapper><StudentContact userRole="student" logout={logout} /></PageWrapper>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/users" element={<PageWrapper><AdminUsers logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/courses" element={<PageWrapper><AdminCourses logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/course-details" element={<PageWrapper><AdminCourseDetails logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/reports" element={<PageWrapper><AdminReports logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/communities" element={<PageWrapper><AdminCommunities logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/profile" element={<PageWrapper><AdminProfile logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/settings" element={<PageWrapper><AdminSettings logout={logout} userRole="admin" /></PageWrapper>} />
          <Route path="/admin/notifications" element={<PageWrapper><AdminNotifications logout={logout} userRole="admin" /></PageWrapper>} />

          {/* Shared */}
          <Route path="/course-details/:id" element={<PageWrapper><CourseDetails userRole={userRole} logout={logout} /></PageWrapper>} />
          <Route path="/courses" element={<PageWrapper><AllCourses isLoggedIn={isLoggedIn} userRole={userRole} logout={logout} /></PageWrapper>} />
          <Route path="/course-details-guest" element={<PageWrapper><CourseDetailsGuest userRole={userRole} logout={logout} /></PageWrapper>} />
          <Route
            path="/community"
            element={
              userRole === null
                ? <div>Loading...</div>
                : userRole === 'guest'
                  ? <Navigate to="/login" />
                  : <PageWrapper><Community userRole={userRole} logout={logout} /></PageWrapper>
            }
          />

          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />

          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />

        </Routes>
      </AnimatePresence>

      <Toaster />
    </>
  );
}