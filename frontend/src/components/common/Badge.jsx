import React from 'react';

const variants = {
  neutral: 'bg-[var(--surface-inset)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  slate: 'bg-[var(--surface-inset)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-transparent',
  violet: 'bg-[var(--accent-soft)] text-[var(--accent)] border-transparent',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
  teal: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
  amber: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
  danger: 'bg-[var(--error-soft)] text-[var(--error)] border-transparent',
  error: 'bg-[var(--error-soft)] text-[var(--error)] border-transparent',
  coral: 'bg-[var(--error-soft)] text-[var(--error)] border-transparent',
  info: 'bg-[var(--info-soft)] text-[var(--info)] border-transparent',
  azure: 'bg-[var(--info-soft)] text-[var(--info)] border-transparent',
};

const dots = {
  neutral: 'bg-[var(--text-muted)]',
  slate: 'bg-[var(--text-muted)]',
  accent: 'bg-[var(--accent)]',
  violet: 'bg-[var(--accent)]',
  success: 'bg-[var(--success)]',
  teal: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning-strong)]',
  amber: 'bg-[var(--warning-strong)]',
  danger: 'bg-[var(--error)]',
  error: 'bg-[var(--error)]',
  coral: 'bg-[var(--error)]',
  info: 'bg-[var(--info)]',
  azure: 'bg-[var(--info)]',
};

export const Badge = ({ children, variant = 'neutral', size = 'md', dot = false, className = '' }) => {
  const sizeStyles = {
    sm: 'text-[10px] h-[20px] px-2 gap-1',
    md: 'text-[11px] h-[23px] px-2.5 gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-display font-semibold whitespace-nowrap ${
        variants[variant] || variants.neutral
      } ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant] || dots.neutral}`} />}
      <span>{children}</span>
    </span>
  );
};

export const RoleBadge = ({ role = 'editor' }) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'owner') return <Badge variant="warning">Owner</Badge>;
  if (normalized === 'editor') return <Badge variant="accent">Editor</Badge>;
  return <Badge variant="neutral">Viewer</Badge>;
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'done':
      return <Badge variant="success" dot>Completed</Badge>;
    case 'in_progress':
      return <Badge variant="warning" dot>In Progress</Badge>;
    case 'review':
      return <Badge variant="accent" dot>In Review</Badge>;
    case 'todo':
    default:
      return <Badge variant="neutral" dot>To Do</Badge>;
  }
};

export const PriorityBadge = ({ priority, size = 'sm' }) => {
  switch (priority) {
    case 'high':
      return <Badge variant="danger" size={size} dot>High</Badge>;
    case 'medium':
      return <Badge variant="warning" size={size} dot>Medium</Badge>;
    case 'low':
    default:
      return <Badge variant="neutral" size={size} dot>Low</Badge>;
  }
};

export const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Completed',
};
