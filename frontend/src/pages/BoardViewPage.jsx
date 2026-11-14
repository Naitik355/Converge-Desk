import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard } from '../api/boards';
import { ExcalidrawWrapper } from '../components/boards/ExcalidrawWrapper';
import { AiDrawingToCodePanel } from '../components/boards/AiDrawingToCodePanel';
import { Button } from '../components/common/Button';
import { ArrowLeft, Presentation, AlertCircle, RefreshCw } from 'lucide-react';
import { editor } from 'monaco-editor';

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
      const data = await getBoard(bId);
      setBoard(data);
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm font-medium text-slate-300">Connecting to whiteboard room...</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 pt-16">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-base mb-1 text-rose-200">Whiteboard Access Error</p>
          <p className="text-xs text-rose-400">{error || 'Whiteboard could not be found.'}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(pId ? `/projects/${pId}` : '/projects')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Project
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1700px] mx-auto text-[var(--text-primary)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(pId ? `/projects/${pId}` : '/projects')}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-[var(--btn-radius)] transition-colors border border-[var(--border-subtle)]"
            title="Back to project workspace"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-amber)] flex items-center justify-center">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-primary)] leading-tight">
                {board.title}
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                // Multiplayer Excalidraw Canvas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Component */}
      <ExcalidrawWrapper
        board={board}
        onOpenAiAssistant={(editor)=>{setTldrawEditor(editor); setIsAiOpen(true)}}
      />

      {/* AI Assistant Drawer */}
      <AiDrawingToCodePanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        boardTitle={board.title}
        editor={tldrawEditor}
      />
    </div>
  );
};
