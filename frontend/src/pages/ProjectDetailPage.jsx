import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import { ProjectMembersPanel } from '../components/projects/ProjectMembersPanel';
import { ProjectDocumentsPanel } from '../components/projects/ProjectDocumentsPanel';
import { CodeEditorPanel } from '../components/projects/CodeEditorPanel';
import { getProjectTasks } from '../api/tasks';
import { getProjectBoards, deleteBoard } from '../api/boards';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { BoardCard } from '../components/boards/BoardCard';
import { CreateBoardModal } from '../components/boards/CreateBoardModal';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Panel } from '../components/common/Card';
import { StatTile } from '../components/common/StatTile';
import { getProjectMeetings } from '../api/meetings';
import { useMeeting } from '../context/MeetingContext';
import { PageHeaderSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import {
  FileText,
  ListChecks,
  Shapes,
  Users,
  Settings as SettingsIcon,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Copy,
  Play,
  Video,
  Code2,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const idNum = parseInt(projectId || '0', 10);
  const navigate = useNavigate();
  const { startMeeting } = useMeeting();
  const { success, error: toastError } = useToast();
  const [projectMeetings, setProjectMeetings] = useState([]);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  const loadProjectData = useCallback(async () => {
    if (!idNum) return;
    setIsLoading(true);
    setError(null);
    try {
      const proj = await getProject(idNum);
      setProject(proj);

      const [taskList, boardList] = await Promise.all([
        getProjectTasks(idNum).catch(() => []),
        getProjectBoards(idNum).catch(() => []),
      ]);

      setTasks(taskList);
      setBoards(boardList);
    } catch (err) {
      setError(err?.message || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  }, [idNum]);

  const loadMeetings = useCallback(async () => {
    if (!idNum) return;
    try {
      setProjectMeetings(await getProjectMeetings(idNum));
    } catch (err) {
      toastError('Could not load meetings', err?.message || 'Please try again.');
    }
  }, [idNum, toastError]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleDeleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this whiteboard?')) return;
    try {
      await deleteBoard(boardId);
      success('Whiteboard deleted', 'Board removed from the project.');
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err) {
      toastError('Delete failed', err?.message || 'Could not delete board.');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-6 p-5 md:p-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-2xl p-8 pt-16 text-center">
        <div className="rounded-[var(--radius-panel)] border border-[var(--error)]/30 bg-[var(--error-soft)] p-8">
          <AlertCircle className="mx-auto mb-3 h-6 w-6 text-[var(--error)]" />
          <p className="font-display text-[15px] font-semibold text-[var(--error)]">
            Project unavailable
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">
            {error || 'Could not retrieve project data.'}
          </p>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/projects')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to projects
        </Button>
      </div>
    );
  }

  const canEdit = project.role !== 'viewer';
  const isOwner = project.role === 'owner';
  const completed = tasks.filter((t) => t.status === 'done').length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const created = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: ListChecks, count: tasks.length },
    { id: 'whiteboards', label: 'Whiteboards', icon: Shapes, count: boards.length },
    { id: 'docs', label: 'Documents', icon: FileText },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'meetings', label: 'Meetings', icon: Video, count: projectMeetings.length },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] p-5 md:p-8 space-y-6 text-[var(--text-primary)]">
      {/* Project header */}
      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="relative border-b border-[var(--border-subtle)] px-5 py-6 sm:px-7">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-72 rounded-bl-[140px] bg-[var(--accent-soft)] opacity-60" />
          <div className="relative">
            <button
              onClick={() => navigate('/projects')}
              className="mb-4 inline-flex items-center gap-1.5 font-display text-[11.5px] font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All projects
            </button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[var(--accent-soft)] font-display text-[18px] font-bold text-[var(--accent)]">
                  {(project.name?.[0] || 'P').toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="sx-display-m">{project.name}</h1>
                    <RoleBadge role={project.role} />
                  </div>
                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--text-muted)]">
                    {project.description || 'No description yet. Edit the project to add goals and context.'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--text-muted)]">
                    {created && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3" /> Created {created}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> {completion}% complete
                    </span>
                    <span className="font-mono">ID #{project.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {canEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditProjectOpen(true)}
                    leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                )}
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteProjectOpen(true)}
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                    className="text-[var(--error)] hover:bg-[var(--error-soft)]"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[var(--border-subtle)] sm:grid-cols-4">
          {[
            { label: 'Tasks', value: tasks.length, hint: `${completed} done`, icon: ListChecks },
            { label: 'In flight', value: tasks.length - completed, hint: 'Open work', icon: Play },
            { label: 'Whiteboards', value: boards.length, hint: 'Live canvases', icon: Shapes },
            { label: 'Completion', value: `${completion}%`, hint: 'Tasks closed', icon: CheckCircle2 },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-3 px-5 py-4">
              <metric.icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <div>
                <p className="sx-eyebrow">{metric.label}</p>
                <p className="mt-1 font-display text-[18px] font-bold leading-none tracking-[-0.03em]">
                  {metric.value}
                </p>
                <p className="mt-1 text-[10.5px] text-[var(--text-muted)]">{metric.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section nav */}
      <div className="sticky top-16 z-20 -mx-1 border-b border-[var(--border-subtle)] bg-[var(--canvas)]/90 px-1 backdrop-blur-md">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-t-[8px] px-3.5 py-3 font-display text-[12px] font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9.5px] ${
                      isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'bg-[var(--surface-inset)] text-[var(--text-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      {activeTab === 'tasks' && (
        <TaskBoard
          tasks={tasks}
          projectId={project.id}
          canEdit={canEdit}
          onTasksChange={loadProjectData}
        />
      )}

      {activeTab === 'whiteboards' && (
        <Panel
          eyebrow="Canvas"
          title="Project whiteboards"
          description="Multiplayer diagrams tied to this project."
          bodyClassName="p-4"
          actions={
            canEdit && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsCreateBoardOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                New whiteboard
              </Button>
            )
          }
        >
          {boards.length === 0 ? (
            <EmptyState
              icon={<Shapes className="w-5 h-5" />}
              title="No whiteboards yet"
              description="Create a canvas for flowcharts, wireframes and architecture diagrams."
              compact
              action={
                canEdit && (
                  <Button
                    size="sm"
                    onClick={() => setIsCreateBoardOpen(true)}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Create whiteboard
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  projectId={project.id}
                  canEdit={canEdit}
                  onDelete={handleDeleteBoard}
                />
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'docs' && (
        <ProjectDocumentsPanel projectId={project.id} canEdit={canEdit} />
      )}

      <div className={activeTab === 'code' ? 'block' : 'hidden'}>
        <CodeEditorPanel projectId={project.id} canEdit={canEdit} />
      </div>

      {activeTab === 'members' && (
        <ProjectMembersPanel projectId={project.id} isOwner={isOwner} />
      )}

      {activeTab === 'meetings' && (
        <Panel
          eyebrow="Rooms"
          title="Project meetings"
          description={`Live rooms for ${project.name}.`}
          bodyClassName="p-4"
          actions={
            <Button size="sm" variant="secondary" onClick={() => navigate('/meetings')}>
              Open meetings
            </Button>
          }
        >
          {projectMeetings.length === 0 ? (
            <EmptyState
              icon={<Video className="w-5 h-5" />}
              title="No meetings yet"
              description="Create a room from the meetings page and invite project members."
              compact
              actionLabel="Open meetings"
              onAction={() => navigate('/meetings')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {projectMeetings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4"
                >
                  <div className="min-w-0">
                    <h4 className="truncate font-display text-[13px] font-semibold">{item.title}</h4>
                    <p className="mt-1 inline-block truncate rounded-[5px] border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--text-muted)]">
                      {item.roomName}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => startMeeting(item.title, item.roomName)}
                      leftIcon={<Play className="h-3.5 w-3.5" />}
                    >
                      Join
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.roomName);
                          success('Room code copied', item.roomName);
                        } catch {
                          toastError('Could not copy room code', 'Please copy it manually.');
                        }
                      }}
                      leftIcon={<Copy className="h-3.5 w-3.5" />}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Panel eyebrow="Project" title="General details" bodyClassName="p-5">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="sx-eyebrow">Name</dt>
                  <dd className="mt-1.5 text-[13px] text-[var(--text-primary)]">{project.name}</dd>
                </div>
                <div>
                  <dt className="sx-eyebrow">Your role</dt>
                  <dd className="mt-1.5">
                    <RoleBadge role={project.role} />
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="sx-eyebrow">Description</dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {project.description || 'No description provided.'}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!canEdit}
                  onClick={() => setIsEditProjectOpen(true)}
                  leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                >
                  Edit project details
                </Button>
              </div>
            </Panel>
          </div>

          {isOwner && (
            <div className="rounded-[var(--radius-card)] border border-[var(--error)]/25 bg-[var(--error-soft)] p-5">
              <p className="sx-eyebrow text-[var(--error)]">Danger zone</p>
              <h3 className="mt-2 font-display text-[14px] font-semibold text-[var(--error)]">
                Delete this project
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
                Permanently remove the project and its tasks, boards and documents. This cannot be undone.
              </p>
              <Button
                size="sm"
                variant="danger"
                className="mt-4"
                onClick={() => setIsDeleteProjectOpen(true)}
              >
                Delete project
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        projectId={project.id}
        onCreated={(newBoard) => {
          loadProjectData();
          navigate(`/projects/${project.id}/boards/${newBoard.id}`);
        }}
      />

      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        project={project}
        onUpdated={() => loadProjectData()}
      />

      <DeleteProjectDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        project={project}
        onDeleted={() => navigate('/projects')}
      />
    </div>
  );
};
