import React from 'react';

export const Input = React.forwardRef(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <div className="relative rounded-[var(--btn-radius)]">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[var(--surface-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-xs sm:text-sm rounded-[var(--btn-radius)] border transition-all duration-150 py-2.5 font-mono ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-[var(--signal-coral)] focus:border-[var(--signal-coral)] focus:ring-1 focus:ring-[var(--signal-coral)]/30'
                : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] focus:border-[var(--signal-teal)] focus:ring-1 focus:ring-[var(--signal-teal)]/30'
            } focus:outline-none ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-mono text-[var(--signal-coral)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs font-mono text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
