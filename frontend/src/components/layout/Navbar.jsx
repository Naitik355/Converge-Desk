import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  User as UserIcon,
  LogOut,
  Settings,
  FolderPlus,
  Sun,
  Moon,
  Layout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { GlobalSearch } from '../common/GlobalSearch';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, cycleTheme, isDark, isLight, isBrutalist } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Derive dynamic page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects/') && path.includes('/boards/')) return 'Whiteboard Canvas';
    if (path.startsWith('/projects/')) return 'Project Workspace';
    if (path === '/projects') return 'Projects';
    if (path === '/tasks') return 'Task Management';
    if (path === '/whiteboards') return 'Multiplayer Whiteboards';
    if (path === '/code') return 'Code Workspace';
    if (path === '/meetings') return 'Meetings & Calls';
    if (path === '/collaborative-editor-test') return 'Collaborative Docs Test Room';
    if (path === '/settings') return 'Settings & Diagnostics';
    if (path === '/landing') return 'Product Overview';
    if (path === '/login') return 'Sign In';
    if (path === '/signup') return 'Create Account';
    return 'ConvergeDesk';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[var(--surface-canvas)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
        {/* Left: Mobile hamburger & breadcrumb / title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-xl md:hidden transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {getPageTitle()}
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--signal-teal)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md">
              LIVE
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-muted)] bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl transition-colors sm:w-56 justify-between group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--signal-teal)] transition-colors" />
              <span className="hidden sm:inline">Search anything...</span>
              <span className="sm:hidden">Search</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[var(--text-muted)] bg-[var(--surface-canvas)] rounded border border-[var(--border-subtle)]">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Switcher in Navbar: 2 Themes (Light Brutalist & Dark Brutalist) */}
          <button
            onClick={cycleTheme}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-mono"
            title={`Switch to ${isDark ? 'Light Brutalist' : 'Dark Brutalist'}`}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-[var(--signal-teal)]" />
            ) : (
              <Sun className="w-4 h-4 text-[var(--signal-amber)]" />
            )}
            <span className="hidden xl:inline text-[10px] uppercase font-semibold">
              {isDark ? 'DARK BRUTALIST' : 'LIGHT BRUTALIST'}
            </span>
          </button>

          {/* Quick Create Project */}
          {isAuthenticated && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateProjectOpen(true)}
              className="hidden sm:inline-flex bg-[var(--signal-teal)] text-black font-semibold hover:opacity-90 shadow-xs"
            >
              New Project
            </Button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--signal-teal)] ring-2 ring-[var(--surface-canvas)]" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--surface-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <h4 className="mono-label text-[var(--text-muted)]">
                    NOTIFICATIONS
                  </h4>
                  <span className="text-[10px] font-mono bg-[var(--surface-raised)] text-[var(--signal-teal)] font-semibold px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                    LIVE
                  </span>
                </div>
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  <Bell className="w-8 h-8 text-[var(--text-muted)] opacity-40 mx-auto mb-2" />
                  <p className="font-medium text-[var(--text-primary)]">No unread notifications</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
                    Real-time project events will stream here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Menu / Avatar */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 text-sm rounded-xl hover:bg-[var(--surface-raised)] transition-colors border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
              >
                <span className="font-mono font-semibold text-xs text-[var(--text-primary)] hidden md:inline">
                  {user.username}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[var(--surface-canvas)] text-[var(--signal-teal)] border border-[var(--border-subtle)] flex items-center justify-center font-bold font-mono text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--surface-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{user.username}</p>
                    <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">{user.email || 'Session active'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] rounded-lg text-left transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                      Settings & Overview
                    </button>
                    <button
                      onClick={() => {
                        navigate('/projects');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] rounded-lg text-left transition-colors"
                    >
                      <FolderPlus className="w-4 h-4 text-[var(--text-muted)]" />
                      My Projects
                    </button>
                  </div>
                  <div className="pt-1 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logout();
                        navigate('/landing');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--signal-coral)] hover:bg-rose-500/10 rounded-lg text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-[var(--signal-teal)] text-black font-semibold text-xs"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={() => {
          navigate('/projects');
        }}
      />
    </>
  );
};
