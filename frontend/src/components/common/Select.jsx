import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(
  ({ label, options = [], error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-[var(--surface-canvas)] text-[var(--text-primary)] text-sm rounded-[var(--btn-radius)] border transition-all duration-150 py-2.5 pl-3.5 pr-10 font-mono ${
              error
                ? 'border-[var(--signal-coral)] focus:border-[var(--signal-coral)] focus:ring-1 focus:ring-[var(--signal-coral)]/30'
                : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] focus:border-[var(--signal-teal)] focus:ring-1 focus:ring-[var(--signal-teal)]/30'
            } focus:outline-none ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--surface-card)] text-[var(--text-primary)]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
