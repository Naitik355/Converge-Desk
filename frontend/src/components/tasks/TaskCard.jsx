import React from 'react';
import { PriorityBadge } from '../common/Badge';
import { Calendar, MoreVertical, Link as LinkIcon, Trash2, Edit2, UserRound } from 'lucide-react';

export const TaskCard = ({
  task,
  assigneeName,
  onStatusChange,
  onOpenDetails,
  onDelete,
  canEdit = true,
  hasBlockingDependencies = false,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      onClick={() => onOpenDetails(task)}
      className="glass-card p-4 transition-all cursor-pointer group relative hover:border-[var(--signal-teal)]"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        {canEdit && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-raised)]"
              aria-label="Task options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-[var(--surface-card)] rounded-xl shadow-xl border border-[var(--border-subtle)] p-1 z-40 text-xs font-mono">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenDetails(task);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-lg text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(task.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[var(--signal-coral)] hover:bg-rose-500/10 rounded-lg text-left font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <h4 className="font-display text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--signal-teal)] transition-colors line-clamp-2">
        {task.title}
      </h4>
      {task.description && (
        <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {assigneeName && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
          <UserRound className="w-3.5 h-3.5 text-[var(--signal-teal)]" />
          <span className="truncate">Assignee: {assigneeName}</span>
        </div>
      )}

      {hasBlockingDependencies && task.status !== 'done' && (
        <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--surface-raised)] border border-[var(--signal-amber)]/40 text-[10px] font-mono text-[var(--signal-amber)]">
          <LinkIcon className="w-3 h-3 text-[var(--signal-amber)] shrink-0" />
          <span>BLOCKED BY PREREQUISITE</span>
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDueDate ? formattedDueDate : 'NO DUE DATE'}
        </span>
        <span className="text-[10px] uppercase font-bold text-[var(--signal-teal)]">
          {task.status}
        </span>
      </div>
    </div>
  );
};
