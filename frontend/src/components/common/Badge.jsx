import React from 'react';

export const Badge = ({
  children,
  variant = 'teal',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    teal: 'bg-[var(--surface-raised)] text-[var(--signal-teal)] border-[var(--signal-teal)]/30',
    amber: 'bg-[var(--surface-raised)] text-[var(--signal-amber)] border-[var(--signal-amber)]/30',
    violet: 'bg-[var(--surface-raised)] text-[var(--signal-violet)] border-[var(--signal-violet)]/30',
    azure: 'bg-[var(--surface-raised)] text-[var(--signal-azure)] border-[var(--signal-azure)]/30',
    coral: 'bg-[var(--surface-raised)] text-[var(--signal-coral)] border-[var(--signal-coral)]/30',
    slate: 'bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)]',
  }[variant] || 'bg-[var(--surface-raised)] text-[var(--signal-teal)] border-[var(--signal-teal)]/30';

  const dotStyles = {
    teal: 'bg-[var(--signal-teal)]',
    amber: 'bg-[var(--signal-amber)]',
    violet: 'bg-[var(--signal-violet)]',
    azure: 'bg-[var(--signal-azure)]',
    coral: 'bg-[var(--signal-coral)]',
    slate: 'bg-[var(--text-muted)]',
  }[variant] || 'bg-[var(--signal-teal)]';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono font-medium tracking-wider uppercase',
    md: 'text-[11px] px-2.5 py-0.5 font-mono font-semibold tracking-wider uppercase',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${variantStyles} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />}
      <span>{children}</span>
    </span>
  );
};

export const RoleBadge = ({ role = 'editor' }) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'owner') {
    return <Badge variant="amber" dot>Owner</Badge>;
  }
  if (normalized === 'editor') {
    return <Badge variant="teal" dot>Editor</Badge>;
  }
  return <Badge variant="slate" dot>Viewer</Badge>;
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'done':
      return <Badge variant="teal" dot>Done</Badge>;
    case 'in_progress':
      return <Badge variant="amber" dot>In Progress</Badge>;
    case 'review':
      return <Badge variant="violet" dot>Review</Badge>;
    case 'backlog':
    default:
      return <Badge variant="slate" dot>Backlog</Badge>;
  }
};

export const PriorityBadge = ({ priority = 'medium' }) => {
  const normalized = (priority || '').toLowerCase();
  switch (normalized) {
    case 'urgent':
    case 'high':
      return <Badge variant="coral" dot>High</Badge>;
    case 'medium':
      return <Badge variant="amber" dot>Medium</Badge>;
    case 'low':
    default:
      return <Badge variant="slate" dot>Low</Badge>;
  }
};
