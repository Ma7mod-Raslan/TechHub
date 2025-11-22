import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, FileText, Award, Users, Code, Map, Bell, User, Settings, Code2, Download, Share2, Trophy, LogOut, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentCertificatesProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

const certificates = [
  { id: 1, title: 'React Masterclass', instructor: 'Maria Garcia', date: 'October 2025', grade: 95 },
  { id: 2, title: 'Python Fundamentals', instructor: 'Dr. Alex Chen', date: 'September 2025', grade: 92 },
];

export default function StudentCertificates({ navigate, logout, userRole }: StudentCertificatesProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates', active: true },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile' },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('student-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-certificates"
        />

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">My Certificates</h1>
                <p className="text-gray-600">Your achievements and completed courses</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-4">Complete courses to earn certificates</p>
                  <Button 
                    onClick={() => navigate('student-courses')}
                    className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                  >
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <motion.div key={cert.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 p-8 text-white text-center">
                        <Trophy className="h-16 w-16 mx-auto mb-4" />
                        <h2 className="text-2xl mb-2">Certificate of Completion</h2>
                        <div className="text-xl mb-2">{cert.title}</div>
                        <p className="text-sm opacity-90">Awarded to Alex Johnson</p>
                        <p className="text-sm opacity-90">{cert.date}</p>
                        <p className="text-sm opacity-90 mt-2">Grade: {cert.grade}%</p>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 hover:bg-gray-100 transition-all duration-300">
                            <Download className="mr-2 h-4 w-4" />Download
                          </Button>
                          <Button variant="outline" className="flex-1 hover:bg-gray-100 transition-all duration-300">
                            <Share2 className="mr-2 h-4 w-4" />Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}