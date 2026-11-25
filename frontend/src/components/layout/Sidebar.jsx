import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  FileText,
  Code2,
  Shapes,
  Video,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, end: true },
      { name: 'Projects', href: '/projects', icon: FolderKanban },
      { name: 'Tasks', href: '/tasks', icon: ListChecks },
      { name: 'Documents', href: '/documents', icon: FileText },
    ],
  },
  {
    label: 'Studio',
    items: [
      { name: 'Whiteboards', href: '/whiteboards', icon: Shapes },
      { name: 'Code workspace', href: '/code', icon: Code2 },
      { name: 'Team & meetings', href: '/meetings', icon: Video },
    ],
  },
  {
    label: 'Account',
    items: [{ name: 'Settings', href: '/settings', icon: Settings }],
  },
];

export const Sidebar = ({ isCollapsed, onToggleCollapse, onCloseMobile }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/landing');
  };

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] transition-[width] duration-200 select-none z-20 ${
        isCollapsed ? 'w-[78px]' : 'w-[264px]'
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-[var(--border-subtle)] ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}
      >
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="group flex items-center gap-2.5 overflow-hidden focus:outline-none"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--ink)] text-[var(--on-ink)] shadow-[var(--shadow-xs)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 5.5h7.5M3 10.5h5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12.25" cy="10.5" r="1.6" fill="var(--accent)" />
            </svg>
          </span>
          {!isCollapsed && (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-[14px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
                SyncSpace
              </span>
              <span className="text-[10px] font-medium tracking-[0.06em] text-[var(--text-muted)]">
                STUDIO WORKSPACE
              </span>
            </span>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden h-7 w-7 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] md:flex cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="hidden justify-center border-b border-[var(--border-subtle)] py-2 md:flex">
          <button
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary create action */}
      <div className={isCollapsed ? 'p-2.5' : 'px-3 pt-3.5 pb-1'}>
        <button
          onClick={() => {
            navigate('/projects');
            onCloseMobile?.();
          }}
          className={`flex w-full items-center gap-2 rounded-[var(--radius-control)] bg-[var(--ink)] text-[var(--on-ink)] font-display text-[12.5px] font-semibold transition-colors hover:bg-[var(--ink-hover)] cursor-pointer ${
            isCollapsed ? 'h-9 justify-center' : 'h-9 justify-center px-3'
          }`}
          title="Go to projects"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New project</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-4 first:mt-2">
            {!isCollapsed && (
              <p className="sx-eyebrow px-2.5 pb-1.5">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.end}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 rounded-[8px] font-display text-[12.5px] font-medium transition-colors duration-150 cursor-pointer ${
                        isCollapsed ? 'h-9 justify-center' : 'h-9 px-2.5'
                      } ${
                        isActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                        )}
                        <Icon
                          className={`h-[17px] w-[17px] shrink-0 ${
                            isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                          }`}
                          strokeWidth={1.9}
                        />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / account */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
        {isAuthenticated && user ? (
          isCollapsed ? (
            <button
              onClick={handleSignOut}
              className="flex h-8 w-full items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-[11px] font-bold text-[var(--accent)]"
              title={`${user.username} · sign out`}
            >
              {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-[11.5px] font-bold text-[var(--accent)]">
                {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[12px] font-semibold text-[var(--text-primary)]">
                  {user?.username || 'Member'}
                </p>
                <p className="truncate text-[10.5px] text-[var(--text-muted)]">
                  {user?.email || 'Signed in'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-[6px] p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--error-soft)] hover:text-[var(--error)] cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex h-9 w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--ink)] font-display text-xs font-semibold text-[var(--on-ink)]"
          >
            {isCollapsed ? 'In' : 'Sign in'}
          </button>
        )}
      </div>
    </aside>
  );
};
