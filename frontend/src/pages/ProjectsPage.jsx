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
import { FolderKanban, Plus, Search, RefreshCw, Filter, AlertCircle } from 'lucide-react';

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
      const data = await listProjects();
      setProjects(data);
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">Projects</h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
            // Manage your collaborative workspaces, documents, tasks, and whiteboards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-card)]"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[var(--signal-teal)] text-black font-bold"
          >
            New Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--card-radius)] bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchProjects} className="border-rose-700 bg-rose-900/30 text-rose-200">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface-raised)] p-3 rounded-[var(--card-radius)] border border-[var(--border-subtle)] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-[var(--btn-radius)] text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--signal-teal)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-mono py-2 px-3 bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-[var(--btn-radius)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--signal-teal)] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-7 h-7 text-emerald-400" />}
          title={search ? 'No matching projects' : 'No projects found'}
          description={
            search
              ? `No projects matched "${search}". Try adjusting your search query.`
              : 'Create your first project to start organizing tasks, collaborative documents, and multiplayer whiteboards.'
          }
          actionLabel={search ? undefined : 'Create Project'}
          actionIcon={<Plus className="w-4 h-4" />}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Modals */}
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
        onUpdated={() => {
          fetchProjects();
        }}
      />

      <DeleteProjectDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        project={deletingProject}
        onDeleted={() => {
          fetchProjects();
        }}
      />
    </div>
  );
};
