// src/pages/auth/Verification.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import api from "../../api";

interface VerificationProps {
  navigate: (page: string, role?: "student" | "instructor") => void;
}

export default function Verification({ navigate }: VerificationProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const saved = localStorage.getItem("pendingVerification");
    if (!saved) {
      alert("No verification session. Please sign up again.");
      navigate("signup");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setEmail(parsed.email ?? "");
      setRole(parsed.role ?? "student");
    } catch {
      navigate("signup");
      return;
    }

    // focus first input after a tick to ensure the DOM input exists
    setTimeout(() => {
      inputsRef.current[0]?.focus();
      // put caret at end (redundant for single-char inputs, but safe)
      if (inputsRef.current[0]) {
        inputsRef.current[0]!.setSelectionRange(1, 1);
      }
    }, 50);
  }, [navigate]);

  const handleChange = (value: string, index: number) => {
    // allow only digits, max 1 char
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < inputsRef.current.length - 1) {
      // move focus to next input
      inputsRef.current[index + 1]?.focus();
    }

    // if user filled last input, optionally auto-submit (not doing here)
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;

    if (key === "Backspace") {
      // if current is empty, move to previous and clear it
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const nextOtp = [...otp];
        nextOtp[index - 1] = "";
        setOtp(nextOtp);
      } else {
        // delete current value
        const nextOtp = [...otp];
        nextOtp[index] = "";
        setOtp(nextOtp);
      }
    } else if (key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (key === "Enter") {
      // optionally submit when Enter pressed on any input and code complete
      const code = otp.join("");
      if (code.length === 6) handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const arr = paste.split("");
    const newOtp = ["", "", "", "", "", ""];
    arr.forEach((digit, idx) => {
      newOtp[idx] = digit;
      // fill the actual input values (they will update via setOtp)
      if (inputsRef.current[idx]) {
        inputsRef.current[idx]!.value = digit;
      }
    });
    setOtp(newOtp);
    // focus the next empty or last input
    const nextIndex = Math.min(arr.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }

    try {
      const res = await api.post("/auth/verify-email", {
        email,
        code,
      });

      alert(res.data.message || "Email verified successfully!");
      localStorage.removeItem("pendingVerification");
      navigate("login");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      const res = await api.post("/auth/resend-verification", { email });
      alert(res.data.message || "Verification code resent!");
      setOtp(["", "", "", "", "", ""]);
      // clear inputs' value and focus first
      inputsRef.current.forEach((el) => {
        if (el) el.value = "";
      });
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl text-center mb-3 font-semibold">Verify Your Email</h1>
        <p className="text-center text-gray-700 mb-4">Enter the 6-digit code sent to:</p>
        <p className="text-center text-violet-600 font-semibold mb-4">{email}</p>

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              maxLength={1}
              value={digit}
              inputMode="numeric"
              pattern="\d*"
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-violet-500"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
        >
          Verify Email
        </Button>

        <div className="text-center mt-4">
          <button onClick={handleResend} className="text-cyan-600 hover:text-cyan-700">
            Resend Code
          </button>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate("signup")} className="text-gray-600 hover:text-gray-800 text-sm">
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
