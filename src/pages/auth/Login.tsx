// ============================================================
// Login.tsx — Clean Version
// Applies: Single Responsibility, Dependency Inversion
// No axios — uses authApi (native fetch)
// ============================================================

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Code2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";
import GoogleGSIButton from "../../GoogleGSIButton";
import { useNavigate } from "react-router-dom";
import { validatePassword, STRONG_PASSWORD_REGEX } from "../../utils/passwordValidation";
import { login, googleAuth } from "../auth/config/authApi";

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";

// ─── Pure helper ──────────────────────────────────────────────

const navigateByRole = (role: string, navigate: (path: string, opts?: any) => void) => {
  const routes: Record<string, string> = {
    admin: "/admin/dashboard",
    instructor: "/instructor/dashboard",
    student: "/student/dashboard",
  };
  navigate(routes[role] ?? "/student/dashboard", { replace: true });
};

// ─── Main Component ──────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user) navigateByRole(user.role, navigate);
  }, []);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value, STRONG_PASSWORD_REGEX));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validatePassword(password, STRONG_PASSWORD_REGEX);
    setPasswordError(err);
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Logged in successfully");

      const redirect = localStorage.getItem("redirectAfterAuth");
      if (redirect) {
        const parsed = JSON.parse(redirect);
        localStorage.removeItem("redirectAfterAuth");
        navigate("/" + parsed.page, { replace: true });
        return;
      }

      navigateByRole(user.role, navigate);
    } catch (err: any) {
      const msg = err?.message ?? "Login failed";
      if (msg === "Please verify your email before login.") {
        localStorage.setItem("pendingVerification", JSON.stringify({ email, role: "student" }));
        toast.error("Please verify your email before logging in.");
        navigate("/verification");
        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGsiCallback = async (response: any) => {
    const idToken: string | undefined = response?.credential;
    if (!idToken) { toast.error("Google authentication failed"); return; }

    setLoading(true);
    try {
      const { token, user } = await googleAuth(idToken);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Signed in with Google");
      navigateByRole(user.role, navigate);
    } catch (err: any) {
      toast.error(err?.message ?? "Google Sign in failed");
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
          <h1 className="text-3xl mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10" value={password} onChange={(e) => handlePasswordChange(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me</Label>
                </div>
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-cyan-600 hover:text-cyan-700">Forgot password?</button>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">Or continue as Student with</span>
            </div>

            <GoogleGSIButton clientId={GOOGLE_CLIENT_ID} onCredential={handleGsiCallback} />

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-cyan-600 hover:text-cyan-700">Sign up</button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
      <AIAssistant />
    </div>
  );
}