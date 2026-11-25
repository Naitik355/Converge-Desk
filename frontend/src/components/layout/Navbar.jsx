import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { GlobalSearch } from '../common/GlobalSearch';
import { CreateProjectModal } from '../projects/CreateProjectModal';

const PAGE_META = {
  '/': { title: 'Dashboard', parent: 'Workspace' },
  '/dashboard': { title: 'Dashboard', parent: 'Workspace' },
  '/projects': { title: 'Projects', parent: 'Workspace' },
  '/tasks': { title: 'Tasks', parent: 'Workspace' },
  '/documents': { title: 'Documents', parent: 'Workspace' },
  '/whiteboards': { title: 'Whiteboards', parent: 'Studio' },
  '/code': { title: 'Code workspace', parent: 'Studio' },
  '/meetings': { title: 'Team & meetings', parent: 'Studio' },
  '/settings': { title: 'Settings', parent: 'Account' },
  '/collaborative-editor-test': { title: 'Documents', parent: 'Workspace' },
};

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, cycleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const resolveMeta = () => {
    const path = location.pathname;
    if (PAGE_META[path]) return PAGE_META[path];
    if (path.startsWith('/projects/') && path.includes('/boards/')) {
      return { title: 'Whiteboard', parent: 'Projects' };
    }
    if (path.startsWith('/projects/')) return { title: 'Project workspace', parent: 'Projects' };
    return { title: 'SyncSpace', parent: 'Workspace' };
  };

  const meta = resolveMeta();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-glass)] px-4 backdrop-blur-xl md:px-6 select-none">
        {/* Left: menu + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onOpenMobileMenu}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] md:hidden cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="hidden text-[12px] font-medium text-[var(--text-muted)] sm:inline">
              {meta.parent}
            </span>
            <ChevronRight className="hidden h-3.5 w-3.5 text-[var(--border-strong)] sm:block" />
            <h1 className="truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Center: command search */}
        <div className="hidden flex-1 justify-center lg:flex">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="group flex h-9 w-full max-w-sm items-center gap-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3.5 text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface)] cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 shrink-0 group-hover:text-[var(--accent)] transition-colors" />
            <span className="flex-1 text-left text-[12.5px]">Search workspace…</span>
            <kbd className="rounded-[5px] border border-[var(--border-subtle)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: utilities */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] lg:hidden cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={cycleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {isAuthenticated && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsCreateProjectOpen(true)}
              className="hidden sm:inline-flex"
            >
              New project
            </Button>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false);
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]" />
            </button>

            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
                <div className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-menu)] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
                    <span className="sx-eyebrow">Notifications</span>
                    <span className="rounded-full bg-[var(--surface-inset)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                      Inbox
                    </span>
                  </div>
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto mb-2 h-5 w-5 text-[var(--text-muted)]" />
                    <p className="font-display text-[12.5px] font-semibold text-[var(--text-primary)]">
                      You're all caught up
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--text-muted)]">
                      Project updates will appear here.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex h-8 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] pl-1 pr-1 sm:pr-2.5 transition-colors hover:border-[var(--border-strong)] cursor-pointer"
                aria-label="Account menu"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-[10.5px] font-bold text-[var(--accent)]">
                  {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </span>
                <span className="hidden max-w-[90px] truncate font-display text-[11.5px] font-semibold text-[var(--text-primary)] sm:inline">
                  {user?.username || 'Member'}
                </span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-menu)] animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-[var(--border-subtle)] px-2.5 py-2">
                      <p className="font-display text-[12.5px] font-semibold text-[var(--text-primary)]">
                        {user?.username || 'Member'}
                      </p>
                      <p className="truncate text-[11px] text-[var(--text-muted)]">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/projects');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <FolderKanban className="h-3.5 w-3.5" /> My projects
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </button>
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-1">
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                          navigate('/landing');
                        }}
                        className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-[12px] font-medium text-[var(--error)] transition-colors hover:bg-[var(--error-soft)] cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button size="sm" variant="primary" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={() => navigate('/projects')}
      />
    </>
  );
};
