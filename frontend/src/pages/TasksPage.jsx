import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects } from '../api/projects';
import { getProjectTasks, updateTask, deleteTask } from '../api/tasks';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton } from '../components/common/LoadingSkeleton';
import { CheckSquare, Search, Filter, RefreshCw, FolderKanban } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
            projectTasks.forEach((t) => {
              allTasks.push({ ...t, projectName: p.name });
            });
          } catch {
            // continue
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
      success('Status Updated', `Task moved to ${newStatus}`);
      loadAllTasks();
    } catch (err) {
      toastError('Update Failed', err?.message || 'Could not update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      success('Task Deleted', 'Task removed.');
      loadAllTasks();
    } catch (err) {
      toastError('Delete Failed', err?.message || 'Could not delete task');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="mono-label text-[var(--signal-teal)] text-[10px]">
            // PIPELINE MANAGEMENT
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Sprint Task Registry
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Aggregated backlog, active, and completed deliverables across workspaces.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadAllTasks}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          SYNC TASKS
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-card p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search tasks or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-[var(--surface-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-[var(--btn-radius)] focus:outline-none focus:border-[var(--signal-teal)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-mono py-2 px-3 bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-[var(--btn-radius)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--signal-teal)]"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="space-y-3">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-7 h-7" />}
          title="No tasks found matching filter"
          description={
            search || statusFilter !== 'all'
              ? 'Try modifying your filter query or clearing the search keyword.'
              : 'Tasks created in your project task boards will appear in this unified registry.'
          }
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              OPEN PROJECTS
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="relative group">
              <div className="text-[10px] font-mono text-[var(--text-muted)] mb-1 flex items-center gap-1.5 truncate">
                <FolderKanban className="w-3 h-3 text-[var(--signal-teal)]" />
                <span className="font-semibold text-[var(--text-primary)]">{task.projectName}</span>
              </div>
              <TaskCard
                task={task}
                onOpenDetails={(t) => setSelectedTask(t)}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            </div>
          ))}
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
        />
      )}
    </div>
  );
};
