import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  className = '',
  as: Tag = 'div',
  ...props
}) => {
  return (
    <Tag
      className={`bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] text-[var(--text-primary)] transition-all duration-150 ${
        hoverable
          ? 'hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-[1px] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

/** Panel: bordered content region with an optional inset header strip. */
export const Panel = ({
  title,
  eyebrow,
  description,
  actions,
  children,
  bodyClassName = 'p-5',
  className = '',
  flush = false,
}) => (
  <section
    className={`bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] ${
      flush ? 'overflow-hidden' : ''
    } ${className}`}
  >
    {(title || eyebrow || actions) && (
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] rounded-t-[calc(var(--radius-card)-1px)]">
        <div className="min-w-0">
          {eyebrow && <p className="sx-eyebrow mb-1">{eyebrow}</p>}
          {title && (
            <h3 className="font-display text-[13px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              {title}
            </h3>
          )}
          {description && <p className="sx-caption mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
);
