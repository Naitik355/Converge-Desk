import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects } from '../api/projects';
import { getProjectBoards, deleteBoard } from '../api/boards';
import { BoardCard } from '../components/boards/BoardCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { StatTile } from '../components/common/StatTile';
import { Shapes, Search, RefreshCw, FolderKanban, Users, Layers, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const WhiteboardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const loadAllBoards = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectList = await listProjects();
      const allBoards = [];

      await Promise.all(
        projectList.map(async (p) => {
          try {
            const projectBoards = await getProjectBoards(p.id);
            projectBoards.forEach((b) => {
              allBoards.push({ ...b, project_id: p.id, projectName: p.name });
            });
          } catch {
            /* skip inaccessible project */
          }
        })
      );

      setBoards(allBoards);
    } catch {
      setBoards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllBoards();
  }, [loadAllBoards]);

  const handleDeleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this whiteboard?')) return;
    try {
      await deleteBoard(boardId);
      success('Board deleted', 'Whiteboard removed.');
      loadAllBoards();
    } catch (err) {
      toastError('Delete failed', err?.message || 'Could not delete board.');
    }
  };

  const filteredBoards = boards.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const projectCount = new Set(boards.map((b) => b.project_id)).size;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 p-5 text-[var(--text-primary)] md:p-8">
      <PageHeader
        eyebrow="Studio"
        title="Whiteboards"
        description="Shared canvases for the thinking that doesn't fit in a ticket — architecture, flows and rough sketches."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAllBoards}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh canvases
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile label="Canvases" value={boards.length} hint="Across your projects" icon={Shapes} accent="accent" />
        <StatTile label="Projects" value={projectCount} hint="With a board" icon={Layers} />
        <StatTile label="Collaboration" value="Live" hint="Real-time presence" icon={Users} accent="success" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search canvases or projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-9 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--accent-soft)]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          New canvases are created inside a project.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredBoards.length === 0 ? (
        <EmptyState
          icon={<Shapes className="h-5 w-5" />}
          title={search ? 'No matching canvases' : 'No whiteboards yet'}
          description="Open a project to create its first canvas for diagrams, flows and wireframes."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              Browse projects
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBoards.map((board) => (
            <div key={board.id}>
              <div className="mb-1.5 flex items-center gap-1.5 px-0.5 text-[10.5px] text-[var(--text-muted)]">
                <FolderKanban className="h-3 w-3" />
                <span className="font-medium text-[var(--text-secondary)]">{board.projectName}</span>
              </div>
              <BoardCard
                board={board}
                projectId={board.project_id || 0}
                onDelete={handleDeleteBoard}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
