import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Trash2, ArrowUpRight, Copy, Check, Users, Shapes } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const BoardCard = ({ board, projectId, onDelete, canEdit = true }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const formattedDate = board.created_at
    ? new Date(board.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleCopyRoomId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(board.room_id);
    setCopied(true);
    success('Room ID copied', board.room_id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => navigate(`/projects/${projectId}/boards/${board.id}`)}
      className="group cursor-pointer overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] transition-all duration-150 hover:-translate-y-[1px] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lift)]"
    >
      {/* Canvas preview */}
      <div className="relative h-[96px] overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--surface-inset)]">
        <div className="absolute inset-0 sx-dot-grid opacity-70" />
        <div className="absolute left-4 top-4 h-8 w-14 rounded-[5px] border border-[var(--accent)]/40 bg-[var(--accent-soft)]" />
        <div className="absolute right-10 top-7 h-6 w-10 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]" />
        <div className="absolute bottom-3 left-[38%] h-7 w-20 rounded-[5px] border border-[var(--border-strong)] bg-[var(--surface)]" />
        <svg className="absolute inset-0 h-full w-full text-[var(--border-strong)]" aria-hidden="true">
          <path d="M72 44 H120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M190 46 C170 56 150 60 140 72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        </svg>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--surface)]/90 px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-muted)] backdrop-blur">
          <Users className="h-2.5 w-2.5" /> Live
        </span>

        {canEdit && onDelete && (
          <div className="absolute left-2 top-2 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-[5px] bg-[var(--surface)]/90 p-1 text-[var(--text-muted)] opacity-0 backdrop-blur transition-all hover:text-[var(--text-primary)] group-hover:opacity-100 focus:opacity-100"
              aria-label="Board actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 z-40 mt-1 w-36 overflow-hidden rounded-[9px] border border-[var(--border-subtle)] bg-[var(--surface)] p-1 shadow-[var(--shadow-menu)]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(board.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[11.5px] font-medium text-[var(--error)] hover:bg-[var(--error-soft)]"
                  >
                    <Trash2 className="h-3 w-3" /> Delete board
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[13px] font-semibold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-1">
            {board.title}
          </h3>
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
        </div>

        <div className="mt-2.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span className="min-w-0 flex-1 truncate rounded-[5px] border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]">
            {board.room_id}
          </span>
          <button
            onClick={handleCopyRoomId}
            className="rounded-[5px] p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            title="Copy room ID"
          >
            {copied ? <Check className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>

        <p className="mt-3 text-[10.5px] text-[var(--text-muted)]">
          {formattedDate ? `Created ${formattedDate}` : 'Multiplayer canvas'}
        </p>
      </div>
    </div>
  );
};
