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
    'inline-flex items-center justify-center font-medium rounded-[var(--btn-radius)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer font-mono';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 h-12',
  }[size];

  const variantStyles = {
    primary:
      'bg-[var(--signal-teal)] text-black font-bold hover:opacity-90 focus:ring-[var(--signal-teal)] shadow-sm',
    secondary:
      'bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-[var(--text-muted)] border border-[var(--border-subtle)] focus:ring-[var(--signal-teal)]',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--signal-teal)] hover:bg-[var(--surface-raised)] focus:ring-[var(--signal-teal)]',
    ghost:
      'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] focus:ring-[var(--border-subtle)]',
    danger:
      'bg-[var(--signal-coral)] text-white font-bold hover:opacity-90 focus:ring-[var(--signal-coral)] shadow-sm',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
