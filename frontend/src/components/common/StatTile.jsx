import React from 'react';

export const StatTile = ({ label, value, hint, icon: Icon, accent = 'default' }) => {
  const accentStyles = {
    default: 'text-[var(--text-primary)]',
    accent: 'text-[var(--accent)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--info)]',
    error: 'text-[var(--error)]',
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:p-5 transition-colors hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-3">
        <p className="sx-eyebrow leading-4">{label}</p>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--surface-inset)] text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className={`mt-3 sx-numeral ${accentStyles}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[11.5px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
};
