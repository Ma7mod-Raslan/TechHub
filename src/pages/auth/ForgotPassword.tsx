import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from 'sonner';

interface ForgotPasswordProps {
  navigate: (page: string) => void;
}

export default function ForgotPassword({ navigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Password reset link sent to your email!');
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
          <h1 className="text-3xl mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            {sent
              ? "We've sent a password reset link to your email"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!sent ? (
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

                <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600">
                  Check your email for a link to reset your password. If it doesn't appear within a few minutes, check
                  your spam folder.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSent(false)}
                >
                  Send Again
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('login')}
                className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}