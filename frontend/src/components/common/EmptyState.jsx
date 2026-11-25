import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  actionIcon,
  compact = false,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  const renderActionIcon = () => {
    if (!actionIcon) return undefined;
    if (React.isValidElement(actionIcon)) return actionIcon;
    if (typeof actionIcon === 'function' || (typeof actionIcon === 'object' && actionIcon !== null)) {
      const ActionIconComponent = actionIcon;
      return <ActionIconComponent className="w-4 h-4" />;
    }
    return undefined;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-inset)] ${
        compact ? 'p-6' : 'p-10 sm:p-12'
      }`}
    >
      <div className="w-11 h-11 rounded-[12px] bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-[var(--shadow-xs)]">
        {renderIcon()}
      </div>
      <h3 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 mb-5 max-w-sm text-[12.5px] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      )}
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button size="sm" variant="primary" onClick={onAction} leftIcon={renderActionIcon()}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
