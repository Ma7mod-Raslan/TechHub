// ============================================================
// ResetPasswordPage.tsx — Clean Version
// Applies: Single Responsibility, DRY
// ============================================================

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Code2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";
import { useNavigate } from "react-router-dom";
import { validatePassword, STRONG_PASSWORD_REGEX } from "../../utils/passwordValidation";
import { resetPassword } from "../auth/config/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    const savedCode = localStorage.getItem("resetCode");
    if (!savedEmail || !savedCode) {
      toast.error("Missing verification data. Start reset process again.");
      navigate("/forgot-password");
      return;
    }
    setUserEmail(savedEmail);
    setResetCode(savedCode);
  }, []);

  const handleNewPasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, newPassword: value }));
    setPasswordError(validatePassword(value, STRONG_PASSWORD_REGEX));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validatePassword(formData.newPassword, STRONG_PASSWORD_REGEX);
    setPasswordError(err);
    if (err) { toast.error(err); return; }
    if (formData.newPassword !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!userEmail || !resetCode) { toast.error("Missing email or code — start process again"); navigate("/forgot-password"); return; }

    setIsUpdating(true);
    try {
      const res = await resetPassword(userEmail, resetCode, formData.newPassword);
      toast.success(res.message ?? "Password updated successfully!");
      setIsSuccess(true);
      localStorage.removeItem("resetCode");
      localStorage.removeItem("resetEmail");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reset password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 cursor-pointer mb-4" onClick={() => navigate("/")}>
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-3 rounded-xl"><Code2 className="h-8 w-8 text-white" /></div>
            <span className="text-2xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">TechHub</span>
          </motion.div>
          <h1 className="text-3xl mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="newPassword" type={showNew ? "text" : "password"} placeholder="Enter new password" className="pl-10 pr-10"
                      value={formData.newPassword} onChange={(e) => handleNewPasswordChange(e.target.value)} required />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Confirm new password" className="pl-10 pr-10"
                      value={formData.confirmPassword} onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))} required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 disabled:opacity-50">
                  {isUpdating ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2">Password Updated!</h3>
                  <p className="text-gray-600 text-sm">Your password has been successfully reset. Redirecting to login...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <AIAssistant />
    </div>
  );
}