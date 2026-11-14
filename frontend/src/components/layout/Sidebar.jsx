import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Presentation,
  Code2,
  Video,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Activity,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isBrutalist } = useTheme();
  const navigate = useNavigate();

  const primaryNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Sprint Tasks', href: '/tasks', icon: CheckSquare },
  ];

  const toolsNav = [
    { name: 'Whiteboards', href: '/whiteboards', icon: Presentation },
    { name: 'Code Workspace', href: '/code', icon: Code2 },
    { name: 'Meetings & PiP', href: '/meetings', icon: Video },
    { name: 'Docs Sandbox', href: '/collaborative-editor-test', icon: Terminal },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[var(--surface-card)] text-[var(--text-muted)] border-r border-[var(--border-subtle)] transition-all duration-200 select-none ${
        isBrutalist ? 'border-r-2 border-black' : ''
      } ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--signal-teal)] shadow-xs shrink-0 group-hover:border-[var(--signal-teal)] transition-colors">
            <Terminal className="w-4 h-4 font-bold" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm tracking-tight text-[var(--text-primary)] leading-tight">
                Converge<span className="text-[var(--signal-teal)]">Desk</span>
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Section 1: Primary Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 mono-label text-[var(--text-muted)] text-[10px]">
              // WORKSPACE
            </div>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-[var(--surface-raised)] text-[var(--signal-teal)] border border-[var(--signal-teal)] shadow-xs font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-transparent'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Section 2: Developer Modules */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 mono-label text-[var(--text-muted)] text-[10px]">
              // COLLABORATION
            </div>
          )}
          {toolsNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-[var(--surface-raised)] text-[var(--signal-teal)] border border-[var(--signal-teal)] shadow-xs font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-transparent'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Section at Bottom */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-canvas)]">
        {isAuthenticated && user ? (
          <div
            className={`flex items-center gap-2.5 p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-teal)] flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-xs">
              {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold font-mono text-[var(--text-primary)] truncate">
                  {user?.username || 'User'}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={async () => {
                  await logout();
                  navigate('/landing');
                }}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--signal-coral)] hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className={`p-1 ${isCollapsed ? 'text-center' : ''}`}>
            <NavLink
              to="/login"
              onClick={onCloseMobile}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono font-semibold text-black bg-[var(--signal-teal)] hover:opacity-90 rounded-lg transition-all shadow-xs"
            >
              {!isCollapsed && <span>SIGN IN</span>}
              <LogOut className="w-3.5 h-3.5 rotate-180" />
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};
