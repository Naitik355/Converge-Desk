import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MeetingProvider } from '../../context/MeetingContext';
import { LiveMeetingLayer } from '../meetings/LiveMeetingLayer';

export const AppShell = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--canvas)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="sx-caption">Opening your workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <MeetingProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--canvas)] text-[var(--text-primary)]">
        <div className="hidden shrink-0 md:flex">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </div>

        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-[#0a0b0d]/60 backdrop-blur-[2px] animate-in fade-in duration-150"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative z-50 flex w-[270px] max-w-[85vw] flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-menu)] animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute right-3 top-4 z-10 rounded-[7px] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar
                isCollapsed={false}
                onToggleCollapse={() => {}}
                onCloseMobile={() => setIsMobileOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main className="relative flex-1 overflow-y-auto animate-in fade-in duration-200">
            {children || <Outlet />}
          </main>
        </div>
        <LiveMeetingLayer />
      </div>
    </MeetingProvider>
  );
};
