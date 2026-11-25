import React from 'react';

const fieldBase =
  'w-full bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ' +
  'text-[13px] rounded-[var(--radius-control)] border transition-all duration-150 font-sans ' +
  'focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)]';

export const Input = React.forwardRef(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1.5 font-display text-xs font-semibold text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`${fieldBase} h-10 ${leftIcon ? 'pl-9' : 'pl-3'} ${
              rightIcon ? 'pr-9' : 'pr-3'
            } ${
              error
                ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error-soft)]'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[var(--error)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="sx-caption">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
