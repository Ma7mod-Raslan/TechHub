// ============================================================
// Settings.tsx — Instructor Settings (Clean Version)
// ============================================================

import { useEffect, useState } from "react";
import { Shield, Lock, Eye, EyeOff, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { changePassword } from "./config/instructorApi";
import { getInstructorMenuItems } from "./config/instructorMenu";

interface Props { logout: () => void; userRole: "instructor"; }

const isValidPassword = (p: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+\\|;:'",.<>\/?]).{8,}$/.test(p);

export default function InstructorSettings({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "instructor") navigate(`/${u.role}/dashboard`, { replace: true });
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error("Please fill in all fields"); return; }
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match"); return; }
    if (!isValidPassword(newPassword)) { toast.error("Password must be at least 8 characters with uppercase, lowercase, number and special character"); return; }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    { label: "Current Password", value: currentPassword, setter: setCurrentPassword, key: "current" as const, placeholder: "Enter current password" },
    { label: "New Password",     value: newPassword,     setter: setNewPassword,     key: "new" as const,     placeholder: "Enter new password"     },
    { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword,  key: "confirm" as const,  placeholder: "Confirm new password"   },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getInstructorMenuItems("/instructor/settings")} logout={logout} userRole="instructor" activePage="instructor-settings" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div><h1 className="text-2xl">Settings</h1><p className="text-gray-600">Manage your preferences and account settings</p></div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} currentPage="settings" />
            </div>
          </header>

          <main className="p-6 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordFields.map(({ label, value, setter, key, placeholder }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <div className="relative mt-2">
                      <Input type={show[key] ? "text" : "password"} placeholder={placeholder} className="pr-10" value={value} onChange={(e) => setter(e.target.value)} />
                      <button type="button" onClick={() => setShow((prev) => ({ ...prev, [key]: !prev[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <Button onClick={handleChangePassword} disabled={loading} className="bg-gradient-to-r from-violet-600 to-cyan-500">
                  <Lock className="mr-2 h-4 w-4" />{loading ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}