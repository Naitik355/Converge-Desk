import React from 'react';

export const SegmentedControl = ({ options, value, onChange, size = 'md', className = '' }) => {
  const heights = size === 'sm' ? 'h-7 text-[11.5px]' : 'h-9 text-xs';

  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-0.5 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-0.5 ${className}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-[7px] px-3 font-display font-semibold transition-all duration-150 cursor-pointer ${heights} ${
              active
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
