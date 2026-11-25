import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard } from '../api/boards';
import { ExcalidrawWrapper } from '../components/boards/ExcalidrawWrapper';
import { AiDrawingToCodePanel } from '../components/boards/AiDrawingToCodePanel';
import { Button } from '../components/common/Button';
import { ArrowLeft, Shapes, AlertCircle, RefreshCw, Users } from 'lucide-react';

export const BoardViewPage = () => {
  const { projectId, boardId } = useParams();
  const bId = parseInt(boardId || '0', 10);
  const pId = parseInt(projectId || '0', 10);
  const navigate = useNavigate();
  const [tldrawEditor, setTldrawEditor] = useState(null);
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const fetchBoard = useCallback(async () => {
    if (!bId) return;
    setIsLoading(true);
    setError(null);
    try {
      setBoard(await getBoard(bId));
    } catch (err) {
      setError(
        err?.message ||
          'Failed to load whiteboard. Ensure you are an authorized member of this project.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [bId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-3 bg-[var(--canvas)]">
        <RefreshCw className="h-6 w-6 animate-spin text-[var(--accent)]" />
        <p className="text-[12.5px] text-[var(--text-muted)]">Connecting to the canvas room…</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8 pt-16 text-center">
        <div className="rounded-[var(--radius-panel)] border border-[var(--error)]/30 bg-[var(--error-soft)] p-8">
          <AlertCircle className="mx-auto mb-3 h-6 w-6 text-[var(--error)]" />
          <p className="font-display text-[15px] font-semibold text-[var(--error)]">
            Could not open this canvas
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
            {error || 'Whiteboard could not be found.'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(pId ? `/projects/${pId}` : '/projects')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Return to project
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[var(--canvas)]">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface)] px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={() => navigate(pId ? `/projects/${pId}` : '/projects')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-[var(--border-subtle)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            title="Back to project"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]">
            <Shapes className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[13px] font-semibold text-[var(--text-primary)]">
              {board.title}
            </h1>
            <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">
              Canvas · {board.room_id}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2.5 py-1 text-[10.5px] text-[var(--text-muted)] sm:flex">
            <Users className="h-3 w-3" /> Live room
          </span>
        </div>
      </div>

      <ExcalidrawWrapper
        board={board}
        onOpenAiAssistant={(editor) => {
          setTldrawEditor(editor);
          setIsAiOpen(true);
        }}
      />

      <AiDrawingToCodePanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        boardTitle={board.title}
        editor={tldrawEditor}
      />
    </div>
  );
};
