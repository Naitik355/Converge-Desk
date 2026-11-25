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
import { CardSkeleton, StatSkeleton } from '../components/common/LoadingSkeleton';
import { PriorityBadge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Card';
import { StatTile } from '../components/common/StatTile';
import {
  FolderKanban,
  ListChecks,
  Shapes,
  Plus,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Code2,
  Video,
  FileText,
  CalendarDays,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    title: 'Documents',
    note: 'Write and edit together',
    path: '/documents',
    icon: FileText,
  },
  {
    title: 'Code workspace',
    note: 'Open the browser IDE',
    path: '/code',
    icon: Code2,
  },
  {
    title: 'Whiteboards',
    note: 'Sketch the architecture',
    path: '/whiteboards',
    icon: Shapes,
  },
  {
    title: 'Team & meetings',
    note: 'Start a huddle',
    path: '/meetings',
    icon: Video,
  },
];

export const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [boardsCount, setBoardsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projectList = await listProjects();
      setProjects(projectList);

      const allTasks = [];
      let totalBoards = 0;

      await Promise.all(
        projectList.slice(0, 8).map(async (p) => {
          try {
            const [projectTasks, projectBoards] = await Promise.all([
              getProjectTasks(p.id).catch(() => []),
              getProjectBoards(p.id).catch(() => []),
            ]);
            projectTasks.forEach((t) => allTasks.push({ ...t, projectName: p.name }));
            totalBoards += projectBoards.length;
          } catch {
            /* keep the rest of the dashboard usable */
          }
        })
      );

      setTasks(allTasks);
      setBoardsCount(totalBoards);
    } catch (err) {
      setError(
        err?.status === 401
          ? 'Please sign in to access your projects and workspace.'
          : err?.message || 'Failed to connect to backend service.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) setIsLoading(false);
      else fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, fetchDashboardData]);

  if (!authLoading && !isAuthenticated) return null;

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const completion = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const upcomingDeadlines = tasks
    .filter((t) => t.due_date && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] p-5 md:p-8 space-y-6 text-[var(--text-primary)]">
      <PageHeader
        eyebrow={`${today} · Workspace overview`}
        title={`${greeting}, ${user?.username || 'builder'}`}
        description="Here's the state of your projects, sprint work and recent activity."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New project
            </Button>
          </>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--error)]/30 bg-[var(--error-soft)] p-4 text-[var(--error)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span className="text-[12.5px]">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchDashboardData}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatTile
              label="Projects"
              value={projects.length}
              hint="Shared workspaces"
              icon={FolderKanban}
              accent="accent"
            />
            <StatTile
              label="Open tasks"
              value={activeTasks.length}
              hint={`${completedTasks.length} completed`}
              icon={ListChecks}
            />
            <StatTile
              label="Whiteboards"
              value={boardsCount}
              hint="Live canvases"
              icon={Shapes}
            />
            <StatTile
              label="Completion"
              value={`${completion}%`}
              hint="Across all projects"
              icon={Activity}
              accent={completion >= 70 ? 'success' : 'warning'}
            />
          </>
        )}
      </div>

      {/* Main + rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {/* Projects */}
          <Panel
            eyebrow="Workspaces"
            title="Your projects"
            description="Jump back into active project rooms."
            bodyClassName="p-4"
            actions={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/projects')}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View all
              </Button>
            }
          >
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="w-5 h-5" />}
                title="No projects yet"
                description="Create your first workspace to bring tasks, documents and canvases together."
                action={
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsCreateOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Create project
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {projects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={(p) => setEditingProject(p)}
                    onDelete={(p) => setDeletingProject(p)}
                  />
                ))}
              </div>
            )}
          </Panel>

          {/* Tasks */}
          <Panel
            flush
            eyebrow="Sprint work"
            title="Needs attention"
            description={`${activeTasks.length} open across your projects`}
            bodyClassName="p-0"
            actions={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/tasks')}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Task board
              </Button>
            }
          >
            {isLoading ? (
              <div className="space-y-3 p-4">
                <div className="sx-skeleton h-10 w-full" />
                <div className="sx-skeleton h-10 w-full" />
                <div className="sx-skeleton h-10 w-full" />
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <CheckCircle2 className="mb-2 h-5 w-5 text-[var(--success)]" />
                <p className="font-display text-[13px] font-semibold">Everything is closed out</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                  New tasks from your projects will surface here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {activeTasks.slice(0, 6).map((task) => (
                  <li
                    key={task.id}
                    onClick={() => navigate('/tasks')}
                    className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <Circle className="h-4 w-4 shrink-0 text-[var(--border-strong)] group-hover:text-[var(--accent)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-[var(--text-primary)]">
                        {task.title}
                      </p>
                      <p className="truncate text-[11px] text-[var(--text-muted)]">
                        {task.projectName}
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <PriorityBadge priority={task.priority} />
                      <span className="w-[74px] text-right text-[11px] text-[var(--text-muted)]">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'No date'}
                      </span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Contextual rail */}
        <aside className="space-y-5 xl:col-span-4">
          {/* Sprint health */}
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between">
              <p className="sx-eyebrow">Sprint health</p>
              <span className="rounded-full bg-[var(--surface-inset)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                All projects
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="sx-numeral text-[var(--text-primary)]">{completion}%</p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  {completedTasks.length} of {tasks.length} tasks complete
                </p>
              </div>
              <div className="flex h-11 items-end gap-1">
                {[35, 55, 40, 70, 60, 85, Math.max(completion, 12)].map((height, i) => (
                  <span
                    key={i}
                    className="w-2 rounded-sm"
                    style={{
                      height: `${height}%`,
                      backgroundColor: i === 6 ? 'var(--accent)' : 'var(--accent-soft)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-inset)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Quick actions */}
          <Panel
            eyebrow="Studio"
            title="Quick actions"
            bodyClassName="p-2"
          >
            <div className="space-y-0.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="group flex w-full items-center gap-3 rounded-[8px] px-2.5 py-2.5 text-left transition-colors hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--accent)]">
                    <action.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[12px] font-semibold text-[var(--text-primary)]">
                      {action.title}
                    </span>
                    <span className="block text-[10.5px] text-[var(--text-muted)]">{action.note}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </button>
              ))}
            </div>
          </Panel>

          {/* Deadlines */}
          <Panel
            eyebrow="Calendar"
            title="Upcoming deadlines"
            bodyClassName="p-4"
            actions={<CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />}
          >
            {upcomingDeadlines.length === 0 ? (
              <p className="py-2 text-[12px] text-[var(--text-muted)]">
                No due dates scheduled. Tasks with deadlines will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => {
                  const due = new Date(item.due_date);
                  const isSoon = due - new Date() < 1000 * 60 * 60 * 48;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                          isSoon ? 'bg-[var(--warning-strong)]' : 'bg-[var(--border-strong)]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">
                          {item.title}
                        </p>
                        <p className="text-[10.5px] text-[var(--text-muted)]">{item.projectName}</p>
                      </div>
                      <span
                        className={`shrink-0 text-[10.5px] font-semibold ${
                          isSoon ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </aside>
      </div>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          fetchDashboardData();
        }}
      />

      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onUpdated={() => {
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
          onDeleted={() => {
            setDeletingProject(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
