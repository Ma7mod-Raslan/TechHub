// ============================================================
// SignUp.tsx — Clean Version
// Applies: Single Responsibility, Dependency Inversion
// ============================================================

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Code2, Mail, Lock, Eye, EyeOff, User,
  Presentation, GraduationCap, Briefcase, Layers, Linkedin,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";
import GoogleGSIButton from "../../GoogleGSIButton";
import { useNavigate } from "react-router-dom";
import { validatePassword, STRONG_PASSWORD_REGEX } from "../../utils/passwordValidation";
import { signUp, googleAuth } from "../auth/config/authApi";

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";

// ─── Main Component ──────────────────────────────────────────

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMatchMessage, setShowMatchMessage] = useState(false);
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    jobTitle: "", expertise: "", linkedin: "",
  });

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingVerification");
  }, []);

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePasswordChange = (value: string) => {
    updateField("password", value);
    setPasswordError(validatePassword(value, STRONG_PASSWORD_REGEX));
  };

  const handleConfirmChange = (value: string) => {
    updateField("confirmPassword", value);
    setConfirmPasswordError(null);
    setShowMatchMessage(false);
    if (formData.password && formData.password === value) {
      setShowMatchMessage(true);
      setTimeout(() => setShowMatchMessage(false), 2000);
    }
  };

  // ─── Google Sign Up ───────────────────────────────────────

  const handleGsiCallback = async (response: any) => {
    const idToken: string | undefined = response?.credential;
    if (!idToken) { toast.error("Google authentication failed"); return; }

    setLoading(true);
    try {
      const data = await googleAuth(idToken, role);
      if (data?.token && data?.user) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Signed in with Google");
        navigate(data.user.role === "instructor" ? "/instructor/dashboard" : "/student/dashboard");
        return;
      }

      // Handle pending email verification
      const pendingEmail = (() => {
        try { return JSON.parse(atob(idToken.split(".")[1])).email; }
        catch { return ""; }
      })();
      if (pendingEmail) {
        localStorage.setItem("pendingVerification", JSON.stringify({ email: pendingEmail, role, name: formData.name }));
        navigate("/verification");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Google Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Normal Sign Up ───────────────────────────────────────

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) { toast.error("Please fill in all fields"); return; }
    if (formData.password !== formData.confirmPassword) { setConfirmPasswordError("Passwords do not match"); toast.error("Passwords do not match"); return; }
    if (role === "instructor" && (!formData.jobTitle || !formData.expertise)) { toast.error("Please complete instructor information"); return; }

    const err = validatePassword(formData.password, STRONG_PASSWORD_REGEX);
    setPasswordError(err);
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const res = await signUp({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        job_title: role === "instructor" ? formData.jobTitle : undefined,
        expertise: role === "instructor" ? formData.expertise : undefined,
        linkedin: role === "instructor" ? formData.linkedin : undefined,
      });

      localStorage.setItem("pendingVerification", JSON.stringify({ email: formData.email, role, name: formData.name }));
      toast.success(res.message ?? "Account created! Please verify your email.");
      navigate("/verification");
    } catch (err: any) {
      toast.error(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start your learning journey today</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Role */}
              <div>
                <Label>I want to sign up as:</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as "student" | "instructor")} className="grid grid-cols-2 gap-3 mt-2">
                  {[{ value: "student", icon: <GraduationCap className="h-6 w-6 mb-2 text-cyan-600" />, label: "Student" },
                    { value: "instructor", icon: <Presentation className="h-6 w-6 mb-2 text-cyan-600" />, label: "Instructor" }].map(({ value, icon, label }) => (
                    <div key={value}>
                      <RadioGroupItem value={value} id={value} className="peer sr-only" />
                      <Label htmlFor={value} className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-cyan-50 cursor-pointer transition-all">
                        {icon}<span className="text-sm">{label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="name" type="text" placeholder="John Doe" className="pl-10" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pl-10 pr-10" value={formData.password} onChange={(e) => handlePasswordChange(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password" className="pl-10 pr-10" value={formData.confirmPassword} onChange={(e) => handleConfirmChange(e.target.value)} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {showMatchMessage && <p className="mt-1 text-sm text-green-600">Passwords match</p>}
                {confirmPasswordError && <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>}
              </div>

              {/* Instructor Extra Fields */}
              {role === "instructor" && (
                <>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="jobTitle" type="text" placeholder="Backend Engineer" className="pl-10" value={formData.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expertise">Expertise</Label>
                    <div className="relative mt-1">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="expertise" type="text" placeholder="Node.js, PostgreSQL" className="pl-10" value={formData.expertise} onChange={(e) => updateField("expertise", e.target.value)} required />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                    <div className="relative mt-1">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="linkedin" type="text" placeholder="https://linkedin.com/in/username" className="pl-10" value={formData.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">Or continue as Student with</span>
            </div>

            <GoogleGSIButton clientId={GOOGLE_CLIENT_ID} onCredential={handleGsiCallback} />

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-cyan-600 hover:text-cyan-700">Sign in</button>
            </p>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-2">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Instructors cannot sign in using Google</p>
              <p className="text-blue-700">Please complete the sign-up form instead.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <AIAssistant />
    </div>
  );
}