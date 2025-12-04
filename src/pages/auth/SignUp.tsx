// src/pages/auth/SignUp.tsx
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Code2, Mail, Lock, Eye, EyeOff, User, GraduationCap, Presentation } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import api from "../../api";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";


interface SignUpProps {
  navigate: (page: string, role?: "student" | "instructor") => void;
  setVerificationData?: (data: { email: string; role: "student" | "instructor" }) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";
console.log("GSI client id =", GOOGLE_CLIENT_ID);

export default function SignUp({ navigate, setVerificationData }: SignUpProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set");
      return;
    }

    const init = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        setGsiReady(false);
        return;
      }
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGsiCallback,
          ux_mode: "popup",
        });
        setGsiReady(true);
      } catch (e) {
        console.warn("GSI init error", e);
        setGsiReady(false);
      }
    };

    const id = "google-identity-script";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.id = id;
      s.onload = init;
      s.onerror = () => console.warn("Failed to load Google Identity Services script");
      document.head.appendChild(s);
    } else {
      init();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Google signup handler (GSI) =====
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

      if (data?.token) localStorage.setItem("accessToken", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      const pendingEmail = data?.user?.email ?? JSON.parse(atob(idToken.split(".")[1])).email;
      localStorage.setItem("pendingVerification", JSON.stringify({ email: pendingEmail, role }));

      toast.success("Account created with Google. Please verify your email.");

      if (setVerificationData) setVerificationData({ email: pendingEmail, role });

      const backendRole: "student" | "instructor" | undefined = data?.user?.role;
      const finalRole = backendRole ?? role;

      navigate("verification", finalRole);
    } catch (error: any) {
      console.error("Google Signup Error:", error);
      toast.error(error?.response?.data?.error || error?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  }

  // Trigger Google Sign-In (custom button)
  const handleGoogleSignup = async (): Promise<void> => {
    if (!gsiReady || !window.google || !window.google.accounts) {
      toast.error("Google Sign-In not ready yet");
      return;
    }
    try {
      window.google.accounts.id.prompt(); // will open popup/chooser
    } catch (e) {
      console.error("GSI prompt error:", e);
      toast.error("Google Sign-In failed to open");
    }
  };

  // ===== regular signup handler (email/password) =====
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
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
      toast.error(err?.response?.data?.error || err?.message || "Signup failed");
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
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pl-10 pr-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">Or continue with</span>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignup} disabled={loading}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">Already have an account? <button onClick={() => navigate("login")} className="text-cyan-600 hover:text-cyan-700">Sign in</button></p>
          </CardContent>
        </Card>
      </motion.div>
      <AIAssistant/>
    </div>
  );
}
