// src/pages/auth/SignUp.tsx
import React, { useState } from "react";
import { motion } from "motion/react";
import { Code2, Mail, Lock, Eye, EyeOff, User, Presentation, GraduationCap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import api from "../../api";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";
import GoogleGSIButton from "../../GoogleGSIButton";

import { validatePassword, STRONG_PASSWORD_REGEX } from "../../utils/passwordValidation";

interface SignUpProps {
  navigate: (page: string, role?: "student" | "instructor") => void;
  setVerificationData?: (data: { email: string; role: "student" | "instructor"; name?: string }) => void;
}

declare global {
  interface Window {
    google?: any;
    __gsi_initialized?: boolean;
  }
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";

export default function SignUp({ navigate, setVerificationData }: SignUpProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Select password rule
  const PASSWORD_REGEX = STRONG_PASSWORD_REGEX;

  // Validate password on change
  function handlePasswordChange(value: string) {
    setFormData({ ...formData, password: value });
    setPasswordError(validatePassword(value, PASSWORD_REGEX));
  }

  // Google signup handler (GSI)
  async function handleGsiCallback(response: any) {
    const idToken: string | undefined = response?.credential;
    if (!idToken) {
      toast.error("Google authentication failed");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/google", { id_token: idToken, role });
      const data = res.data;

      if (data?.user && data?.token) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Logged in with Google");
        const u = data.user;
        if (u.role === "admin") navigate("admin-dashboard", "admin" as any);
        else if (u.role === "instructor") navigate("instructor-dashboard", "instructor");
        else navigate("student-dashboard", "student");
        setLoading(false);
        return;
      }

      if (data?.user && data?.user.is_verified) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Account created with Google");
        const u = data.user;
        if (u.role === "admin") navigate("admin-dashboard", "admin" as any);
        else if (u.role === "instructor") navigate("instructor-dashboard", "instructor");
        else navigate("student-dashboard", "student");
        setLoading(false);
        return;
      }

      const pendingEmail = (() => {
        try { return JSON.parse(atob(idToken.split(".")[1])).email; } catch { return ""; }
      })();

      if (pendingEmail) {
        localStorage.setItem("pendingVerification", JSON.stringify({ email: pendingEmail, role, name: formData.name }));
        if (setVerificationData) setVerificationData({ email: pendingEmail, role });
        toast.success("Account created with Google. Please verify your email if required.");
        navigate("verification", role);
      } else {
        toast.success("Account created with Google.");
        navigate("student-dashboard", "student");
      }
    } catch (error: any) {
      console.error("Google Signup Error:", error);
      const msg = error?.response?.data?.error || error?.message || "";

      if (String(msg).toLowerCase().includes("registered with a password") || String(msg).toLowerCase().includes("email already registered") || String(msg).toLowerCase().includes("already registered")) {
        toast.error(msg || "This email is already registered. Please sign in.");
        navigate("login");
        setLoading(false);
        return;
      }

      toast.error(msg || "Google signup failed");
    } finally {
      setLoading(false);
    }
  }

  // Regular signup handler
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate password before sending the request
    const err = validatePassword(formData.password, PASSWORD_REGEX);
    setPasswordError(err);
    if (err) {
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/signup", {
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });

      localStorage.setItem("pendingVerification", JSON.stringify({ email: formData.email, role, name: formData.name }));
      toast.success(res.data?.message || "Account created! Please verify your email.");

      if (setVerificationData) setVerificationData({ email: formData.email, role });
      navigate("verification", role);
    } catch (err: any) {
      console.error("Signup error", err);
      const msg = err?.response?.data?.error || err?.message || "Signup failed";

      if (String(msg).toLowerCase().includes("email already registered") || String(msg).toLowerCase().includes("this email is registered")) {
        toast.error(msg);
        navigate("login");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 cursor-pointer mb-4" onClick={() => navigate("home")}>
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-3 rounded-xl"><Code2 className="h-8 w-8 text-white" /></div>
            <span className="text-2xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">TechHub</span>
          </motion.div>
          <h1 className="text-3xl mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start your learning journey today</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* role */}
              <div>
                <Label>I want to sign up as:</Label>
                <RadioGroup value={role} onValueChange={(v: string) => setRole(v as "student" | "instructor")} className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <RadioGroupItem value="student" id="student" className="peer sr-only" />
                    <Label htmlFor="student" className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-cyan-50 cursor-pointer transition-all">
                      <GraduationCap className="h-6 w-6 mb-2 text-cyan-600" />
                      <span className="text-sm">Student</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="instructor" id="instructor" className="peer sr-only" />
                    <Label htmlFor="instructor" className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-cyan-50 cursor-pointer transition-all">
                      <Presentation className="h-6 w-6 mb-2 text-cyan-600" />
                      <span className="text-sm">Instructor</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="name" type="text" placeholder="John Doe" className="pl-10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>

              {/* email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>

              {/* password */}
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

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">Or continue with</span>
            </div>

            {/* GSI button container: pass clientId and callback */}
            <GoogleGSIButton clientId={GOOGLE_CLIENT_ID} onCredential={handleGsiCallback} />

            <p className="text-center text-sm text-gray-600 mt-6">Already have an account? <button onClick={() => navigate("login")} className="text-cyan-600 hover:text-cyan-700">Sign in</button></p>
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
