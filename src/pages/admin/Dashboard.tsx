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
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalReports: number;
  pendingReports: number;
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
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' , active: true  },
    { icon: Users, label: 'Users', page: '/admin/users' },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses'},
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities' },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile' },
    { icon: Settings, label: 'Settings', page: '/admin/settings' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/dashboard/stats", {
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

  // 🔴 TEMP DISABLED (API مش موجود في الباك)

  // useEffect(() => {
  //   const fetchActivity = async () => {
  //     try {
  //       const res = await fetch("http://localhost:5000/admin/dashboard/activity", {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //         },
  //       });

  //       if (!res.ok) throw new Error("Failed");

  //       const data = await res.json();
  //       setActivityData(data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchActivity();
  // }, []);;

  // 🔴 TEMP DISABLED (API مش موجود)

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await fetch("http://localhost:5000/admin/users/recent", {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //         },
  //       });

  //       const data = await res.json();
  //       setRecentUsers(data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/courses", {
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
        const res = await fetch("http://localhost:5000/admin/reports", {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="admin"
          activePage="admin-dashboard"
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
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
                      {stats?.totalUsers || 0}
                    </div>
                    <div className="text-sm text-green-600">+12% from last month</div>
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
                      {stats?.totalInstructors || 0}
                    </div>
                    <div className="text-sm text-green-600">+8% from last month</div>
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
                      {stats?.totalCourses || 0}
                    </div>
                    <div className="text-sm text-green-600">+15 this week</div>
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
                      {stats?.totalReports || 0}
                    </div>
                    <div className="text-sm text-yellow-600">
                      {stats?.pendingReports || 0} pending review
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="communities">Communities</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
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

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Users</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/users')}
                        className="hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all duration-300"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers.map((user: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3>{user.name}</h3>
                              <Badge variant={user.role === 'Instructor' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Joined {user.joinDate}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              {user.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Course Management</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/courses')}
                        className="hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all duration-300"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCourses.map((course: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3>{course.title}</h3>
                              <Badge>{course.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">by {course.instructor}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{course.students} enrolled</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {course.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communities">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Community Activity</CardTitle>
                      <Button
                        className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                        onClick={() => navigate('/admin/communities')}
                      >
                        View Communities
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                            <div className="text-2xl mb-1">12,845</div>
                            <div className="text-sm text-gray-600">Total Posts</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
                            <div className="text-2xl mb-1">38,420</div>
                            <div className="text-sm text-gray-600">Active Members</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl mb-1">2,450</div>
                            <div className="text-sm text-gray-600">Posts Today</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Reported Content</CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-red-100 text-red-800">5 Pending</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/admin/reports')}
                          className="hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all duration-300"
                        >
                          View Reports
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportedContent.map((report: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Badge>{report.type}</Badge>
                              <span className="text-sm text-gray-600">Reported by {report.reporter}</span>
                            </div>
                            <p className="text-sm">{report.content}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {report.status}
                            </Badge>
                            {report.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}