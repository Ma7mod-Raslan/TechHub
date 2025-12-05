// src/pages/auth/ResetPasswordPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import api from '../../api';
import { toast } from 'sonner';
import AIAssistant from "../../components/AIAssistant";

import { validatePassword, STRONG_PASSWORD_REGEX } from '../../utils/passwordValidation';

interface ResetPasswordPageProps {
  navigate: (page: string) => void;
}

export default function ResetPasswordPage({ navigate }: ResetPasswordPageProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Choose which password regex to use
  const PASSWORD_REGEX = STRONG_PASSWORD_REGEX;
  // (If you want digits-only rule, import DIGITS_ONLY_REGEX and use it here)

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    const savedCode = localStorage.getItem('resetCode');
    setUserEmail(savedEmail);
    setResetCode(savedCode);
    // If either missing, redirect back
    if (!savedEmail || !savedCode) {
      toast.error('Missing verification data. Start reset process again.');
      setTimeout(() => navigate('forgot-password'), 800);
    }
  }, [navigate]);

  // Validate new password on change and set inline error
  function handleNewPasswordChange(value: string) {
    setFormData(prev => ({ ...prev, newPassword: value }));
    const err = validatePassword(value, PASSWORD_REGEX);
    setPasswordError(err);
  }

  function handleConfirmPasswordChange(value: string) {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password using shared util
    const err = validatePassword(formData.newPassword, PASSWORD_REGEX);
    setPasswordError(err);
    if (err) {
      toast.error(err);
      return;
    }

    // Confirm match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!userEmail || !resetCode) {
      toast.error('Missing email or code — start process again');
      navigate('forgot-password');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await api.post('/auth/reset-password', {
        email: userEmail,
        code: resetCode,
        new_password: formData.newPassword,
      });

      toast.success(res.data?.message || 'Password updated successfully!');
      setIsSuccess(true);
      // cleanup
      localStorage.removeItem('resetCode');
      localStorage.removeItem('resetEmail');

      setTimeout(() => {
        navigate('login');
      }, 1500);
    } catch (err: any) {
      console.error('Reset password error', err);
      toast.error(err?.response?.data?.error || err?.message || 'Failed to reset password');
    } finally {
      setIsUpdating(false);
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
          <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 cursor-pointer mb-4" onClick={() => navigate('home')}>
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
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                      value={formData.newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50">
                  {isUpdating ? 'Updating Password...' : 'Update Password'}
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
      <AIAssistant/>
    </div>
  );
}
