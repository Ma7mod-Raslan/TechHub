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

export type UserRole = 'guest' | 'student' | 'instructor' | 'admin';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

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
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>

            {/* Auth */}
            <Route path="/" element={<Home userRole={userRole} logout={logout} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-code" element={<VerifyResetCode />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Instructor */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard logout={logout} userRole="instructor" />} />
            <Route path="/instructor/courses" element={<InstructorCourses logout={logout} userRole="instructor" />} />
            <Route path="/instructor/course-view" element={<InstructorCourseView logout={logout} userRole="instructor" />} />
            <Route path="/instructor/edit-course" element={<InstructorEditCourse logout={logout} userRole="instructor" />} />
            <Route path="/instructor/create-course" element={<InstructorCreateCourse logout={logout} userRole="instructor" />} />
            <Route path="/instructor/assignments" element={<InstructorAssignments />} />
            <Route path="/instructor/manage-assignment" element={<InstructorManageAssignment />} />
            <Route path="/instructor/create-assignment" element={<InstructorCreateAssignment />} />
            <Route path="/instructor/profile" element={<InstructorProfile logout={logout} userRole="instructor" />} />
            <Route path="/instructor/settings" element={<InstructorSettings logout={logout} userRole="instructor" />} />
            <Route path="/instructor/notifications" element={<InstructorNotifications logout={logout} userRole="instructor" />} />
            <Route path="/instructor/contact" element={<InstructorContact logout={logout} userRole="instructor" />} />

            {/* Student */}
            <Route path="/student/dashboard" element={<StudentDashboard logout={logout} userRole="student" />} />
            <Route path="/student/courses" element={<StudentCourses logout={logout} userRole="student" />} />
            <Route path="/student/assignments" element={<StudentAssignments userRole="student" logout={logout} />} />
            <Route path="/student/assignment-details" element={<StudentAssignmentDetails userRole="student" logout={logout} />} />
            <Route path="/student/assignment-feedback" element={<StudentAssignmentFeedback userRole="student" logout={logout} />} />
            <Route path="/student/certificates" element={<StudentCertificates userRole="student" logout={logout} />} />
            <Route path="/student/compiler" element={<StudentCompiler userRole="student" logout={logout} />} />
            <Route path="/student/roadmaps" element={<StudentRoadmaps userRole="student" logout={logout} />} />
            <Route path="/student/profile" element={<StudentProfile userRole="student" logout={logout} />} />
            <Route path="/student/settings" element={<StudentSettings userRole="student" logout={logout} />} />
            <Route path="/student/notifications" element={<StudentNotifications userRole="student" logout={logout} />} />
            <Route path="/student/contact" element={<StudentContact userRole="student" logout={logout} />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard logout={logout} userRole="admin" />} />
            <Route path="/admin/users" element={<AdminUsers logout={logout} userRole="admin" />} />
            <Route path="/admin/courses" element={<AdminCourses logout={logout} userRole="admin" />} />
            <Route path="/admin/course-details" element={<AdminCourseDetails logout={logout} userRole="admin" />} />
            <Route path="/admin/reports" element={<AdminReports logout={logout} userRole="admin" />} />
            <Route path="/admin/communities" element={<AdminCommunities logout={logout} userRole="admin" />} />
            <Route path="/admin/profile" element={<AdminProfile logout={logout} userRole="admin" />} />
            <Route path="/admin/settings" element={<AdminSettings logout={logout} userRole="admin" />} />
            <Route path="/admin/notifications" element={<AdminNotifications logout={logout} userRole="admin" />} />

            {/* Shared */}
            <Route path="/course-details" element={<CourseDetails userRole={userRole} logout={logout} />} />
            <Route path="/courses" element={<AllCourses userRole={userRole} logout={logout} />} />
            <Route path="/course-details-guest" element={<CourseDetailsGuest userRole="guest" />} />
            <Route
              path="/community"
              element={
                userRole === null
                  ? <div>Loading...</div>
                  : userRole === 'guest'
                    ? <Navigate to="/login" />
                    : <Community userRole={userRole} logout={logout} />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="*" element={<NotFound />} />

          </Routes>
        </motion.div>
      </AnimatePresence>

      <Toaster />
    </>
  );
}