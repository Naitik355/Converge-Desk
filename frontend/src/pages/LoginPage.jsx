import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Terminal, Lock, User, ArrowRight, Sun, Moon, Layout } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { theme, cycleTheme, isDark, isLight, isBrutalist } = useTheme();
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--surface-canvas)] text-[var(--text-primary)] relative overflow-hidden transition-colors">
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={cycleTheme}
          className="p-2 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 text-xs font-mono"
          title={`Switch to ${isDark ? 'Light Brutalist' : 'Dark Brutalist'}`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-[var(--signal-teal)]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[var(--signal-amber)]" />
          )}
          <span className="hidden sm:inline uppercase text-[10px]">{isDark ? 'DARK BRUTALIST' : 'LIGHT BRUTALIST'}</span>
        </button>
      </div>

      <div className="w-full max-w-md glass-card p-7 sm:p-9 space-y-6 relative z-10 border-2 border-[var(--border-subtle)]">
        {/* Technical Stamp Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-11 h-11 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] items-center justify-center text-[var(--signal-teal)] mb-2 shadow-xs">
            <Terminal className="w-5 h-5 font-bold" />
          </div>
          <div className="mono-label text-[var(--signal-teal)] text-[10px]">
            [AUTH GATEWAY // SECURE SESSION]
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[var(--text-primary)] tracking-tight">
            Sign In to ConvergeDesk
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-mono">
            Access your collaborative docs, boards, and sprint pipelines.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-[var(--signal-coral)] text-[var(--signal-coral)] text-xs font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="USERNAME"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-[var(--signal-teal)]" />}
            autoFocus
            required
          />
          <Input
            label="PASSWORD"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-[var(--signal-teal)]" />}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            AUTHENTICATE & ENTER
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] space-y-2">
          <p>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-[var(--signal-teal)] hover:underline ml-1"
            >
              CREATE AN ACCOUNT
            </Link>
          </p>
          <p>
            <Link
              to="/landing"
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← Back to Product Overview
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
