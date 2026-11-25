import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { deleteProject } from '../../api/projects';
import { useToast } from '../../context/ToastContext';

export const DeleteProjectDialog = ({
  isOpen,
  onClose,
  project,
  onDeleted,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError } = useToast();

  if (!project) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteProject(project.id);
      success('Project Deleted', `"${project.name}" has been permanently removed.`);
      onClose();
      onDeleted(project.id);
    } catch (err) {
      const msg = err?.message || 'Failed to delete project. Owner permissions required.';
      toastError('Deletion Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project"
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete Project
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--error-soft)] text-[var(--error)]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            Delete <span className="font-semibold">{project.name}</span>?
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
            This permanently removes the project along with its tasks, documents and whiteboards.
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};
