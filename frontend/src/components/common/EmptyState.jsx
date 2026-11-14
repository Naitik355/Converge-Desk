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
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon;
      return <IconComponent className="w-7 h-7" />;
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
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-[var(--card-radius)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-raised)] my-4 shadow-sm font-mono">
      <div className="w-14 h-14 rounded-[var(--card-radius)] bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--signal-teal)] flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="font-display text-base font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} leftIcon={renderActionIcon()} className="bg-[var(--signal-teal)] text-black font-bold">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
