import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title, options) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = {
        id,
        title,
        type: options?.type || 'info',
        message: options?.message,
      };

      setToasts((prev) => [...prev, newToast]);

      const duration = options?.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title, message) => toast(title, { type: 'success', message }), [toast]);
  const error = useCallback((title, message) => toast(title, { type: 'error', message }), [toast]);
  const info = useCallback((title, message) => toast(title, { type: 'info', message }), [toast]);
  const warning = useCallback((title, message) => toast(title, { type: 'warning', message }), [toast]);

  const accents = {
    success: { icon: CheckCircle2, color: 'var(--success)' },
    error: { icon: AlertCircle, color: 'var(--error)' },
    warning: { icon: AlertTriangle, color: 'var(--warning)' },
    info: { icon: Info, color: 'var(--info)' },
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((t) => {
          const { icon: Icon, color } = accents[t.type] || accents.info;
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-menu)] animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-[13px] font-semibold text-[var(--text-primary)]">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
