import { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings as SettingsIcon,
  MessageSquare,
  Code2,
  Moon,
  Sun,
  Lock,
  Shield,
  DollarSign,
  CreditCard,
  LogOut,
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

interface InstructorSettingsProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'instructor';
}

export default function InstructorSettings({ navigate, logout, userRole }: InstructorSettingsProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studentMessages, setStudentMessages] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [email, setEmail] = useState('sarah.johnson@email.com');

  const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
  { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
  { icon: BarChart3, label: 'Assignments', page: 'instructor-assignments'},
  { icon: Users, label: 'Community', page: 'community' },
  { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
  { icon: User, label: 'Profile', page: 'instructor-profile' },
  { icon: Settings, label: 'Settings', page: 'instructor-settings' },
  { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="instructor"
          activePage="instructor-settings"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />


        <div className="flex-1">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div>
                  <h1 className="text-2xl">Settings</h1>
                  <p className="text-gray-600">
                    Manage your preferences and account settings
                  </p>
                </div>
              </div>

              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} currentPage="settings"/>
            </div>
          </header>


          <main className="p-6 max-w-4xl">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-1">Your email address for account communications</p>
                  </div>
                </CardContent>
              </Card>

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
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

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
                      <Label>Student Messages</Label>
                      <p className="text-sm text-gray-600">Get notified when students message you</p>
                    </div>
                    <Switch checked={studentMessages} onCheckedChange={setStudentMessages} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Course Updates</Label>
                      <p className="text-sm text-gray-600">Receive analytics and performance updates</p>
                    </div>
                    <Switch checked={courseUpdates} onCheckedChange={setCourseUpdates} />
                  </div>
                </CardContent>
              </Card>

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

                  <Button className="bg-gradient-to-r from-violet-600 to-cyan-500">
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-500">Save Changes</Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}
