import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Users,
  Code,
  Map,
  Bell,
  User,
  Settings,
  Code2,
  Camera,
  Mail,
  Calendar,
  MapPin,
  Link,
  TrendingUp,
  ArrowRight,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentProfileProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

export default function StudentProfile({ navigate, logout, userRole }: StudentProfileProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile', active: true },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

  const stats = [
    { label: 'Courses Completed', value: '8', icon: BookOpen },
    { label: 'Learning Hours', value: '247', icon: TrendingUp },
    { label: 'Certificates', value: '5', icon: Award },
    { label: 'Current Streak', value: '23 days', icon: Calendar },
  ];

  const achievements = [
    { name: 'Fast Learner', description: 'Completed 5 courses in a month', earned: true },
    { name: 'Coding Ninja', description: 'Submitted 50 assignments', earned: true },
    { name: 'Community Helper', description: 'Helped 100 students', earned: false },
    { name: 'Perfect Streak', description: '30 days of continuous learning', earned: false },
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
          activePage="student-profile"
        />

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">My Profile</h1>
                <p className="text-gray-600">Manage your personal information</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} currentPage="profile" />
            </div>
          </header>

          <main className="p-6">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Profile Info Card */}
              <Card className="lg:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=200"
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-violet-100"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-2xl mb-1">Alex Johnson</h2>
                    <p className="text-gray-600 mb-4">Full Stack Developer</p>
                    <Badge className="mb-6 bg-gradient-to-r from-violet-600 to-cyan-500">Premium Member</Badge>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">alex.johnson@email.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Joined March 2024</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">San Francisco, CA</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Link className="h-4 w-4" />
                        <span className="text-sm">github.com/alexj</span>
                      </div>
                    </div>

                    <Button className="w-full mt-6 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats & Achievements */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                          <stat.icon className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                          <div className="text-2xl mb-1">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Web Development</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Data Science</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Machine Learning</span>
                          <span>42%</span>
                        </div>
                        <Progress value={42} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className={`p-4 border rounded-lg transition-all duration-300 ${
                            achievement.earned ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Award className={`h-6 w-6 ${achievement.earned ? 'text-violet-600' : 'text-gray-400'}`} />
                            <h3>{achievement.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
