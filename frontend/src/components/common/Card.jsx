import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-card p-5 transition-all duration-200 text-[var(--text-primary)] ${
        hoverable ? 'hover:-translate-y-0.5 hover:border-[var(--signal-teal)] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
