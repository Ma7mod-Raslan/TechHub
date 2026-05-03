import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, BookOpen, MessageSquare, FileText, Bell, User, Settings, LogOut, Search, Filter, Ban, CheckCircle, Menu } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Code2 } from 'lucide-react';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

interface UsersProps {
  logout: () => void;
  userRole: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  joinedDate: string;
  status: 'Active' | 'Suspended';
  courses: number;
}


export default function AdminUsers({ logout }: UsersProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorsData, setInstructorsData] = useState<UserData[]>([]);
  const [studentsData, setStudentsData] = useState<UserData[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    user: UserData | null;
    action: 'suspend' | 'activate';
    type: 'instructor' | 'student';
  }>({ show: false, user: null, action: 'suspend', type: 'instructor' });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
    { icon: Users, label: 'Users', page: '/admin/users', active: true },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses' },
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities' },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile' },
    { icon: Settings, label: 'Settings', page: '/admin/settings' },
  ];

  const filterUsers = (users: UserData[]) => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAction = (user: UserData, action: 'suspend' | 'activate', type: 'instructor' | 'student') => {
    setConfirmAction({ show: true, user, action, type });
  };

  const confirmActionHandler = async () => {
    if (!confirmAction.user) return;

    try {
      const token = localStorage.getItem("accessToken");

      await fetch(
        `/api/admin/users/${confirmAction.user.id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update UI بعد التغيير
      setInstructorsData((prev) =>
        prev.map((u) =>
          u.id === confirmAction.user?.id
            ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
            : u
        )
      );

      setStudentsData((prev) =>
        prev.map((u) =>
          u.id === confirmAction.user?.id
            ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
            : u
        )
      );
    } catch (err) {
      console.error(err);
    }

    setConfirmAction({
      show: false,
      user: null,
      action: 'suspend',
      type: 'instructor'
    });
  };

  const mapUser = (user: any): UserData => ({
    id: user.id,
    name: user.full_name,
    email: user.email,
    joinedDate: user.created_at,
    status: user.is_active ? 'Active' : 'Suspended',
    courses: user.courses_count ?? user.enrolled_courses ?? 0,
    
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // instructors
        const instRes = await fetch("/api/admin/instructors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const instData = await instRes.json();

        // students
        const studRes = await fetch("/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const studData = await studRes.json();

        setInstructorsData(instData.map(mapUser));
        setStudentsData(studData.map(mapUser));
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
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
                <h1 className="text-2xl">User Management</h1>
                <p className="text-gray-600">Manage instructors and students on the platform</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-users" />
            </div>
          </header>

          <main className="p-6">
            <Tabs defaultValue="instructors" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="instructors">Instructors</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
              </TabsList>

              {/* Instructors Tab */}
              <TabsContent value="instructors">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search instructors..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Courses</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterUsers(instructorsData).map((instructor) => (
                            <TableRow key={instructor.id}>
                              <TableCell>{instructor.name}</TableCell>
                              <TableCell className="text-gray-600">{instructor.email}</TableCell>
                              <TableCell>
                                <Badge className="bg-violet-100 text-violet-700">Instructor</Badge>
                              </TableCell>
                              <TableCell>{instructor.courses}</TableCell>
                              <TableCell className="text-gray-600">{formatDateTime(instructor.joinedDate)}</TableCell>
                              <TableCell>
                                <Badge className={instructor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {instructor.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  className="text-red-500"
                                  onClick={() => handleAction(instructor, instructor.status === 'Active' ? 'suspend' : 'activate', 'instructor')}
                                >
                                  {instructor.status === 'Active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search students..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Enrolled Courses</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterUsers(studentsData).map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.name}</TableCell>
                              <TableCell className="text-gray-600">{student.email}</TableCell>
                              <TableCell>
                                <Badge className="bg-cyan-100 text-cyan-700">Student</Badge>
                              </TableCell>
                              <TableCell>{student.courses}</TableCell>
                              <TableCell className="text-gray-600">
                                {formatDateTime(student.joinedDate)}
                              </TableCell>
                              <TableCell>
                                <Badge className={student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {student.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  className="text-red-500"
                                  onClick={() => handleAction(student, student.status === 'Active' ? 'suspend' : 'activate', 'student')}
                                >
                                  {student.status === 'Active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <AIAssistant />

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction.show} onOpenChange={() => setConfirmAction({ show: false, user: null, action: 'suspend', type: 'instructor' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction.action === 'suspend' ? 'suspend' : 'activate'} this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmActionHandler}>
              {confirmAction.action === 'suspend' ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}