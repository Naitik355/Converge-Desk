import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(
  ({ label, options = [], error, helperText, className = '', id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block font-display text-xs font-semibold text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-10 appearance-none bg-[var(--surface)] text-[var(--text-primary)] text-[13px] rounded-[var(--radius-control)] border pl-3 pr-9 transition-all duration-150 font-sans focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] cursor-pointer ${
              error
                ? 'border-[var(--error)]'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
