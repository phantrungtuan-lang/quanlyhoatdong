import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Button, Input, Spinner } from '../components/ui';

const LoginPage: React.FC = () => {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Quản lý hoạt động giáo viên
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="Tên đăng nhập"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
             <div className="h-2"></div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Đăng nhập'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;