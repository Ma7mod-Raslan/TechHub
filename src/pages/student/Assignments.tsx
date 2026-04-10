import { motion } from 'motion/react';
const API_URL = import.meta.env.VITE_API_URL;
import { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, FileText, Award, Users, Code, Map, Bell, User, Settings, Code2, Calendar, CheckCircle2, Clock, Upload, ArrowRight, LogOut, MessageSquare, Menu } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentAssignmentsProps {
  navigate: (page: string, role?: any, state?: any) => void;
  logout: () => void;
  userRole: 'student';
}



export default function StudentAssignments({ navigate, logout, userRole }: StudentAssignmentsProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments', active: true },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
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
    navigate('login');
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(
          "${API_URL}/api/assignments/student/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("Assignments response:", data);
        const mappedAssignments = data.map((item: any) => ({
          id: item.assignment_id,
          title: item.assignment_title,
          course: item.course_title,
          points: item.questions_count || 0,
          dueDate: "No due date",
          status:
            item.attempts_used === 0
              ? "pending"
              : "graded"
        }));

        setAssignments(mappedAssignments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Helper function to render assignment card
  const renderAssignmentCard = (assignment: typeof assignments[0]) => (
    <motion.div key={assignment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3>{assignment.course}</h3>
                <Badge
                  variant={assignment.status === 'graded' ? 'default' : assignment.status === 'submitted' ? 'secondary' : 'outline'}
                  className={
                    assignment.status === 'graded'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : assignment.status === 'submitted'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'border-violet-600 text-violet-600'
                  }
                >
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />Full Course Assignment</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due: {assignment.dueDate}</span>
                <span className="flex items-center gap-1"><Award className="h-4 w-4" />{assignment.points} points</span>
              </div>
              {assignment.status === 'graded' && assignment.grade && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Grade: {assignment.grade}%</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {assignment.status === 'pending' && (
                <Button
                  onClick={() =>
                    navigate("assignment-details", undefined, {
                      assignmentId: assignment.id
                    })
                  }
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Take Assignment
                </Button>
              )}
              {assignment.status === 'submitted' && (
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <Clock className="mr-2 h-4 w-4" />Waiting
                </Button>
              )}
              {assignment.status === 'graded' && (
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() =>
                    navigate("assignment-feedback", undefined, {
                      assignmentId: assignment.id
                    })
                  }>
                  View Feedback
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-assignments"
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
                <h1 className="text-xl md:text-2xl">Assignments</h1>
                <p className="text-gray-600 text-sm md:text-base">Track your assignments and submissions</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="graded">Graded</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6 space-y-4">
                {assignments.map(renderAssignmentCard)}
              </TabsContent>

              <TabsContent value="pending" className="mt-6 space-y-4">
                {assignments.filter((a) => a.status === 'pending').map(renderAssignmentCard)}
              </TabsContent>

              <TabsContent value="submitted" className="mt-6 space-y-4">
                {assignments.filter((a) => a.status === 'submitted').map(renderAssignmentCard)}
              </TabsContent>

              <TabsContent value="graded" className="mt-6 space-y-4">
                {assignments.filter((a) => a.status === 'graded').map(renderAssignmentCard)}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}