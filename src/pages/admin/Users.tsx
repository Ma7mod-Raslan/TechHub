// ============================================================
// Users.tsx — Admin User Management (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { useState, useEffect } from "react";
import { Users, BookOpen, MessageSquare, Ban, CheckCircle, Search, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { fetchInstructors, fetchStudents, toggleUserStatus } from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";

interface AdminUsersProps {
  logout: () => void;
  userRole: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  joinedDate: string;
  status: "Active" | "Suspended";
  courses: number;
}

// ─── Pure helpers (no side effects) ─────────────────────────

const mapUser = (user: any): UserData => ({
  id: user.id,
  name: user.full_name,
  email: user.email,
  joinedDate: user.created_at,
  status: user.is_active ? "Active" : "Suspended",
  courses: user.courses_count ?? user.enrolled_courses ?? 0,
});

const formatDateTime = (dateString: string): string =>
  new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─── Sub-component: User Table ───────────────────────────────

interface UserTableProps {
  users: UserData[];
  role: "instructor" | "student";
  searchTerm: string;
  onAction: (user: UserData, action: "suspend" | "activate", type: "instructor" | "student") => void;
}

function UserTable({ users, role, searchTerm, onAction }: UserTableProps) {
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>{role === "instructor" ? "Courses" : "Enrolled Courses"}</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={role === "instructor" ? "bg-violet-100 text-violet-700" : "bg-cyan-100 text-cyan-700"}>
                      {role === "instructor" ? "Instructor" : "Student"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.courses}</TableCell>
                  <TableCell className="text-gray-600">{formatDateTime(user.joinedDate)}</TableCell>
                  <TableCell>
                    <Badge className={user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => onAction(user, user.status === "Active" ? "suspend" : "activate", role)}
                    >
                      {user.status === "Active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function AdminUsers({ logout }: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState<UserData[]>([]);
  const [students, setStudents] = useState<UserData[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean; user: UserData | null;
    action: "suspend" | "activate"; type: "instructor" | "student";
  }>({ show: false, user: null, action: "suspend", type: "instructor" });

  useEffect(() => {
    fetchInstructors().then((data: any) => setInstructors(data.map(mapUser))).catch(console.error);
    fetchStudents().then((data: any) => setStudents(data.map(mapUser))).catch(console.error);
  }, []);

  const handleAction = (user: UserData, action: "suspend" | "activate", type: "instructor" | "student") =>
    setConfirmAction({ show: true, user, action, type });

  const confirmHandler = async () => {
    if (!confirmAction.user) return;
    try {
      await toggleUserStatus(confirmAction.user.id);
      const toggleStatus = (u: UserData): UserData =>
        u.id === confirmAction.user!.id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u;
      setInstructors((prev) => prev.map(toggleStatus));
      setStudents((prev) => prev.map(toggleStatus));
    } catch (err) {
      console.error(err);
    }
    setConfirmAction({ show: false, user: null, action: "suspend", type: "instructor" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/users")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
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
            <div className="mb-6 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <Tabs defaultValue="instructors" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="instructors">Instructors</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
              </TabsList>
              <TabsContent value="instructors">
                <UserTable users={instructors} role="instructor" searchTerm={searchTerm} onAction={handleAction} />
              </TabsContent>
              <TabsContent value="students">
                <UserTable users={students} role="student" searchTerm={searchTerm} onAction={handleAction} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <AlertDialog open={confirmAction.show} onOpenChange={() => setConfirmAction({ show: false, user: null, action: "suspend", type: "instructor" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction.action} this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmHandler}>
              {confirmAction.action === "suspend" ? "Suspend" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}