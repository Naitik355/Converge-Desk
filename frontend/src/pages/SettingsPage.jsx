import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
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
  ShieldAlert,
} from 'lucide-react';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [collabUrl, setCollabUrl] = useState(() => {
    return localStorage.getItem('convergedesk_collab_server_url') || 'http://127.0.0.1:80';
  });
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('convergedesk_gemini_key') || '';
  });

  const [apiStatus, setApiStatus] = useState('checking');
  const [csrfCookie, setCsrfCookie] = useState(null);

  const { success } = useToast();

  const runDiagnostics = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/projects/list/`, {
        credentials: 'include',
      });
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

  const handleSaveCollabUrl = () => {
    localStorage.setItem('convergedesk_collab_server_url', collabUrl);
    success('Settings Updated', `Collaboration server set to ${collabUrl}`);
  };

  const handleSaveGeminiKey = () => {
    localStorage.setItem('convergedesk_gemini_key', geminiKey);
    success('AI Key Saved', 'Gemini API key stored in local browser settings.');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Settings & Diagnostics
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
          // Manage system configurations, integration endpoints, and security documentation
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[var(--signal-teal)]" />
            <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">User Session & Identity</h3>
          </div>
          {isAuthenticated && (
            <span className="text-[10px] font-mono font-semibold bg-[var(--surface-raised)] text-[var(--signal-teal)] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
              Authenticated Session
            </span>
          )}
        </div>

        {isAuthenticated && user ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-[var(--surface-canvas)] rounded-[var(--card-radius)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block mb-0.5">User ID</span>
              <span className="font-mono font-semibold text-[var(--signal-teal)]">#{user?.id}</span>
            </div>
            <div className="p-3 bg-[var(--surface-canvas)] rounded-[var(--card-radius)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block mb-0.5">Username</span>
              <span className="font-semibold text-[var(--text-primary)]">{user?.username || 'User'}</span>
            </div>
            <div className="p-3 bg-[var(--surface-canvas)] rounded-[var(--card-radius)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block mb-0.5">Email</span>
              <span className="text-[var(--text-primary)] truncate block">{user?.email || 'None'}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-[var(--text-muted)] italic">No authenticated session active.</p>
        )}

        {isAuthenticated && (
          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                navigate('/landing');
              }}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="text-[var(--signal-coral)] border-[var(--signal-coral)]/40 hover:bg-rose-500/10"
            >
              Sign Out
            </Button>
          </div>
        )}
      </Card>

      {/* Diagnostics and Health */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[var(--signal-teal)]" />
            <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">Live Backend Diagnostics</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={runDiagnostics}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />}
          >
            Check Status
          </Button>
        </div>

        <div className="space-y-3 text-xs">
          {/* API Connectivity */}
          <div className="flex items-center justify-between p-3.5 rounded-[var(--card-radius)] bg-[var(--surface-canvas)] border border-[var(--border-subtle)]">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Backend API Services</p>
              <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{API_BASE_URL}</p>
            </div>
            {apiStatus === 'checking' ? (
              <span className="text-[var(--text-muted)] font-mono font-medium">Checking...</span>
            ) : apiStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 font-mono font-semibold text-[var(--signal-teal)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-[var(--btn-radius)]">
                <CheckCircle2 className="w-4 h-4" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono font-semibold text-[var(--signal-coral)] bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-[var(--btn-radius)]">
                <XCircle className="w-4 h-4" /> Disconnected
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Integration Endpoints Configuration */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
          <Sliders className="w-5 h-5 text-[var(--signal-amber)]" />
          <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">AI & Canvas Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Gemini API Key (Drawing-to-Code Generation)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2 bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-[var(--btn-radius)] text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-teal)]"
              />
              <Button size="sm" onClick={handleSaveGeminiKey} className="bg-[var(--signal-teal)] text-black font-bold">
                Save
              </Button>
            </div>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">
              Used directly by the AI Drawing-to-Code panel to synthesize React and Tailwind code from canvas drawings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
