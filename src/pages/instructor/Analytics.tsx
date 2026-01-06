import { motion } from 'motion/react';
import { useState } from 'react';

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings,
  MessageSquare,
  Menu,
  Code2,
  TrendingUp,
  DollarSign,
  Eye,
  Clock,
  LogOut,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface InstructorAnalyticsProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'instructor';
}

const enrollmentData = [
  { date: 'Nov 1', students: 120 },
  { date: 'Nov 8', students: 150 },
  { date: 'Nov 15', students: 180 },
  { date: 'Nov 22', students: 220 },
  { date: 'Nov 29', students: 280 },
  { date: 'Dec 6', students: 350 },
];

const coursePerformance = [
  { course: 'Web Dev', students: 1250, revenue: 24500 },
  { course: 'Python', students: 980, revenue: 19600 },
  { course: 'React', students: 750, revenue: 15000 },
  { course: 'ML', students: 420, revenue: 8400 },
];

const engagementData = [
  { name: 'Video Views', value: 15420 },
  { name: 'Quiz Attempts', value: 8950 },
  { name: 'Assignments', value: 6320 },
  { name: 'Forum Posts', value: 3210 },
];

const COLORS = ['#0891b2', '#6366f1', '#8b5cf6', '#ec4899'];

const studentDemographics = [
  { country: 'United States', students: 850 },
  { country: 'India', students: 620 },
  { country: 'United Kingdom', students: 410 },
  { country: 'Canada', students: 380 },
  { country: 'Germany', students: 320 },
];

export default function InstructorAnalytics({ navigate, logout, userRole }: InstructorAnalyticsProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
    { icon: BarChart3, label: 'Analytics', page: 'instructor-analytics', active: true },
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
          activePage="instructor-analytics"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
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
                  <h1 className="text-2xl">Analytics</h1>
                  <p className="text-gray-600">Track your performance and insights</p>
                </div>
              </div>

              {/* Right icons */}
              <HeaderIcons
                navigate={navigate}
                logout={logout}
                userRole={userRole}
              />
            </div>
          </header>


          {/* Content */}
          <main className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Total Views</span>
                          <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-3xl mb-1">45.2K</div>
                        <div className="text-sm text-green-600">+22% from last month</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Avg Watch Time</span>
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-3xl mb-1">12.5 min</div>
                        <div className="text-sm text-green-600">+8% improvement</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Completion Rate</span>
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-3xl mb-1">72%</div>
                        <div className="text-sm text-green-600">+5% increase</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Monthly Revenue</span>
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-3xl mb-1">$8.4K</div>
                        <div className="text-sm text-green-600">+18% growth</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Enrollment Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Student Enrollment Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={enrollmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="students" stroke="#0891b2" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Course Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={coursePerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="course" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="students" fill="#0891b2" name="Students" />
                        <Bar yAxisId="right" dataKey="revenue" fill="#6366f1" name="Revenue ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Engagement Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={engagementData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {engagementData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['Introduction to React Hooks', 'Building a REST API', 'Database Design Principles', 'Authentication Best Practices'].map(
                          (title, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="mb-1">{title}</div>
                                <div className="text-sm text-gray-600">{Math.floor(Math.random() * 1000 + 500)} views</div>
                              </div>
                              <div className="text-sm text-green-600">↑ {Math.floor(Math.random() * 30 + 10)}%</div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={coursePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="course" type="category" />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-gray-600 mb-2">Total Revenue</div>
                      <div className="text-3xl mb-1">$67,500</div>
                      <div className="text-sm text-green-600">All time</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-gray-600 mb-2">Avg Revenue per Course</div>
                      <div className="text-3xl mb-1">$16,875</div>
                      <div className="text-sm text-gray-600">4 courses</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-gray-600 mb-2">Projected Monthly</div>
                      <div className="text-3xl mb-1">$9,200</div>
                      <div className="text-sm text-green-600">+15% growth</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Students by Country</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentDemographics.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{item.country}</span>
                            <span>{item.students} students</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${(item.students / 850) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Age Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { range: '18-24', percent: 35 },
                          { range: '25-34', percent: 42 },
                          { range: '35-44', percent: 18 },
                          { range: '45+', percent: 5 },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-20 text-sm">{item.range}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                            <div className="w-12 text-right text-sm">{item.percent}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Experience Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { level: 'Beginner', percent: 45 },
                          { level: 'Intermediate', percent: 35 },
                          { level: 'Advanced', percent: 20 },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-28 text-sm">{item.level}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                            <div className="w-12 text-right text-sm">{item.percent}%</div>
                          </div>
                        ))}
                      </div>
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