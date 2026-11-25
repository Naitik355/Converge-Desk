import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AuthLayout = ({ eyebrow, title, description, children, footer }) => {
  const { isDark, cycleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand column */}
      <aside className="relative hidden overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--ink)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 sx-dot-grid opacity-[0.14]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--on-ink)] text-[var(--ink)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 5.5h7.5M3 10.5h5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12.25" cy="10.5" r="1.6" fill="var(--accent)" />
              </svg>
            </span>
            <span className="font-display text-[15px] font-bold tracking-[-0.03em] text-[var(--on-ink)]">
              ConvergeDesk
            </span>
          </Link>

          <h2 className="mt-16 max-w-md sx-display-l text-[var(--on-ink)]">
            One workspace for the whole idea.
          </h2>
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-[var(--on-ink)]/60">
            Documents, tasks, whiteboards and code — connected from the first note to the final commit.
          </p>

          <ul className="mt-10 space-y-3">
            {[
              'Real-time documents and canvases',
              'A task board that matches the plan',
              'An in-browser IDE with context',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[12.5px] text-[var(--on-ink)]/75">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <blockquote className="relative max-w-sm border-l-2 border-[var(--accent)] pl-4">
          <p className="text-[13px] leading-relaxed text-[var(--on-ink)]/80">
            “The handoff disappears when the document, the board and the code share one room.”
          </p>
          <footer className="mt-2 font-display text-[11px] font-semibold text-[var(--on-ink)]/50">
            ConvergeDesk Studio
          </footer>
        </blockquote>
      </aside>

      {/* Form column */}
      <main className="flex min-h-screen flex-col">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2 lg:invisible">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--ink)] font-display text-[10px] font-bold text-[var(--on-ink)]">
              CD
            </span>
            <span className="font-display text-[13px] font-bold">ConvergeDesk</span>
          </Link>
          <button
            onClick={cycleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[400px]">
            <p className="sx-eyebrow">{eyebrow}</p>
            <h1 className="mt-2.5 sx-display-m">{title}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{description}</p>

            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};
