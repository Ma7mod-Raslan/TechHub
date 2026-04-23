import { useState } from 'react';
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
  Settings as SettingsIcon,
  Code2,
  Moon,
  Sun,
  Globe,
  Lock,
  Shield,
  ArrowRight,
  LogOut,
  MessageSquare,
  Menu,
  Settings,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface StudentSettingsProps {
  logout: () => void;
  userRole: 'student';
}

export default function StudentSettings({logout, userRole }: StudentSettingsProps) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [courseReminders, setCourseReminders] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', page: '/student/dashboard'  },
        { icon: BookOpen, label: 'Courses', page: '/student/courses'  },
        { icon: FileText, label: 'Assignments', page: '/student/assignments' },
        { icon: Award, label: 'Certificates', page: '/student/certificates' },
        { icon: Users, label: 'Community', page: '/community' },
        { icon: Map, label: 'Roadmaps', page: '/student/roadmaps'  },
        { icon: Code, label: 'Compiler', page: '/student/compiler'   },
        { icon: Bell, label: 'Notifications', page: '/student/notifications' },
        { icon: User, label: 'Profile', page: '/student/profile'},
        { icon: Settings, label: 'Settings', page: '/student/settings', active: true },
        { icon: MessageSquare, label: 'Contact Us', page: '/student/contact' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="student"
          activePage="student-settings"
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
                <h1 className="text-xl md:text-2xl">Settings</h1>
                <p className="text-gray-600 text-sm md:text-base">Manage your preferences and account settings</p>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} currentPage="settings" />
            </div>
          </header>

          <main className="p-4 md:p-6 max-w-4xl max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            <div className="space-y-6">
              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Course Reminders</Label>
                      <p className="text-sm text-gray-600">Get reminded about upcoming lessons</p>
                    </div>
                    <Switch checked={courseReminders} onCheckedChange={setCourseReminders} />
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="Enter current password" className="mt-2" />
                  </div>

                  <div>
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" className="mt-2" />
                  </div>

                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="Confirm new password" className="mt-2" />
                  </div>

                  <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-gray-600">Make your profile visible to other students</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Learning Progress</Label>
                      <p className="text-sm text-gray-600">Display your progress on your profile</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Save Changes */}
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                  Save Changes
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}