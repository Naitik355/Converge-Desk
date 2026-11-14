import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../api/projects';
import { getProjectTasks } from '../api/tasks';
import { getProjectBoards } from '../api/boards';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import {
  FolderKanban,
  CheckSquare,
  Presentation,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Terminal,
  Video,
  FileText,
  Zap,
  Activity,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Aggregated summary stats
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalBoards, setTotalBoards] = useState(0);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projectList = await listProjects();
      setProjects(projectList);

      let taskCount = 0;
      let boardCount = 0;

      const detailPromises = projectList.slice(0, 5).map(async (p) => {
        try {
          const [tasks, boards] = await Promise.all([
            getProjectTasks(p.id).catch(() => []),
            getProjectBoards(p.id).catch(() => []),
          ]);
          taskCount += tasks.length;
          boardCount += boards.length;
        } catch {
          // ignore individual project fetch error
        }
      });

      await Promise.all(detailPromises);
      setTotalTasks(taskCount);
      setTotalBoards(boardCount);
    } catch (err) {
      if (err?.status === 401) {
        setError('Please log in to view your projects and dashboard.');
      } else {
        setError(err?.message || 'Failed to load projects. Ensure the Django backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setIsLoading(false);
      } else {
        fetchDashboardData();
      }
    }
  }, [authLoading, isAuthenticated, fetchDashboardData]);

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Welcome Banner */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden border-l-4 border-l-[var(--signal-teal)]">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-teal)] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-teal)] animate-pulse" />
            <span>WORKSPACE // ACTIVE</span>
            <span className="text-[var(--border-subtle)]">|</span>
            <span className="text-[var(--text-muted)]">NODE: POSTGRES + HOCUSPOCUS</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Welcome back, {user?.username || 'Collaborator'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Sprint management, conflict-free Yjs documentation, and multiplayer canvas workspaces in one unified view.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            REFRESH
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            NEW PROJECT
          </Button>
        </div>
      </div>

      {/* Bento Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'TOTAL PROJECTS',
            value: projects.length,
            icon: FolderKanban,
            accent: 'var(--signal-teal)',
            meta: 'ACTIVE WORKSPACES',
          },
          {
            label: 'ACTIVE TASKS',
            value: totalTasks,
            icon: CheckSquare,
            accent: 'var(--signal-amber)',
            meta: 'SPRINT PIPELINE',
          },
          {
            label: 'WHITEBOARD BOARDS',
            value: totalBoards,
            icon: Presentation,
            accent: 'var(--signal-violet)',
            meta: 'MULTIPLAYER CANVASES',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card p-5 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="mono-label text-[var(--text-muted)]">
                  {stat.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                  style={{ color: stat.accent }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display font-extrabold text-2xl md:text-3xl text-[var(--text-primary)]">
                {isLoading ? '—' : stat.value}
              </div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.accent }} />
                <span>{stat.meta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launchpad Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => navigate('/collaborative-editor-test')}
          className="glass-card p-4 hover:border-[var(--signal-teal)] cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--signal-teal)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--signal-teal)] transition-colors">
                Collaborative Docs Sandbox
              </h4>
              <p className="text-[10px] font-mono text-[var(--text-muted)]">Real-time Yjs Editor with local file uploads</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--signal-teal)] transition-all" />
        </div>

        <div
          onClick={() => navigate('/whiteboards')}
          className="glass-card p-4 hover:border-[var(--signal-amber)] cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--signal-amber)]">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--signal-amber)] transition-colors">
                Multiplayer Whiteboards
              </h4>
              <p className="text-[10px] font-mono text-[var(--text-muted)]">Excalidraw canvas architecture diagrams</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--signal-amber)] transition-all" />
        </div>

        <div
          onClick={() => navigate('/meetings')}
          className="glass-card p-4 hover:border-[var(--signal-violet)] cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--signal-violet)]">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--signal-violet)] transition-colors">
                Team PiP Video Calls
              </h4>
              <p className="text-[10px] font-mono text-[var(--text-muted)]">Low-latency WebRTC floating huddle window</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--signal-violet)] transition-all" />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-[var(--signal-coral)] text-[var(--signal-coral)] text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchDashboardData}>
              RETRY CONNECTION
            </Button>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
              Active Project Repositories
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
              {projects.length} TOTAL
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/projects')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            VIEW ALL
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && !error && (
          <EmptyState
            icon={<FolderKanban className="w-7 h-7" />}
            title="No project workspaces found"
            description="Create your first team project to organize sprint tasks, whiteboard diagrams, and collaborative documents."
            action={
              <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                CREATE YOUR FIRST PROJECT
              </Button>
            }
          />
        )}

        {/* Project Cards Grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => setEditingProject(p)}
                onDelete={(p) => setDeletingProject(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={() => {
          setIsCreateOpen(false);
          fetchDashboardData();
        }}
      />

      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onProjectUpdated={() => {
            setEditingProject(null);
            fetchDashboardData();
          }}
        />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          isOpen={!!deletingProject}
          onClose={() => setDeletingProject(null)}
          project={deletingProject}
          onProjectDeleted={() => {
            setDeletingProject(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
