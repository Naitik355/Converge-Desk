import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Lock, User, Mail, ArrowRight } from 'lucide-react';

export const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError('Please provide username, email and password');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await signup({ username: username.trim(), email: email.trim(), password });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your workspace"
      description="One account for your projects, documents, task boards and code."
      footer={
        <div className="flex flex-col gap-2 text-[12px] text-[var(--text-muted)]">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign in
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
          placeholder="choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="username"
          autoFocus
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="name@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};
