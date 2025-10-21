// src/features/auth/pages/SignIn.tsx
import React, { useState } from 'react';
import { login } from '../../../api/authService';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios'; // ✅ إضافة نوع AxiosError

export default function SignIn() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await login({ email, password });

      // Adjust according to backend response shape:
      const user = res.data?.user ?? res.data;
      setUser(user);

      // redirect by role
      if (user?.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    } catch (error) {
      console.error('login error', error);
      let message = 'Login failed — check credentials or server';

      // ✅ استخدام AxiosError بدلاً من any
      if (error instanceof AxiosError) {
        message = error.response?.data?.message ?? message;
      }

      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
      <h2>Sign In</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', margin: '8px 0', padding: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', margin: '8px 0', padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </div>
  );
}
