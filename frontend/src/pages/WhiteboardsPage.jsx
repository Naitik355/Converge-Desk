import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects } from '../api/projects';
import { getProjectBoards, deleteBoard } from '../api/boards';
import { BoardCard } from '../components/boards/BoardCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { Presentation, Search, RefreshCw, FolderKanban } from 'lucide-react';
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
            // continue
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
      success('Board Deleted', 'Whiteboard removed.');
      loadAllBoards();
    } catch (err) {
      toastError('Delete Failed', err?.message || 'Could not delete board.');
    }
  };

  const filteredBoards = boards.filter((b) => {
    return (
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.projectName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="mono-label text-[var(--signal-amber)] text-[10px]">
            // MULTIPLAYER WIREFRAMING
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Multiplayer Whiteboards
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Excalidraw canvas architecture diagrams with real-time cursor presence.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadAllBoards}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          SYNC CANVASES
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center glass-card p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search whiteboards by title or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-[var(--surface-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-[var(--btn-radius)] focus:outline-none focus:border-[var(--signal-teal)]"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredBoards.length === 0 ? (
        <EmptyState
          icon={<Presentation className="w-7 h-7" />}
          title={search ? 'No matching whiteboards' : 'No whiteboards created yet'}
          description="Open any of your projects to launch an Excalidraw whiteboard room."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              VIEW WORKSPACES
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBoards.map((board) => (
            <div key={board.id} className="relative group">
              <div className="text-[10px] font-mono text-[var(--text-muted)] mb-1 flex items-center gap-1.5 truncate">
                <FolderKanban className="w-3 h-3 text-[var(--signal-amber)]" />
                <span className="font-semibold text-[var(--text-primary)]">{board.projectName}</span>
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
