import React from 'react';

export const Textarea = React.forwardRef(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-display text-xs font-semibold text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-[13px] leading-relaxed rounded-[var(--radius-control)] border p-3 font-sans transition-all duration-150 focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] resize-y ${
            error
              ? 'border-[var(--error)]'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[var(--error)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="sx-caption">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
