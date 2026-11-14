import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Presentation, MoreVertical, Trash2, ArrowUpRight, Copy, Check, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const BoardCard = ({
  board,
  projectId,
  onDelete,
  canEdit = true,
}) => {
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
    success('Room ID Copied', board.room_id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card hoverable className="relative flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] text-[var(--signal-amber)] flex items-center justify-center font-bold text-sm shrink-0 border border-[var(--border-subtle)]">
              <Presentation className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[var(--signal-teal)] bg-[var(--surface-raised)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
              <Users className="w-3 h-3" /> MULTIPLAYER
            </span>
          </div>

          {canEdit && onDelete && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-lg transition-colors"
                aria-label="Board actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-32 bg-[var(--surface-card)] rounded-xl shadow-xl border border-[var(--border-subtle)] p-1 z-40 text-xs font-mono">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(board.id);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[var(--signal-coral)] hover:bg-rose-500/10 rounded-lg text-left font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Board
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => navigate(`/projects/${projectId}/boards/${board.id}`)}
          className="font-display text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--signal-amber)] transition-colors cursor-pointer line-clamp-1"
        >
          {board.title}
        </h3>

        {/* Room ID badge */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface-canvas)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md truncate max-w-[200px]">
            {board.room_id}
          </span>
          <button
            onClick={handleCopyRoomId}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors"
            title="Copy room ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--signal-teal)]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
        <span>{formattedDate ? `CREATED ${formattedDate.toUpperCase()}` : 'READY'}</span>
        <button
          onClick={() => navigate(`/projects/${projectId}/boards/${board.id}`)}
          className="flex items-center gap-1 font-semibold text-[var(--signal-teal)] hover:opacity-80 transition-colors group/btn font-mono"
        >
          <span>OPEN CANVAS</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
};
