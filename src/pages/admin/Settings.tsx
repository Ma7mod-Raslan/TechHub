import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Settings as SettingsIcon,
  Code2,
  FileText,
  LogOut,
  Lock,
  Globe,
  Shield,
  Mail,
  Settings,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdminSettingsProps {
  logout: () => void;
  userRole: string;
}

export default function AdminSettings({ logout }: AdminSettingsProps) {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
    { icon: Users, label: 'Users', page: '/admin/users' },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses' },
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities' },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile' },
    { icon: Settings, label: 'Settings', page: '/admin/settings', active: true },
  ];

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+\\|;:'",.<>\/?]).{8,}$/;

    return regex.test(password);
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (!validatePassword(newPassword)) {
        toast.error(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
        return;
      }

      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 أهم سطر
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
      } else {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleChangeEmail = async () => {
    try {
      if (!newEmail) {
        toast.error("Please enter new email");
        return;
      }

      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://localhost:5000/api/auth/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_email: newEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
      } else {
        toast.success("Email updated successfully");
        setCurrentEmail(newEmail);
        setNewEmail("");
      }

    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const fetchEmail = async () => {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://localhost:5000/admin/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCurrentEmail(data.email);
    };

    fetchEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="admin"
          activePage="admin-dashboard"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Admin Settings</h1>
                <p className="text-gray-600">Manage platform settings and preferences</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-settings" />
            </div>
          </header>

          <main className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Change Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentEmail">Current Email</Label>
                      <Input value={currentEmail} type="email" disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">New Email</Label>
                      <Input value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        type="email"
                        placeholder="Enter new email" />
                    </div>
                    <Button onClick={handleChangeEmail} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                      Update Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        type="password"
                        placeholder="Enter current password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password"
                        placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="Confirm new password" />
                    </div>
                    <Button onClick={handleChangePassword} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>


            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}