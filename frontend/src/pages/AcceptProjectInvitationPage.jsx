import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { request } from '../api/client';
import { acceptProjectInvitation, getProjectInvitationDetails } from '../api/projects';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { CheckCircle2, AlertCircle, Mail, Lock, User } from 'lucide-react';

export function AcceptProjectInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [invitation, setInvitation] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        setError('This invitation link is missing its token.');
        setInvitationLoading(false);
        return;
      }
      try {
        const details = await getProjectInvitationDetails(token);
        if (!cancelled) setInvitation(details);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load invitation details.'
          );
        }
      } finally {
        if (!cancelled) setInvitationLoading(false);
      }
    }

    loadInvitation();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('This invitation link is missing its token.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!invitation?.email) {
          throw new Error(
            'Invitation details are not available. Please reopen your invitation link.'
          );
        }
        await request('/accounts/signup/', {
          method: 'POST',
          body: JSON.stringify({ username, email: invitation.email, password }),
        });
      }

      if (mode === 'signup' || mode === 'login') {
        await request('/accounts/login/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
      }

      await acceptProjectInvitation(token);
      setMessage('Invitation accepted! Redirecting to your projects…');
      setTimeout(() => navigate('/projects'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept the invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="You're invited"
      title="Join the project"
      description="Sign in or create an account with the email address that was invited."
      footer={
        <p className="text-[12px] text-[var(--text-muted)]">
          Need help? Return to the{' '}
          <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">
            login page
          </Link>
          .
        </p>
      }
    >
      {invitationLoading ? (
        <p className="text-[12.5px] text-[var(--text-muted)]">Loading invitation details…</p>
      ) : invitation ? (
        <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
          <p className="text-[12.5px] text-[var(--text-secondary)]">
            You've been invited to join{' '}
            <strong className="text-[var(--text-primary)]">{invitation.project_name}</strong>.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> {invitation.email}
            </span>
            <span className="capitalize">Role · {invitation.role}</span>
          </div>
        </div>
      ) : null}

      <div className="mb-5">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          className="w-full [&>button]:flex-1"
          options={[
            { value: 'login', label: 'Sign in' },
            { value: 'signup', label: 'Create account' },
          ]}
        />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <Input
            label="Invited email"
            type="email"
            required
            value={invitation?.email || email}
            onChange={(event) => setEmail(event.target.value)}
            readOnly={Boolean(invitation?.email)}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        )}
        <Input
          label="Username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          leftIcon={<User className="h-4 w-4" />}
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
        />

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-[8px] border border-[var(--error)]/25 bg-[var(--error-soft)] p-2.5 text-[11.5px] text-[var(--error)]"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-[8px] border border-[var(--success)]/25 bg-[var(--success-soft)] p-2.5 text-[11.5px] text-[var(--success)]"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {message}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading} isLoading={loading}>
          {mode === 'signup' ? 'Create account and accept' : 'Sign in and accept'}
        </Button>
      </form>
    </AuthLayout>
  );
}
