import { motion } from 'motion/react';
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Settings,
  Code2,
  TrendingUp,
  AlertCircle,
  Shield,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  logout: () => void;
  userRole: string;
}

type Stats = {
  totalUsers: {
    value: number;
    growth: number;
  };
  totalInstructors: {
    value: number;
    growth: number;
  };
  activeCourses: {
    value: number;
    thisWeek: number;
  };
  reports: {
    value: number;
    pending: number;
  };
};

type Activity = {
  month: string;
  users: number;
  courses: number;
};

type User = {
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};



export default function AdminDashboard({ logout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard', active: true },
    { icon: Users, label: 'Users', page: '/admin/users' },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses' },
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities' },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile' },
    { icon: Settings, label: 'Settings', page: '/admin/settings' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);


  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/activity", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setActivityData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchActivity();
  }, []);;


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users/recent", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();
        setRecentUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/admin/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();

        setRecentCourses(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/admin/reports", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();
        setReportedContent(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
    }
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
          {/* Header */}
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
                <h1 className="text-2xl">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, Administrator!</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-dashboard" />
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Users</span>
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-3xl mb-1">
                      {stats?.totalUsers?.value || 0}
                    </div>
                    <div className="text-sm text-green-600">+{stats?.totalUsers?.growth || 0}% from last month</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Instructors</span>
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-3xl mb-1">
                      {stats?.totalInstructors?.value || 0}
                    </div>
                    <div className="text-sm text-green-600">+{stats?.totalInstructors?.growth || 0}% from last month</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Active Courses</span>
                      <BookOpen className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="text-3xl mb-1">
                      {stats?.activeCourses?.value || 0}
                    </div>
                    <div className="text-sm text-green-600">+{stats?.activeCourses?.thisWeek || 0} this week</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Reports</span>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-3xl mb-1">
                      {stats?.reports?.value || 0}
                    </div>
                    <div className="text-sm text-yellow-600">
                      {stats?.reports?.pending || 0} pending review
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  {/* User Growth */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="users" stroke="#7F56D9" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Course Growth */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="courses" fill="#06B6D4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}