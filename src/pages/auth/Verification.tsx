// ============================================================
// Verification.tsx — Clean Version
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Code2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";
import { useNavigate } from "react-router-dom";
import { verifyEmail, resendVerification } from "../auth/config/authApi";

// ─── Reusable OTP Input ───────────────────────────────────────

interface OtpInputProps {
  code: string[];
  inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

function OtpInput({ code, inputRefs, onChange, onKeyDown, onPaste }: OtpInputProps) {
  return (
    <div className="flex gap-2 justify-center" onPaste={onPaste}>
      {code.map((digit, index) => (
        <input key={index} ref={(el) => { inputRefs.current[index] = el; }}
          type="text" inputMode="numeric" pattern="\d*" maxLength={1}
          value={digit} onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
          autoFocus={index === 0} />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function Verification() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const pending = localStorage.getItem("pendingVerification");
    if (pending) {
      try { setUserEmail(JSON.parse(pending).email); }
      catch { console.error("Invalid pendingVerification data"); }
    } else {
      toast.error("No verification session. Please sign up again.");
      navigate("/signup");
    }
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ─── OTP handlers ─────────────────────────────────────────

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...code];
      if (!code[index] && index > 0) { inputRefs.current[index - 1]?.focus(); next[index - 1] = ""; }
      else next[index] = "";
      setCode(next);
    } else if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
    else if (e.key === "Enter" && code.join("").length === 6) handleVerify();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(paste)) return;
    const newCode = ["", "", "", "", "", ""];
    paste.split("").forEach((d, i) => { if (i < 6) { newCode[i] = d; if (inputRefs.current[i]) inputRefs.current[i]!.value = d; } });
    setCode(newCode);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  // ─── Actions ──────────────────────────────────────────────

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) { toast.error("Please enter all 6 digits"); return; }
    if (!userEmail) { toast.error("Missing email to verify"); return; }

    setIsVerifying(true);
    try {
      const res = await verifyEmail(userEmail, verificationCode);
      if (!res?.user || !res?.token) throw new Error("Invalid verification response");
      localStorage.removeItem("pendingVerification");
      toast.success("Email verified successfully! Please login.");
      setTimeout(() => navigate("/login"), 500);
    } catch (err: any) {
      toast.error(err?.message ?? "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!userEmail) { toast.error("No email to resend code to"); return; }
    if (resendTimer > 0) return;
    try {
      const res = await resendVerification(userEmail);
      toast.success(res.message ?? "Verification code resent!");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current.forEach((el) => { if (el) el.value = ""; });
      inputRefs.current[0]?.focus();
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 cursor-pointer mb-4" onClick={() => navigate("/")}>
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-3 rounded-xl"><Code2 className="h-8 w-8 text-white" /></div>
            <span className="text-2xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">TechHub</span>
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
                <OtpInput code={code} inputRefs={inputRefs} onChange={handleChange} onKeyDown={handleKeyDown} onPaste={handlePaste} />
              </div>
              <Button type="submit" disabled={isVerifying || code.join("").length !== 6} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 disabled:opacity-50">
                {isVerifying ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mr-2"><Mail className="h-4 w-4" /></motion.div>Verifying...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-4 w-4" />Verify Email</>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button onClick={handleResend} disabled={resendTimer > 0}
                className={`text-sm ${resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-violet-600 hover:text-violet-700 font-medium"}`}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button onClick={() => navigate("/signup")} className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />Back to Sign Up
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