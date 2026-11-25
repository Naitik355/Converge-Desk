import React from 'react';
import { PriorityBadge } from '../common/Badge';
import { Calendar, MoreVertical, Link as LinkIcon, Trash2, Edit2 } from 'lucide-react';

const initials = (name) =>
  name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const TaskCard = ({
  task,
  assigneeName,
  onStatusChange,
  onOpenDetails,
  onDelete,
  canEdit = true,
  hasBlockingDependencies = false,
  projectName,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      onClick={() => onOpenDetails(task)}
      className="group relative cursor-pointer rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface)] p-3 transition-all duration-150 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-start justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {canEdit && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-[5px] p-1 text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              aria-label="Task options"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-40 mt-1 w-32 overflow-hidden rounded-[9px] border border-[var(--border-subtle)] bg-[var(--surface)] p-1 shadow-[var(--shadow-menu)]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenDetails(task);
                    }}
                    className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[11.5px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(task.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[11.5px] font-medium text-[var(--error)] hover:bg-[var(--error-soft)] cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <h4 className="mt-2.5 font-display text-[12.5px] font-semibold leading-snug text-[var(--text-primary)] line-clamp-2">
        {task.title}
      </h4>
      {projectName && (
        <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{projectName}</p>
      )}
      {task.description && (
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)] line-clamp-2">
          {task.description}
        </p>
      )}

      {hasBlockingDependencies && task.status !== 'done' && (
        <div className="mt-2 flex items-center gap-1.5 rounded-[5px] bg-[var(--warning-soft)] px-1.5 py-1 text-[9.5px] font-semibold text-[var(--warning)]">
          <LinkIcon className="h-2.5 w-2.5 shrink-0" />
          Blocked by prerequisite
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5">
        <span
          className={`flex items-center gap-1 text-[10px] ${
            formattedDueDate ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]/70'
          }`}
        >
          <Calendar className="h-2.5 w-2.5" />
          {formattedDueDate || 'No date'}
        </span>
        {assigneeName ? (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-[8px] font-bold text-[var(--accent)]"
            title={assigneeName}
          >
            {initials(assigneeName)}
          </span>
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-[var(--border-strong)] text-[8px] text-[var(--text-muted)]">
            —
          </span>
        )}
      </div>
    </div>
  );
};
