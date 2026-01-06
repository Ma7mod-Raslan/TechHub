// src/pages/auth/Verification.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Code2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import api from "../../api";
import AIAssistant from "../../components/AIAssistant";


interface VerificationProps {
  navigate: (page: string, role?: "student" | "instructor") => void;
  email?: string;
  role?: "student" | "instructor";
}

export default function Verification({ navigate, email, role }: VerificationProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [userEmail, setUserEmail] = useState<string | undefined>(email);
  const [userRole, setUserRole] = useState<"student" | "instructor" | undefined>(role);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Load pending verification from localStorage if exists
  useEffect(() => {
    const pending = localStorage.getItem("pendingVerification");
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (!userEmail) setUserEmail(parsed.email ?? undefined);
        if (!userRole) setUserRole(parsed.role ?? undefined);
      } catch {
        // ignore parse errors
      }
    } else {
      // if no pending and no email prop, redirect back to signup
      if (!email) {
        toast.error("No verification session. Please sign up again.");
        navigate("signup");
      }
    }

    // focus first input after mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...code];
        next[index - 1] = "";
        setCode(next);
      } else {
        const next = [...code];
        next[index] = "";
        setCode(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const joined = code.join("");
      if (joined.length === 6) handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const arr = paste.split("");
    const newCode = ["", "", "", "", "", ""];
    arr.forEach((d, i) => {
      if (i < 6) {
        newCode[i] = d;
        if (inputRefs.current[i]) inputRefs.current[i]!.value = d;
      }
    });
    setCode(newCode);
    const nextIndex = Math.min(arr.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent | undefined) => {
    if (e && typeof (e as React.FormEvent).preventDefault === "function") {
      (e as React.FormEvent).preventDefault();
    }

    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    if (!userEmail) {
      toast.error("Missing email to verify");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.post("/auth/verify-email", {
        email: userEmail,
        code: verificationCode,
      });

      console.log("VERIFY RESPONSE 👉", res.data);

      // 🛑 تأكدي إن الداتا موجودة
      if (!res.data?.user || !res.data?.token) {
        throw new Error("Invalid verification response");
      }

      // ✅ خزني
      localStorage.setItem("accessToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // header للـ axios
      api.defaults.headers.common["Authorization"] =
        `Bearer ${res.data.token}`;

      localStorage.removeItem("pendingVerification");

      toast.success("Email verified successfully!");

      setTimeout(() => {
        if (res.data.user.role === "instructor") {
          navigate("instructor-dashboard", "instructor");
        } else {
          navigate("student-dashboard", "student");
        }
      }, 500);


    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Verification failed";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!userEmail) {
      toast.error("No email to resend code to");
      return;
    }
    if (resendTimer > 0) return;

    try {
      const res = await api.post("/auth/resend-verification", { email: userEmail });
      toast.success(res.data?.message || "Verification code resent!");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current.forEach((el) => {
        if (el) el.value = "";
      });
      inputRefs.current[0]?.focus();
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to resend code");
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
          <h1 className="text-3xl mb-2">Verify Your Email</h1>
          <p className="text-gray-600">We've sent a 6-digit verification code to</p>
          <p className="text-violet-600 font-medium mt-1">{userEmail}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm text-center mb-4">Enter Verification Code</label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>


              <Button
                type="submit"
                disabled={isVerifying || code.join("").length !== 6}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Mail className="h-4 w-4" />
                    </motion.div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className={`text-sm ${resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-violet-600 hover:text-violet-700 font-medium"}`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button onClick={() => navigate("signup")} className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to Sign Up
              </button>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-2">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Check your spam folder</p>
              <p className="text-blue-700">If you don't see the email in your inbox, please check your spam or junk folder.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <AIAssistant />
    </div>
  );
}
