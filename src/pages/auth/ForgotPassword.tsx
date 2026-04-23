// src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import api from '../../api';
import { toast } from 'sonner';
import AIAssistant from '../../components/AIAssistant';
import { useNavigate } from "react-router-dom";





export default function ForgotPassword() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      // save email so VerifyResetCode can use it
      localStorage.setItem('resetEmail', email);
      toast.success(res.data?.message || 'Reset code sent to your email!');
      setSent(true);
      // navigate to verify-reset-code (user will input the code)
      navigate('/verify-reset-code');
    } catch (err: any) {
      console.error('Forgot password error', err);
      toast.error(err?.response?.data?.error || err?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
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
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-3 rounded-xl">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              TechHub
            </span>
          </motion.div>
          <h1 className="text-3xl mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            {sent ? "We've sent a password reset code to your email" : "Enter your email and we'll send you a reset code"}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>


            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <AIAssistant />
    </div>


  );
}
