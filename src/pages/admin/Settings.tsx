// ============================================================
// Settings.tsx — Admin Settings (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { useEffect, useState } from "react";
import { Lock, Mail, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { toast } from "sonner";
import { fetchAdminProfile, changePassword, changeEmail } from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";
import { notifyUpdate } from "../../utils/notifications";

interface AdminSettingsProps {
  logout: () => void;
  userRole: string;
}

// ─── Validation helpers (pure functions) ─────────────────────

const isValidPassword = (password: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+\\|;:'",.<>\/?]).{8,}$/.test(password);

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Main Component ──────────────────────────────────────────

export default function AdminSettings({ logout }: AdminSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchAdminProfile()
      .then((data: any) => setCurrentEmail(data.email))
      .catch(console.error);
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (!isValidPassword(newPassword)) return toast.error("Password must be at least 8 characters with uppercase, lowercase, number and special character");
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      notifyUpdate();
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return toast.error("Please enter new email");
    if (!isValidEmail(newEmail)) return toast.error("Invalid email format");
    try {
      await changeEmail(newEmail);
      toast.success("Email updated successfully");
      notifyUpdate();
      setCurrentEmail(newEmail);
      setNewEmail("");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/settings")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
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

              {/* Change Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Change Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Email</Label>
                    <Input value={currentEmail} type="email" disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Email</Label>
                    <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="Enter new email" />
                  </div>
                  <Button onClick={handleChangeEmail} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                    Update Email
                  </Button>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Current Password", value: currentPassword, setter: setCurrentPassword, placeholder: "Enter current password" },
                    { label: "New Password",      value: newPassword,     setter: setNewPassword,     placeholder: "Enter new password"     },
                    { label: "Confirm Password",  value: confirmPassword, setter: setConfirmPassword,  placeholder: "Confirm new password"   },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label} className="space-y-2">
                      <Label>{label}</Label>
                      <Input value={value} onChange={(e) => setter(e.target.value)} type="password" placeholder={placeholder} />
                    </div>
                  ))}
                  <Button onClick={handleChangePassword} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}