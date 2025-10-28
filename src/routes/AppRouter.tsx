import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// -----------------------------------------------------
// 1. استيراد الـLayouts (تأكدي من بناء هذه الملفات)
// -----------------------------------------------------
import StudentLayout from '../layouts/StudentLayout';
import InstructorLayout from '../layouts/InstructorLayout';

// Placeholder Component for Protected Routes (مؤقت لتركيزك على الـUI)
// في هذه المرحلة، هو مجرد component يعرض المحتوى (Outlet)
const ProtectedRoute: React.FC = () => <Outlet />; 

// -----------------------------------------------------
// 2. استيراد صفحات الـAuth & Public (التي بدأنا ببنائها)
// -----------------------------------------------------
import HomePage from '../pages/HomePage/HomePage'; 
import SignIn from '../features/auth/pages/SignIn'; 
// المكونات التي ظهرت في التصميمات أو خطة العمل
import SignUpStudent from '../features/auth/pages/SignUpStudent';
import SignUpInstructor from '../features/auth/pages/SignUpInstructor';
// import ForgotPassword from '../features/auth/pages/ForgotPassword';
// import ContactUs from '../features/public/pages/ContactUs';
// import OurPartners from '../features/public/pages/OurPartners';
// import Plans from '../features/public/pages/Plans';
// import WhoWeAre from '../features/public/pages/WhoWeAre';
// import ExploreCourses from '../features/public/pages/ExploreCourses'; 


// -----------------------------------------------------
// 3. Components مؤقتة لصفحات لوحات التحكم (لإكمال الـRouter مؤقتاً)
// -----------------------------------------------------

// Student Pages Placeholders
const StudentDashboard = () => <h1>Student Dashboard UI</h1>;
const MyCoursesStudent = () => <h1>Student My Courses UI</h1>;
const CommunityStudent = () => <h1>Student Community UI</h1>;
const Certificates = () => <h1>Certificates UI</h1>;
const StudentSettings = () => <h1>Student Settings UI</h1>;
const StudentProfile = () => <h1>Student Profile UI</h1>;
const StudentNotifications = () => <h1>Student Notifications UI</h1>;
const AiAssistantStudent = () => <h1>Student AI Assistant UI</h1>;
const Assessments = () => <h1>Student Assessments UI</h1>;
const Playground = () => <h1>Student Playground UI</h1>;


// Instructor Pages Placeholders
const InstructorDashboard = () => <h1>Instructor Dashboard UI</h1>;
const MyCoursesInstructor = () => <h1>Instructor My Courses UI</h1>;
const CommunityInstructor = () => <h1>Instructor Community UI</h1>;
const CreateCourse = () => <h1>Instructor Create Course UI</h1>;
const InstructorSettings = () => <h1>Instructor Settings UI</h1>;
const InstructorProfile = () => <h1>Instructor Profile UI</h1>;
const InstructorNotifications = () => <h1>Instructor Notifications UI</h1>;
const AiAssistantInstructor = () => <h1>Instructor AI Assistant UI</h1>;


const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        
          
          {/* 🌟 المسار الرئيسي (HomePage / Onboarding Screen) */}
          <Route path="/" element={<HomePage />} /> 
          
          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup/student" element={<SignUpStudent />} />
          <Route path="/signup/instructor" element={<SignUpInstructor />} />



        {/* ---------------------------------------------------------------------------------- */}
        {/* ============ Student Protected Routes (Student Layout) ============ */}
        {/* يتم وضع ProtectedRoute هنا ليقوم بفحص الدور (Role) أولاً */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student" element={<StudentLayout />}>
            
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-courses" element={<MyCoursesStudent />} />
            <Route path="community" element={<CommunityStudent />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="playground" element={<Playground />} />
            <Route path="certificates" element={<Certificates />} />
            
            {/* Settings and Profile Sub-routes */}
            <Route path="settings" element={<StudentSettings />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="ai-assistant" element={<AiAssistantStudent />} />
            
          </Route>
        </Route>
        
        {/* ---------------------------------------------------------------------------------- */}
        {/* ============ Instructor Protected Routes (Instructor Layout) ============ */}
        {/* يتم وضع ProtectedRoute هنا ليقوم بفحص الدور (Role) أولاً */}
        <Route element={<ProtectedRoute />}>
          <Route path="/instructor" element={<InstructorLayout />}>
            
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="my-courses" element={<MyCoursesInstructor />} />
            <Route path="community" element={<CommunityInstructor />} />
            <Route path="create-course" element={<CreateCourse />} />
            
            {/* Settings and Profile Sub-routes */}
            <Route path="settings" element={<InstructorSettings />} />
            <Route path="profile" element={<InstructorProfile />} />
            <Route path="notifications" element={<InstructorNotifications />} />
            <Route path="ai-assistant" element={<AiAssistantInstructor />} />
            
          </Route>
        </Route>
        
        {/* ============ Not Found Route ============ */}
        <Route path="*" element={<h1 className="text-4xl text-center pt-20">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
