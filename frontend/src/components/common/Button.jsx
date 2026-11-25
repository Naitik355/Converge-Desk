import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-display font-semibold whitespace-nowrap transition-all duration-150 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-[var(--canvas)] disabled:opacity-45 disabled:pointer-events-none select-none ' +
    'active:translate-y-[0.5px] cursor-pointer rounded-[var(--radius-control)]';

  const sizeStyles = {
    xs: 'text-[11px] h-7 px-2.5 gap-1.5',
    sm: 'text-xs h-8 px-3 gap-1.5',
    md: 'text-[13px] h-10 px-4 gap-2',
    lg: 'text-sm h-[46px] px-5 gap-2',
  }[size];

  const variantStyles = {
    primary:
      'bg-[var(--ink)] text-[var(--on-ink)] hover:bg-[var(--ink-hover)] shadow-[var(--shadow-xs)]',
    accent:
      'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)] shadow-[var(--shadow-xs)]',
    secondary:
      'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
    danger:
      'bg-[var(--error)] text-white hover:opacity-90 shadow-[var(--shadow-xs)]',
    success:
      'bg-[var(--success)] text-white hover:opacity-90 shadow-[var(--shadow-xs)]',
    link:
      'bg-transparent text-[var(--info)] hover:text-[var(--accent)] px-0 h-auto rounded-none underline-offset-4 hover:underline',
  }[variant] || '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
    </button>
  );
};
