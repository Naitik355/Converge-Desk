import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BoardViewPage } from './pages/BoardViewPage';
import { TasksPage } from './pages/TasksPage';
import { WhiteboardsPage } from './pages/WhiteboardsPage';
import { CodeWorkspacePage } from './pages/CodeWorkspacePage';
import { MeetingsPage } from './pages/MeetingsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AcceptProjectInvitationPage } from './pages/AcceptProjectInvitationPage';
import { CollaborativeEditorTestPage } from './pages/CollaborativeEditorTestPage';

const HomeRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--surface-canvas)]">
        <div className="w-6 h-6 border-2 border-[var(--signal-teal)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ) : (
    <LandingPage />
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Root Route: Standalone LandingPage when unauthenticated, AppShell+DashboardPage when authenticated */}
              <Route path="/" element={<HomeRoute />} />

              {/* Standalone Marketing & Authentication Routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/accept-project-invitation" element={<AcceptProjectInvitationPage />} />

              {/* Persistent Shell Layout Routes for Authenticated Users */}
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route
                  path="/projects/:projectId/boards/:boardId"
                  element={<BoardViewPage />}
                />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/whiteboards" element={<WhiteboardsPage />} />
                <Route path="/code" element={<CodeWorkspacePage />} />
                <Route path="/meetings" element={<MeetingsPage />} />
                <Route path="/collaborative-editor-test" element={<CollaborativeEditorTestPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}