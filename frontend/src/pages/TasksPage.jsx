import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects } from '../api/projects';
import { getProjectTasks, updateTask, deleteTask } from '../api/tasks';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton, StatSkeleton } from '../components/common/LoadingSkeleton';
import { PriorityBadge, STATUS_LABELS } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { StatTile } from '../components/common/StatTile';
import { SegmentedControl } from '../components/common/SegmentedControl';
import {
  ListChecks,
  Search,
  RefreshCw,
  FolderKanban,
  Kanban,
  List,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Trash2,
  ExternalLink,
  Clock,
  X,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const COLUMNS = [
  { id: 'todo', label: 'To do', icon: CircleDot, tone: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In progress', icon: Clock, tone: 'var(--warning-strong)' },
  { id: 'review', label: 'In review', icon: FolderKanban, tone: 'var(--accent)' },
  { id: 'done', label: 'Completed', icon: CheckCircle2, tone: 'var(--success)' },
];

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const loadAllTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectList = await listProjects();
      const allTasks = [];

      await Promise.all(
        projectList.map(async (p) => {
          try {
            const projectTasks = await getProjectTasks(p.id);
            projectTasks.forEach((t) =>
              allTasks.push({ ...t, projectName: p.name, projectId: p.id })
            );
          } catch {
            /* one inaccessible project should not break the registry */
          }
        })
      );

      setTasks(allTasks);
    } catch {
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllTasks();
  }, [loadAllTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      success('Task moved', `Now in ${newStatus.replace('_', ' ')}.`);
      loadAllTasks();
    } catch (err) {
      toastError('Update failed', err?.message || 'Could not update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      success('Task deleted', 'Task removed successfully.');
      loadAllTasks();
    } catch (err) {
      toastError('Delete failed', err?.message || 'Could not delete task');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.projectName && t.projectName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const counts = {
    open: tasks.filter((t) => t.status !== 'done').length,
    progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 p-5 text-[var(--text-primary)] md:p-8">
      <PageHeader
        eyebrow="Across every project"
        title="Tasks"
        description="One registry for everything in flight — switch between the board and a structured list without losing context."
        actions={
          <>
            <SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'kanban', label: 'Board', icon: Kanban },
                { value: 'list', label: 'List', icon: List },
              ]}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={loadAllTasks}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatTile label="Open" value={counts.open} hint="Not yet complete" icon={ListChecks} accent="accent" />
            <StatTile label="In progress" value={counts.progress} hint="Being worked on" icon={Clock} accent="warning" />
            <StatTile label="In review" value={counts.review} hint="Awaiting sign-off" icon={CircleDot} />
            <StatTile label="Completed" value={counts.done} hint="Closed out" icon={CheckCircle2} accent="success" />
          </>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-2.5 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search tasks or projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] pl-9 pr-9 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 cursor-pointer rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 font-display text-[11.5px] font-semibold text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="review">In review</option>
            <option value="done">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 cursor-pointer rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 font-display text-[11.5px] font-semibold text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="h-9 rounded-[8px] px-2.5 font-display text-[11.5px] font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="sx-panel overflow-hidden">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-5 w-5" />}
          title={hasFilters ? 'No tasks match those filters' : 'No tasks yet'}
          description={
            hasFilters
              ? 'Adjust the search or reset the filters to see the rest of the registry.'
              : 'Tasks created inside your project boards will appear here.'
          }
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              Browse projects
            </Button>
          }
        />
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column.id);
            const Icon = column.icon;
            return (
              <section
                key={column.id}
                className="flex min-h-[280px] flex-col rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-2.5"
              >
                <header className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" style={{ color: column.tone }} />
                    <h3 className="font-display text-[11.5px] font-bold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                      {column.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--text-muted)]">
                    {columnTasks.length}
                  </span>
                </header>

                <div className="flex-1 space-y-2">
                  {columnTasks.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-[9px] border border-dashed border-[var(--border-strong)] px-3 text-center text-[10.5px] text-[var(--text-muted)]">
                      Nothing here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        projectName={task.projectName}
                        onOpenDetails={(t) => setSelectedTask(t)}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]">
                  {['Task', 'Project', 'Status', 'Priority', 'Due', ''].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="group cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
                        {task.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
                        <FolderKanban className="h-3 w-3" />
                        {task.projectName}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="cursor-pointer rounded-[6px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                        <CalendarDays className="h-3 w-3" />
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="rounded-[5px] p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="View details"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-[5px] p-1.5 text-[var(--text-muted)] hover:bg-[var(--error-soft)] hover:text-[var(--error)] cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onTaskUpdated={() => {
            setSelectedTask(null);
            loadAllTasks();
          }}
          onTaskDeleted={() => {
            setSelectedTask(null);
            loadAllTasks();
          }}
        />
      )}
    </div>
  );
};
