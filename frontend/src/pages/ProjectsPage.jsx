import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects } from '../api/projects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { FolderKanban, Plus, Search, RefreshCw, AlertCircle, X } from 'lucide-react';

const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'owner', label: 'Owned' },
  { value: 'editor', label: 'Editing' },
  { value: 'viewer', label: 'Viewing' },
];

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProjects(await listProjects());
    } catch (err) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    all: projects.length,
    owner: projects.filter((p) => p.role === 'owner').length,
    editor: projects.filter((p) => p.role === 'editor').length,
    viewer: projects.filter((p) => p.role === 'viewer').length,
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] p-5 md:p-8 space-y-6 text-[var(--text-primary)]">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Every shared workspace you belong to, with its tasks, documents, canvases and code in one place."
        meta={
          <>
            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
              {counts.owner} owned
            </span>
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchProjects}
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
            <Button size="sm" variant="outline" onClick={fetchProjects}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-9 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-display text-[11.5px] font-semibold transition-colors cursor-pointer ${
                roleFilter === filter.value
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {filter.label}
              <span
                className={`text-[10px] ${
                  roleFilter === filter.value ? 'opacity-70' : 'text-[var(--text-muted)]'
                }`}
              >
                {counts[filter.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-5 h-5" />}
          title={search || roleFilter !== 'all' ? 'No matching projects' : 'No projects yet'}
          description={
            search || roleFilter !== 'all'
              ? 'Try a different search or role filter.'
              : 'Create your first project to connect tasks, documents, whiteboards and code.'
          }
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newProj) => {
          fetchProjects();
          navigate(`/projects/${newProj.id}`);
        }}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onUpdated={() => fetchProjects()}
      />

      <DeleteProjectDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        project={deletingProject}
        onDeleted={() => fetchProjects()}
      />
    </div>
  );
};
