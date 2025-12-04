// src/pages/auth/VerifyResetCode.tsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import api from '../../api';
import { toast } from 'sonner';

interface VerifyResetCodeProps {
  navigate: (page: string) => void;
  email?: string;
}

export default function VerifyResetCode({ navigate, email: propEmail }: VerifyResetCodeProps) {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [userEmail, setUserEmail] = useState<string>(propEmail || '');

  useEffect(() => {
    // prefer prop, otherwise try localStorage
    if (!propEmail) {
      const saved = localStorage.getItem('resetEmail');
      if (saved) setUserEmail(saved);
    }
    // focus first box shortly after mount
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...code];
        next[index - 1] = '';
        setCode(next);
      } else {
        const next = [...code];
        next[index] = '';
        setCode(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const joined = code.join('');
      if (joined.length === 6) handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim().slice(0, 6);
    if (!/^\d+$/.test(paste)) return;
    const arr = paste.split('');
    const newCode = ['', '', '', '', '', ''];
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e && typeof (e as React.FormEvent).preventDefault === 'function') (e as React.FormEvent).preventDefault();
    const codeString = code.join('');
    if (codeString.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    if (!userEmail) {
      toast.error('Missing email — start from Reset Password page again');
      navigate('forgot-password');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await api.post('/auth/verify-reset', { email: userEmail, code: codeString });
      toast.success(res.data?.message || 'Code verified successfully!');
      // Save code/email for next step
      localStorage.setItem('resetEmail', userEmail);
      localStorage.setItem('resetCode', codeString);
      // navigate to reset password page
      setTimeout(() => navigate('reset-password'), 700);
    } catch (err: any) {
      console.error('Verify reset error', err);
      toast.error(err?.response?.data?.error || err?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
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
            onClick={() => navigate('home')}
          >
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-3 rounded-xl">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              TechHub
            </span>
          </motion.div>
          <h1 className="text-3xl mb-2">Enter Verification Code</h1>
          <p className="text-gray-600">We've sent a 6-digit code to</p>
          <p className="text-violet-600 font-medium mt-1">{userEmail || 'your email'}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm text-center mb-4">Enter Verification Code</label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isVerifying || code.join('').length !== 6}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                onClick={async () => {
                  // resend: call forgot-password again
                  if (!userEmail) {
                    toast.error('Missing email to resend code');
                    return;
                  }
                  try {
                    await api.post('/auth/forgot-password', { email: userEmail });
                    toast.success('A new code was sent to your email!');
                    setCode(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                  } catch (err: any) {
                    toast.error(err?.response?.data?.error || 'Failed to resend code');
                  }
                }}
                className="text-sm text-cyan-600 hover:text-cyan-700"
              >
                Resend Code
              </button>
            </div>

            <div className="text-center mt-4">
              <button onClick={() => navigate('forgot-password')} className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to Email
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
    </div>
  );
}
