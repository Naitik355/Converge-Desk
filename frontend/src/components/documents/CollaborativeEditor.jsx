import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { QuillBinding } from 'y-quill';
import 'quill/dist/quill.snow.css';
import { Wifi, WifiOff, Users, Loader2, Copy, Check, Clock, FileText } from 'lucide-react';
import { getDocumentCollabToken } from '../../api/documents';
import { useAuth } from '../../context/AuthContext';

// Curated non-agent color palette (Emerald, Teal, Cyan, Amber, Orange, Coral Red, Lime, Warm Gold)
const USER_COLORS = [
  '#10b981', '#14b8a6', '#06b6d4', '#f59e0b',
  '#f97316', '#ef4444', '#84cc16', '#eab308'
];

function getRandomColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

export const CollaborativeEditor = ({
  documentId,
  readOnly = false,
  className = '',
}) => {
  const containerRef = useRef(null);
  const { user } = useAuth();
  const [status, setStatus] = useState('connecting');
  const [synced, setSynced] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [copiedRoom, setCopiedRoom] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !documentId) return;

    let disposed = false;
    let provider = null;
    let binding = null;
    let ydoc = null;

    // Reset UI state
    setStatus('connecting');
    setSynced(false);
    setErrorMsg(null);
    setCollaborators([]);
    setStats({ words: 0, chars: 0 });

    // Clear previous editor and any sibling toolbars completely
    containerRef.current.innerHTML = '';

    // Create a fresh inner element for Quill to mount to
    const editorElem = document.createElement('div');
    editorElem.className = 'flex-1 flex flex-col';
    containerRef.current.appendChild(editorElem);

    const quill = new Quill(editorElem, {
      theme: 'snow',
      readOnly: readOnly,
      placeholder: readOnly
        ? 'This document is view-only.'
        : 'Write notes, specs, documentation, or architecture plans in real-time…',
      modules: {
        toolbar: readOnly
          ? false
          : [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'code-block'],
              [{ color: [] }, { background: [] }],
              ['link', 'clean'],
            ],
      },
    });

    // Word and character count tracking
    const handleTextChange = () => {
      if (disposed) return;
      const text = quill.getText();
      const trimmed = text.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      const chars = trimmed.length;
      setStats({ words, chars });
    };
    quill.on('text-change', handleTextChange);
    handleTextChange();

    ydoc = new Y.Doc();
    const wsUrl = import.meta.env.VITE_COLLAB_WS_URL || 'ws://localhost:1234';

    provider = new HocuspocusProvider({
      url: wsUrl,
      name: `convergedesk-document-${documentId}`,
      document: ydoc,
      token: async () => {
        try {
          const res = await getDocumentCollabToken(documentId);
          return res.token;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Could not authorize document access';
          setErrorMsg(message);
          throw err;
        }
      },
    });

    const userColor = getRandomColor(user?.username || 'Guest');
    provider.awareness.setLocalStateField('user', {
      name: user?.username || 'Collaborator',
      color: userColor,
    });

    const updateCollaborators = () => {
      if (disposed || !provider) return;
      const states = provider.awareness.getStates();
      const list = [];
      states.forEach((state, clientId) => {
        if (state.user) {
          list.push({
            clientId,
            name: state.user.name || 'Anonymous',
            color: state.user.color || '#10b981',
          });
        }
      });
      setCollaborators(list);
    };

    provider.awareness.on('change', updateCollaborators);

    const ytext = ydoc.getText('quill');
    binding = new QuillBinding(ytext, quill, provider.awareness);

    const handleStatus = ({ status: providerStatus }) => {
      if (disposed) return;
      setStatus(providerStatus);
      if (providerStatus === 'connected') {
        setErrorMsg(null);
      }
    };

    const handleSynced = ({ state }) => {
      if (disposed) return;
      setSynced(Boolean(state));
      handleTextChange();
    };

    const handleAuthFailed = (event) => {
      if (disposed) return;
      setStatus('auth_failed');
      setErrorMsg('Access denied: You are not authorized for this project document.');
      console.error('[Hocuspocus] Auth failed:', event);
    };

    const handleClose = () => {
      if (disposed) return;
      setStatus('disconnected');
    };

    provider.on('status', handleStatus);
    provider.on('synced', handleSynced);
    provider.on('authenticationFailed', handleAuthFailed);
    provider.on('close', handleClose);

    return () => {
      disposed = true;
      provider.awareness.off('change', updateCollaborators);
      provider.off('status', handleStatus);
      provider.off('synced', handleSynced);
      provider.off('authenticationFailed', handleAuthFailed);
      provider.off('close', handleClose);

      try {
        binding.destroy();
      } catch {
        // ignore
      }
      try {
        provider.destroy();
      } catch {
        // ignore
      }
      try {
        ydoc.destroy();
      } catch {
        // ignore
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [documentId, readOnly, user?.username]);

  const copyRoomName = () => {
    navigator.clipboard.writeText(`convergedesk-document-${documentId}`);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {synced ? 'Synced' : 'Syncing…'}
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/70 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-800/80 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            Connecting…
          </span>
        );
      case 'auth_failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/80 px-2.5 py-1 text-xs font-medium text-rose-300 border border-rose-800">
            <WifiOff className="h-3.5 w-3.5" />
            Auth Denied
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-400 border border-slate-800">
            <WifiOff className="h-3.5 w-3.5" />
            Disconnected
          </span>
        );
    }
  };

  const readTimeMinutes = Math.max(1, Math.ceil(stats.words / 200));

  return (
    <div className={`dark-quill flex flex-col bg-[var(--surface-card)] rounded-[var(--card-radius)] border-2 border-[var(--border-subtle)] overflow-hidden shadow-xl ${className}`}>
      {/* Top Collab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] text-xs font-mono">
        <div className="flex items-center gap-2.5">
          {getStatusBadge()}
          {readOnly && (
            <span className="rounded bg-[var(--surface-canvas)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Read-Only
            </span>
          )}
          {errorMsg && (
            <span className="text-[var(--signal-coral)] truncate max-w-xs">{errorMsg}</span>
          )}
        </div>

        {/* Collaborators online */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Users className="h-3.5 w-3.5 text-[var(--signal-teal)]" />
            <span className="font-medium text-[var(--text-primary)]">
              {collaborators.length} {collaborators.length === 1 ? 'user' : 'users'} editing
            </span>
          </div>

          <div className="flex items-center -space-x-1.5">
            {collaborators.map((c) => (
              <span
                key={c.clientId}
                title={c.name}
                style={{ backgroundColor: c.color }}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-[var(--surface-card)] shadow-sm transform hover:scale-110 transition-transform cursor-default"
              >
                {(c?.name?.[0] || 'U').toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="relative flex-1 flex flex-col min-h-[460px] bg-[var(--surface-card)]">
        <div ref={containerRef} className="flex-1 flex flex-col" />
      </div>

      {/* Bottom Status / Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[var(--surface-raised)] border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-[var(--signal-teal)]" />
            <span>
              <strong className="text-[var(--text-primary)]">{stats.words}</strong> words
            </span>
            <span className="text-[var(--border-subtle)]">•</span>
            <span>
              <strong className="text-[var(--text-primary)]">{stats.chars}</strong> chars
            </span>
          </div>

          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <Clock className="h-3 w-3" />
            <span>~{readTimeMinutes} min read</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Room:</span>
          <button
            type="button"
            onClick={copyRoomName}
            title="Click to copy room ID"
            className="group flex items-center gap-1 font-mono text-[10px] text-[var(--text-primary)] hover:text-[var(--signal-teal)] bg-[var(--surface-canvas)] px-2 py-0.5 rounded-[var(--btn-radius)] border border-[var(--border-subtle)] transition-colors"
          >
            <span>convergedesk-document-{documentId}</span>
            {copiedRoom ? (
              <Check className="h-2.5 w-2.5 text-[var(--signal-teal)]" />
            ) : (
              <Copy className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
            )}
          </button>
        </div>
      </div>

      {/* Quill Adaptive Styling */}
      <style>{`
        .dark-quill .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid var(--border-subtle) !important;
          background: var(--surface-raised) !important;
          padding: 8px 14px !important;
          font-family: inherit;
        }
        .dark-quill .ql-toolbar .ql-stroke {
          stroke: var(--text-muted) !important;
        }
        .dark-quill .ql-toolbar .ql-fill {
          fill: var(--text-muted) !important;
        }
        .dark-quill .ql-toolbar .ql-picker {
          color: var(--text-muted) !important;
        }
        .dark-quill .ql-toolbar .ql-picker-options {
          background-color: var(--surface-card) !important;
          border: 1px solid var(--border-subtle) !important;
          box-shadow: var(--sb-shadow) !important;
          border-radius: var(--btn-radius) !important;
          padding: 6px !important;
        }
        .dark-quill .ql-toolbar .ql-picker-item {
          color: var(--text-muted) !important;
          border-radius: 4px !important;
          padding: 4px 8px !important;
        }
        .dark-quill .ql-toolbar .ql-picker-item:hover,
        .dark-quill .ql-toolbar .ql-picker-item.ql-selected {
          color: var(--signal-teal) !important;
          background-color: var(--surface-raised) !important;
        }
        .dark-quill .ql-toolbar button {
          border-radius: var(--btn-radius) !important;
          transition: background-color 0.15s ease;
        }
        .dark-quill .ql-toolbar button:hover,
        .dark-quill .ql-toolbar button:focus {
          background-color: var(--surface-raised) !important;
        }
        .dark-quill .ql-toolbar button:hover .ql-stroke,
        .dark-quill .ql-toolbar button:focus .ql-stroke,
        .dark-quill .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--signal-teal) !important;
        }
        .dark-quill .ql-toolbar button:hover .ql-fill,
        .dark-quill .ql-toolbar button:focus .ql-fill,
        .dark-quill .ql-toolbar button.ql-active .ql-fill {
          fill: var(--signal-teal) !important;
        }
        .dark-quill .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          font-size: 0.96rem;
          line-height: 1.7;
          color: var(--text-primary) !important;
          background-color: var(--surface-card) !important;
          min-height: 420px;
        }
        .dark-quill .ql-editor {
          padding: 24px !important;
          min-height: 420px;
          color: var(--text-primary) !important;
        }
        .dark-quill .ql-editor.ql-blank::before {
          color: var(--text-muted) !important;
          font-style: normal;
        }
        .dark-quill .ql-editor h1,
        .dark-quill .ql-editor h2,
        .dark-quill .ql-editor h3 {
          color: var(--text-primary) !important;
          font-weight: 700;
        }
        .dark-quill .ql-editor pre.ql-syntax {
          background-color: var(--surface-raised) !important;
          border: 1px solid var(--border-subtle) !important;
          border-radius: var(--btn-radius) !important;
          color: var(--signal-teal) !important;
          padding: 12px 16px !important;
        }
        .dark-quill .ql-editor blockquote {
          border-left: 3px solid var(--signal-teal) !important;
          color: var(--text-muted) !important;
          padding-left: 14px !important;
        }
        .dark-quill .ql-editor a {
          color: var(--signal-teal) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default CollaborativeEditor;
