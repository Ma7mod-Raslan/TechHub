// src/pages/auth/Login.tsx
import { useState } from "react";
import { motion } from "motion/react";
import { loginWithGoogle } from "../../firebase";
import { Code2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import api from "../../api";

interface LoginProps {
  navigate: (page: string, role?: "student" | "instructor" | "admin") => void;
}

export default function Login({ navigate }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================
  //  LOGIN WITH BACKEND
  // ========================
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // save login token + user
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // navigate based on role
      if (user.role === "admin") {
        navigate("admin-dashboard", "admin");
      } else if (user.role === "instructor") {
        navigate("instructor-dashboard", "instructor");
      } else {
        navigate("student-dashboard", "student");
      }
      return;
    } catch (err: any) {
      const msg = err?.response?.data?.error;

      // user is not verified
      if (msg === "Please verify your email before login.") {
        const backendRole = err?.response?.data?.role || "student";

        localStorage.setItem(
          "pendingVerification",
          JSON.stringify({ email, role: backendRole })
        );

        alert("Please verify your email before logging in.");
        navigate("verification", backendRole);
        setLoading(false);
        return;
      }

      alert(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // GOOGLE LOGIN (connected to backend)
  // ============================
  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      if (!user) return;

      const idToken = await user.getIdToken();

      const res = await api.post("/auth/google", { id_token: idToken });
      const { token, user: backendUser } = res.data;

      // save token + user
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(backendUser));

      // navigate by backend role
      if (backendUser.role === "admin") {
        navigate("admin-dashboard", "admin");
      } else if (backendUser.role === "instructor") {
        navigate("instructor-dashboard", "instructor");
      } else {
        navigate("student-dashboard", "student");
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
        err?.message ||
        "Google login failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 cursor-pointer mb-4"
            onClick={() => navigate("home")}
          >
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-3 rounded-xl">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              TechHub
            </span>
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
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("forgot-password")}
                  className="text-sm text-cyan-600 hover:text-cyan-700"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" onClick={handleGoogleLogin}>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>

            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("signup")}
                className="text-cyan-600 hover:text-cyan-700"
              >
                Sign up
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
