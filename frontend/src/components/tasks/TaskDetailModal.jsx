import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  updateTask,
  deleteTask,
  getTaskDependencies,
  addTaskDependency,
  deleteTaskDependency,
} from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import { Link2, Plus, Trash2, CalendarDays, Flag } from 'lucide-react';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  projectTasks,
  members = [],
  onTaskUpdated,
  onTaskDeleted,
  canEdit = true,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dependencies, setDependencies] = useState([]);
  const [selectedPrereqId, setSelectedPrereqId] = useState('');
  const [isLoadingDeps, setIsLoadingDeps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error: toastError } = useToast();

  const loadDependencies = useCallback(async (taskId) => {
    setIsLoadingDeps(true);
    try {
      setDependencies(await getTaskDependencies(taskId));
    } catch {
      setDependencies([]);
    } finally {
      setIsLoadingDeps(false);
    }
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date || '');
      setAssigneeId(task.assigned_to == null ? '' : String(task.assigned_to));
      loadDependencies(task.id);
    }
  }, [task, loadDependencies]);

  if (!task) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const updatedFields = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || null,
        assigned_to: assigneeId ? Number(assigneeId) : null,
      });
      const fullUpdated = {
        ...task,
        ...updatedFields,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || null,
        assigned_to: assigneeId ? Number(assigneeId) : null,
      };
      success('Task updated', 'Changes saved.');
      onTaskUpdated(fullUpdated);
      onClose();
    } catch (err) {
      toastError('Save failed', err?.message || 'Could not update task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      success('Task deleted', 'Task removed successfully.');
      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      toastError('Delete failed', err?.message || 'Could not delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddDependency = async () => {
    if (!selectedPrereqId) return;
    try {
      await addTaskDependency(task.id, parseInt(selectedPrereqId, 10));
      success('Dependency added', 'Prerequisite task linked.');
      setSelectedPrereqId('');
      loadDependencies(task.id);
    } catch (err) {
      toastError('Dependency error', err?.message || 'Failed to add dependency.');
    }
  };

  const handleRemoveDependency = async (depId) => {
    try {
      await deleteTaskDependency(task.id, depId);
      success('Dependency removed', 'Link removed.');
      loadDependencies(task.id);
    } catch (err) {
      toastError('Error', err?.message || 'Failed to remove dependency.');
    }
  };

  const currentDepIds = new Set(dependencies.map((d) => d.depends_on));
  const availablePrereqs = (projectTasks || []).filter(
    (t) => t.id !== task.id && !currentDepIds.has(t.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={`Task SS-${task.id}`}
      title={task.title || 'Task details'}
      description="Edit the work item, its ownership and its prerequisites."
      maxWidth="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          {canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              className="text-[var(--error)] hover:bg-[var(--error-soft)]"
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            {canEdit && (
              <Button onClick={handleSave} isLoading={isSaving}>
                Save changes
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
          {dueDate && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-inset)] px-2.5 py-1 text-[10.5px] text-[var(--text-muted)]">
              <CalendarDays className="h-3 w-3" />
              {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
            <Flag className="h-3 w-3" /> {dependencies.length} prerequisite
            {dependencies.length === 1 ? '' : 's'}
          </span>
        </div>

        <div>
          <label className="mb-1.5 block font-display text-xs font-semibold text-[var(--text-secondary)]">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
            className="h-10 w-full rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 font-display text-[14px] font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)] disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={!canEdit}
            options={[
              { value: 'todo', label: 'To do' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'review', label: 'In review' },
              { value: 'done', label: 'Completed' },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={!canEdit}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <Select
          label="Assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          disabled={!canEdit}
          options={[
            { value: '', label: 'Unassigned' },
            ...members
              .map((member) => ({
                value: String(member.user_id ?? member.id ?? ''),
                label: member.username,
              }))
              .filter((option) => option.value !== ''),
          ]}
        />

        <Textarea
          label="Description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!canEdit}
          placeholder="Add context, acceptance criteria or links…"
        />

        <div className="border-t border-[var(--border-subtle)] pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-display text-[12px] font-semibold text-[var(--text-primary)]">
              <Link2 className="h-3.5 w-3.5 text-[var(--accent)]" /> Dependencies
            </h4>
            <span className="text-[10.5px] text-[var(--text-muted)]">
              {dependencies.length} linked
            </span>
          </div>

          {isLoadingDeps ? (
            <p className="py-2 text-[11.5px] text-[var(--text-muted)]">Loading dependencies…</p>
          ) : dependencies.length === 0 ? (
            <p className="rounded-[9px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-4 text-[11.5px] text-[var(--text-muted)]">
              No prerequisites — this task can start immediately.
            </p>
          ) : (
            <div className="mb-3 space-y-1.5">
              {dependencies.map((dep) => (
                <div
                  key={dep.dependency_id}
                  className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: dep.is_blocking
                          ? 'var(--warning-strong)'
                          : 'var(--success)',
                      }}
                      title={dep.is_blocking ? 'Blocking' : 'Completed'}
                    />
                    <span className="truncate text-[11.5px] font-medium text-[var(--text-primary)]">
                      #{dep.depends_on} · {dep.title}
                    </span>
                    <StatusBadge status={dep.status} />
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveDependency(dep.dependency_id)}
                      className="rounded-[5px] p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--error-soft)] hover:text-[var(--error)] cursor-pointer"
                      title="Remove prerequisite"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canEdit && availablePrereqs.length > 0 && (
            <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
              <select
                value={selectedPrereqId}
                onChange={(e) => setSelectedPrereqId(e.target.value)}
                className="h-9 flex-1 cursor-pointer rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-[11.5px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              >
                <option value="">Select prerequisite task…</option>
                {availablePrereqs.map((prereq) => (
                  <option key={prereq.id} value={prereq.id}>
                    #{prereq.id} — {prereq.title} ({prereq.status})
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="secondary"
                disabled={!selectedPrereqId}
                onClick={handleAddDependency}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
