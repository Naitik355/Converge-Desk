import React, { useState } from 'react';
import { Copy, Check, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { TldrawCollaborativeCanvas } from './TldrawCollaborativeCanvas';

/** Whiteboard powered by tldraw's hosted demo sync for local testing only. */
export const ExcalidrawWrapper = ({ board, onOpenAiAssistant }) => {
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { success } = useToast();
  const [tldrawEditor, setTldrawEditor] = useState(null);
  const tldrawRoomId = `convergedesk-${board.room_id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      success('Invite link copied', 'Share this whiteboard URL with collaborators.');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      success('Copy failed', 'Your browser did not allow copying the invite link.');
    }
  };

  return (
    <div
      className={`relative flex flex-col overflow-hidden bg-[var(--surface)] ${
        isFullScreen
          ? 'fixed inset-0 z-50'
          : 'm-4 mt-0 flex-1 rounded-[var(--radius-card)] border border-[var(--border-subtle)] sm:m-5 sm:mt-0'
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]/95 px-3 py-1.5 shadow-[var(--shadow-sm)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          <span className="font-display text-[10.5px] font-semibold text-[var(--text-secondary)]">
            Multiplayer canvas
          </span>
          <span className="h-3 w-px bg-[var(--border-subtle)]" />
          <span className="font-mono text-[10px] text-[var(--text-muted)]">{board.room_id}</span>
        </div>
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        {onOpenAiAssistant && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onOpenAiAssistant?.(tldrawEditor)}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            className="shadow-[var(--shadow-sm)]"
          >
            <span className="hidden sm:inline">Draw to code</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopyLink}
          leftIcon={copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
          className="shadow-[var(--shadow-sm)]"
        >
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Invite'}</span>
        </Button>
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] shadow-[var(--shadow-sm)] transition-colors hover:text-[var(--text-primary)]"
          title={isFullScreen ? 'Exit full screen' : 'Full screen canvas'}
        >
          {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="relative h-full w-full flex-1 overflow-hidden bg-white">
        <TldrawCollaborativeCanvas roomId={tldrawRoomId} onEditorMount={setTldrawEditor} />
      </div>

      <div className="pointer-events-none absolute bottom-20 left-4 z-10 hidden sm:block">
        <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]/95 px-3 py-1.5 font-mono text-[10px] text-[var(--text-muted)] shadow-[var(--shadow-sm)] backdrop-blur">
          Zoom, draw and move — changes sync live
        </div>
      </div>
    </div>
  );
};
