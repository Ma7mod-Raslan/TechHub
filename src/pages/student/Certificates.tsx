import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FileText, Award, Users, Code, Map, Bell, User, Settings, Code2, Download, Share2, Trophy, LogOut, MessageSquare, Menu } from 'lucide-react';
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

interface Certificate {
  id: number;
  course_title: string;
  certificate_link: string;
  issued_at: string;
  certificate_code: string;
}

export default function StudentCertificates({ navigate, logout, userRole }: StudentCertificatesProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

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

  useEffect(() => {

    const fetchCertificates = async () => {
      try {

        const token = localStorage.getItem("accessToken");

        const res = await fetch("http://localhost:5000/api/certificates/my", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        console.log(data);

        setCertificates(data);

      } catch (error) {
        console.error("Failed to fetch certificates", error);
      }
    };

    fetchCertificates();

  }, []);

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-certificates"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">My Certificates</h1>
                <p className="text-gray-600 text-sm md:text-base">Your achievements and completed courses</p>
              </div>
              <HeaderIcons
              navigate={navigate}
              logout={logout}
              userRole={userRole}
            />
            </div>
            
          </header>

          <main className="p-4 md:p-6">
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
                  <div key={cert.id}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 p-8 text-white text-center">
                        <Trophy className="h-16 w-16 mx-auto mb-4" />
                        <h2 className="text-2xl mb-2">Certificate of Completion</h2>
                        <div className="text-xl mb-2">{cert.course_title}</div>
                        <p className="text-sm opacity-90">Awarded to Alex Johnson</p>
                        <p className="text-sm opacity-90">{new Date(cert.issued_at).toLocaleDateString()}</p>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex gap-2">

                          <a
                            href={`http://localhost:5000${cert.certificate_link}`}
                            download
                            className="flex-1"
                          >
                            <Button variant="outline" className="flex-1 hover:bg-gray-100 transition-all duration-300">
                              <Download className="mr-2 h-4 w-4" />Download
                            </Button>
                          </a>

                          <Button
                            variant="outline"
                            className="flex-1 hover:bg-gray-100 transition-all duration-300"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `http://localhost:5000${cert.certificate_link}`
                              );
                              alert("Certificate link copied!");
                            }}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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