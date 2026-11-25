import React from 'react';

/**
 * PageHeader — the single header anatomy for every authenticated page.
 * eyebrow → display heading → description → actions.
 */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className = '',
}) => (
  <header
    className={`flex flex-col gap-5 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-end sm:justify-between ${className}`}
  >
    <div className="min-w-0">
      {eyebrow && <p className="sx-eyebrow mb-2.5">{eyebrow}</p>}
      <h1 className="sx-display-m text-[var(--text-primary)]">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      )}
      {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>
);
