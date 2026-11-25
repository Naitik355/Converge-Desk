import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  eyebrow,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0a0b0d]/55 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          className={`relative transform overflow-hidden bg-[var(--surface)] text-left shadow-[var(--shadow-menu)] w-full sm:my-8 ${maxWidthStyles} border border-[var(--border-subtle)] rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] animate-in fade-in slide-in-from-bottom-2 sm:zoom-in-95 duration-200`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[var(--border-subtle)]">
            <div className="min-w-0">
              {eyebrow && <p className="sx-eyebrow mb-1.5">{eyebrow}</p>}
              <h3
                id="modal-title"
                className="font-display text-[17px] font-semibold tracking-[-0.025em] text-[var(--text-primary)]"
              >
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-[var(--radius-control)] p-1.5 -mr-1 -mt-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 text-[var(--text-primary)]">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--surface-raised)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
