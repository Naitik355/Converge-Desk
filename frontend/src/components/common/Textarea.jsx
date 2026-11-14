import React from 'react';

export const Textarea = React.forwardRef(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full bg-[var(--surface-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm rounded-[var(--btn-radius)] border transition-all duration-150 p-3.5 font-mono ${
            error
              ? 'border-[var(--signal-coral)] focus:border-[var(--signal-coral)] focus:ring-1 focus:ring-[var(--signal-coral)]/30'
              : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] focus:border-[var(--signal-teal)] focus:ring-1 focus:ring-[var(--signal-teal)]/30'
          } focus:outline-none ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs font-mono text-[var(--signal-coral)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs font-mono text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
