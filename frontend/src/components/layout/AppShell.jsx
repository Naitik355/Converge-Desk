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

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--surface-canvas)]">
        <div className="w-6 h-6 border-2 border-[var(--signal-teal)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <MeetingProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--surface-canvas)] text-[var(--text-primary)] transition-colors">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </div>

        {/* Mobile Drawer with Overlay & Escape support */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-xs bg-[var(--surface-card)] shadow-2xl z-50 border-r border-[var(--border-subtle)] animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar
                isCollapsed={false}
                onToggleCollapse={() => {}}
                onCloseMobile={() => setIsMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto relative animate-in fade-in duration-150">
            {children || <Outlet />}
          </main>
        </div>
        <LiveMeetingLayer />
      </div>
    </MeetingProvider>
  );
};
