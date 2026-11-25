import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Card';
import { getCookie, API_BASE_URL } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  User,
  Sliders,
  ShieldCheck,
  KeyRound,
  Link2,
} from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'diagnostics', label: 'Diagnostics', icon: Server },
  { id: 'integrations', label: 'Integrations', icon: Sliders },
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [collabUrl, setCollabUrl] = useState(
    () => localStorage.getItem('convergedesk_collab_server_url') || 'http://127.0.0.1:80'
  );
  const [geminiKey, setGeminiKey] = useState(
    () => localStorage.getItem('convergedesk_gemini_key') || ''
  );
  const [apiStatus, setApiStatus] = useState('checking');
  const [csrfCookie, setCsrfCookie] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');

  const { success } = useToast();

  const runDiagnostics = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/projects/list/`, { credentials: 'include' });
      if (res.ok || res.status === 401 || res.status === 403 || res.redirected) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch {
      setApiStatus('disconnected');
    }
    setCsrfCookie(getCookie('csrftoken'));
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-5 text-[var(--text-primary)] md:p-8">
      <PageHeader
        eyebrow="Account & system"
        title="Settings"
        description="Your identity, connection health and the integrations that power the workspace."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 lg:flex-col">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-[7px] px-3 py-2 text-left font-display text-[12px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-3 hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3.5 lg:block">
            <p className="sx-eyebrow">Environment</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
              Client settings are stored locally in this browser. Secrets never leave your machine
              except to the service that needs them.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          {/* Profile */}
          <div id="profile" className="scroll-mt-24">
            <Panel
              eyebrow="Identity"
              title="Profile"
              description="The account you're signed in with."
              bodyClassName="p-5"
              actions={
                isAuthenticated && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--success)]">
                    <ShieldCheck className="h-3 w-3" /> Authenticated
                  </span>
                )
              }
            >
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-[16px] font-bold text-[var(--accent)]">
                      {(user?.username?.[0] || 'U').toUpperCase()}
                    </span>
                    <div>
                      <p className="font-display text-[15px] font-semibold">{user.username}</p>
                      <p className="text-[12px] text-[var(--text-muted)]">{user.email || 'No email set'}</p>
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-3">
                    {[
                      ['User ID', `#${user.id}`],
                      ['Username', user.username],
                      ['Email', user.email || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[var(--surface-raised)] px-3.5 py-3">
                        <dt className="sx-eyebrow">{label}</dt>
                        <dd className="mt-1 truncate text-[12px] text-[var(--text-primary)]">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 flex justify-end border-t border-[var(--border-subtle)] pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        await logout();
                        navigate('/landing');
                      }}
                      leftIcon={<LogOut className="h-3.5 w-3.5" />}
                    >
                      Sign out
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-[12.5px] text-[var(--text-muted)]">
                  No authenticated session active.
                </p>
              )}
            </Panel>
          </div>

          {/* Diagnostics */}
          <div id="diagnostics" className="scroll-mt-24">
            <Panel
              eyebrow="System"
              title="Connection health"
              description="Verify the API endpoint this client is talking to."
              bodyClassName="p-5"
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={runDiagnostics}
                  leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />}
                >
                  Check again
                </Button>
              }
            >
              <div className="flex flex-col gap-3 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-[12.5px] font-semibold">Backend API</p>
                  <p className="mt-0.5 truncate font-mono text-[10.5px] text-[var(--text-muted)]">
                    {API_BASE_URL}
                  </p>
                </div>
                {apiStatus === 'checking' ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Checking
                  </span>
                ) : apiStatus === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--success)]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--error-soft)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--error)]">
                    <XCircle className="h-3.5 w-3.5" /> Disconnected
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[var(--border-subtle)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span className="text-[12px] text-[var(--text-secondary)]">CSRF token</span>
                </div>
                <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                  {csrfCookie ? 'Present' : 'Not found'}
                </span>
              </div>
            </Panel>
          </div>

          {/* Integrations */}
          <div id="integrations" className="scroll-mt-24">
            <Panel
              eyebrow="Studio"
              title="Integrations & endpoints"
              description="Local configuration for the canvas assistant and collaboration server."
              bodyClassName="p-5"
            >
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 font-display text-xs font-semibold text-[var(--text-secondary)]">
                    <Sliders className="h-3.5 w-3.5" /> Gemini API key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy…"
                      className="h-10 flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 font-mono text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)]"
                    />
                    <Button
                      size="md"
                      variant="secondary"
                      onClick={() => {
                        localStorage.setItem('convergedesk_gemini_key', geminiKey);
                        success('Key saved', 'Gemini API key stored in local browser settings.');
                      }}
                    >
                      Save
                    </Button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    Used by the draw-to-code assistant to synthesise UI from a canvas.
                  </p>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-5">
                  <label className="mb-1.5 flex items-center gap-1.5 font-display text-xs font-semibold text-[var(--text-secondary)]">
                    <Link2 className="h-3.5 w-3.5" /> Collaboration server
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={collabUrl}
                      onChange={(e) => setCollabUrl(e.target.value)}
                      placeholder="http://127.0.0.1:80"
                      className="h-10 flex-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 font-mono text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)]"
                    />
                    <Button
                      size="md"
                      variant="secondary"
                      onClick={() => {
                        localStorage.setItem('convergedesk_collab_server_url', collabUrl);
                        success('Settings updated', `Collaboration server set to ${collabUrl}`);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    Endpoint used by documents, canvases and the code workspace.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};
