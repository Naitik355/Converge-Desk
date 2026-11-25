import React, { useEffect, useMemo, useState } from 'react';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { Button } from '../common/Button';
import { Plus, Search, CheckCircle2, Clock, CircleDot, ListFilter } from 'lucide-react';
import { updateTask, deleteTask } from '../../api/tasks';
import { getProjectMembers } from '../../api/projects';
import { useToast } from '../../context/ToastContext';

const COLUMNS = [
  {
    id: 'todo',
    label: 'To do',
    icon: CircleDot,
    tone: 'var(--text-muted)',
  },
  {
    id: 'in_progress',
    label: 'In progress',
    icon: Clock,
    tone: 'var(--warning-strong)',
  },
  {
    id: 'done',
    label: 'Completed',
    icon: CheckCircle2,
    tone: 'var(--success)',
  },
];

export const TaskBoard = ({ tasks = [], projectId, canEdit = true, onTasksChange }) => {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [members, setMembers] = useState([]);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    let active = true;
    getProjectMembers(projectId)
      .then((results) => {
        if (active) setMembers(results);
      })
      .catch(() => {
        if (active) setMembers([]);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const memberNames = useMemo(
    () => new Map(members.map((member) => [member.user_id ?? member.id, member.username])),
    [members]
  );

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      success('Task moved', `Now in ${newStatus.replace('_', ' ')}.`);
      onTasksChange();
    } catch (err) {
      toastError('Update failed', err?.message || 'Failed to update status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      success('Task deleted', 'Task removed from the project.');
      onTasksChange();
    } catch (err) {
      toastError('Delete failed', err?.message || 'Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Board toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Filter tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-3 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)]"
            />
          </div>
          <div className="relative">
            <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 appearance-none rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-7 font-display text-[11.5px] font-semibold text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add task
          </Button>
        )}
      </div>

      {/* Wells */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);
          const Icon = column.icon;
          return (
            <section
              key={column.id}
              className="flex min-h-[240px] flex-col rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-2.5"
            >
              <header className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: column.tone }} />
                  <h3 className="font-display text-[11.5px] font-bold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                    {column.label}
                  </h3>
                  <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--text-muted)]">
                    {columnTasks.length}
                  </span>
                </div>
              </header>

              <div className="flex-1 space-y-2">
                {columnTasks.length === 0 ? (
                  <button
                    onClick={() => canEdit && setIsCreateOpen(true)}
                    className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-[9px] border border-dashed border-[var(--border-strong)] text-[11px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add a task
                  </button>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assigneeName={
                        task.assigned_to == null ? undefined : memberNames.get(task.assigned_to)
                      }
                      canEdit={canEdit}
                      onStatusChange={handleStatusChange}
                      onOpenDetails={setSelectedTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={projectId}
        onCreated={() => onTasksChange()}
      />
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        projectTasks={tasks}
        members={members}
        canEdit={canEdit}
        onTaskUpdated={() => onTasksChange()}
        onTaskDeleted={() => onTasksChange()}
      />
    </div>
  );
};
