import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Lock, User, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to ConvergeDesk"
      description="Pick up where your team left off — documents, tasks and canvases are waiting."
      footer={
        <div className="flex flex-col gap-2 text-[12px] text-[var(--text-muted)]">
          <p>
            New to ConvergeDesk?{' '}
            <Link to="/signup" className="font-semibold text-[var(--accent)] hover:underline">
              Create an account
            </Link>
          </p>
          <Link to="/landing" className="text-[11.5px] hover:text-[var(--text-primary)]">
            ← Back to product overview
          </Link>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-control)] border border-[var(--error)]/25 bg-[var(--error-soft)] p-3 text-[12px] text-[var(--error)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          placeholder="your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="username"
          autoFocus
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};
