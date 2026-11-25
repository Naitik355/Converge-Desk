import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  Files,
  Play,
  Copy,
  Check,
  Terminal,
  Plus,
  Wifi,
  WifiOff,
  FileCode2,
  ChevronDown,
  PanelBottom,
  Users,
  Command,
  Circle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

const initialFiles = [
  {
    name: 'App.jsx',
    language: 'javascript',
    content: `import React from 'react';
import { Workspace } from './Workspace';

export default function App() {
  return (
    <Workspace
      surface="studio"
      modules={['documents', 'tasks', 'boards', 'code']}
    />
  );
}`,
  },
  {
    name: 'models.py',
    language: 'python',
    content: `from django.db import models
from django.conf import settings

class CollaborativeDocument(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
`,
  },
  {
    name: 'schema.sql',
    language: 'sql',
    content: `CREATE TABLE IF NOT EXISTS collaborative_sessions (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(120) NOT NULL UNIQUE,
    document_state BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
  },
];

const STORAGE_KEY = 'convergedesk-code-workspace-files-v1';

function loadSavedFiles() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialFiles;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (file) =>
          file &&
          typeof file.name === 'string' &&
          typeof file.language === 'string' &&
          typeof file.content === 'string'
      )
    )
      return parsed;
  } catch {
    /* fall back to starter files */
  }
  return initialFiles;
}

const fileMeta = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'jsx' || ext === 'js')
    return { label: 'React', color: '#e8c56a', short: 'JS' };
  if (ext === 'py') return { label: 'Python', color: '#7ab6f5', short: 'PY' };
  if (ext === 'sql') return { label: 'SQL', color: '#a5a4ff', short: 'SQL' };
  if (ext === 'css') return { label: 'CSS', color: '#7dc9ff', short: 'CSS' };
  if (ext === 'html') return { label: 'HTML', color: '#e8966a', short: 'HTM' };
  return { label: 'File', color: '#9ba1a6', short: 'TXT' };
};

export const CodeWorkspacePage = () => {
  const [files, setFiles] = useState(loadSavedFiles);
  const [runOutput, setRunOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const yTextRef = useRef(null);

  const { success } = useToast();
  const currentFile = files[activeFileIndex] || files[0];
  const meta = fileMeta(currentFile?.name || '');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch {
      /* storage may be unavailable */
    }
  }, [files]);

  useEffect(() => {
    if (!currentFile) return;
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      `convergedesk-project-${currentFile.name}`,
      ydoc
    );
    const ytext = ydoc.getText('content');
    yTextRef.current = ytext;
    if (ytext.length === 0 && currentFile.content) {
      ydoc.transact(() => {
        ytext.insert(0, currentFile.content);
      });
    }
    const syncContent = () => {
      const sharedContent = ytext.toString();
      setFiles((previousFiles) =>
        previousFiles.map((file) =>
          file.name === currentFile.name ? { ...file, content: sharedContent } : file
        )
      );
    };
    ytext.observe(syncContent);
    const handleStatus = ({ status }) => setIsConnected(status === 'connected');
    provider.on('status', handleStatus);
    syncContent();
    return () => {
      ytext.unobserve(syncContent);
      provider.off('status', handleStatus);
      provider.destroy();
      ydoc.destroy();
      yTextRef.current = null;
      setIsConnected(false);
    };
  }, [currentFile?.name]);

  const handleContentChange = (newContent) => {
    if (newContent === undefined) return;
    const ytext = yTextRef.current;
    if (ytext) {
      const currentSharedContent = ytext.toString();
      if (currentSharedContent !== newContent) {
        ytext.doc.transact(() => {
          ytext.delete(0, ytext.length);
          if (newContent.length > 0) ytext.insert(0, newContent);
        });
      }
    } else {
      setFiles((previousFiles) =>
        previousFiles.map((file, index) =>
          index === activeFileIndex ? { ...file, content: newContent } : file
        )
      );
    }
  };

  const handleRunCode = () => {
    if (!currentFile) return;
    const extension = currentFile.name.split('.').pop()?.toLowerCase();
    if (!['js', 'jsx'].includes(extension || '')) {
      setIsOutputOpen(true);
      setRunOutput([
        'Run supports .js/.jsx files only. TypeScript/TSX and Python require a configured execution or preview service.',
      ]);
      return;
    }
    setIsRunning(true);
    setIsOutputOpen(true);
    setRunOutput([]);
    const workerSource =
      "self.onmessage=function(event){var output=[];function fmt(args){return args.map(function(v){try{return typeof v==='string'?v:JSON.stringify(v)}catch(e){return String(v)}}).join(' ')};['log','info','warn','error'].forEach(function(t){console[t]=function(){output.push(t.toUpperCase()+': '+fmt(Array.from(arguments)))}});try{(new Function(event.data))();self.postMessage(output.length?output:['Program finished with no console output.'])}catch(e){self.postMessage(['ERROR: '+(e&&e.stack?e.stack:String(e))])}}";
    const blobUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    const worker = new Worker(blobUrl);
    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      setRunOutput(['Stopped: execution exceeded 2 seconds.']);
      setIsRunning(false);
    }, 2000);
    worker.onmessage = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      setRunOutput(event.data);
      setIsRunning(false);
    };
    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      setRunOutput(['ERROR: ' + event.message]);
      setIsRunning(false);
    };
    worker.postMessage(currentFile.content);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      success('Copied to clipboard', currentFile.name);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleAddFile = () => {
    const filename = prompt('Name the new file (e.g. index.js):');
    if (!filename || !filename.trim()) return;
    const ext = filename.split('.').pop() || '';
    const lang = ext === 'py' ? 'python' : ext === 'sql' ? 'sql' : ext === 'css' ? 'css' : 'javascript';
    const newFile = {
      name: filename.trim(),
      language: lang,
      content: `// ${filename.trim()}\n`,
    };
    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    setIsExplorerOpen(false);
    success('File added', filename.trim());
  };

  if (!currentFile) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0b0c0e] text-[#9ba1a6]">
        No files in this workspace.
      </div>
    );
  }

  const lineCount = currentFile.content.split('\n').length;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#0b0c0e] text-[#d6d9dd]">
      {/* Workspace toolbar */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-[#101113] px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={() => setIsExplorerOpen(!isExplorerOpen)}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#9ba1a6] hover:bg-white/[0.06] hover:text-white md:hidden"
            aria-label="Toggle file explorer"
          >
            <Files className="h-4 w-4" />
          </button>
          <span className="font-display text-[12px] font-semibold text-[#f4f4f2]">
            Collaborative code
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-[#9ba1a6] sm:flex">
            <Command className="h-2.5 w-2.5" /> studio
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isConnected
                ? 'bg-[#2bd76b]/10 text-[#46d98a]'
                : 'bg-[#ffd000]/10 text-[#ffc53d]'
            }`}
          >
            {isConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {isConnected ? 'Live sync' : 'Offline draft'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-white/[0.08] px-2 py-1 text-[10px] text-[#9ba1a6] sm:flex">
            <Users className="h-3 w-3" /> 2 peers
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            leftIcon={
              copied ? <Check className="h-3.5 w-3.5 text-[#46d98a]" /> : <Copy className="h-3.5 w-3.5" />
            }
            className="text-[#c3c7cc] hover:bg-white/[0.06] hover:text-white"
          >
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOutputOpen(!isOutputOpen)}
            leftIcon={<PanelBottom className="h-3.5 w-3.5" />}
            className="hidden text-[#c3c7cc] hover:bg-white/[0.06] hover:text-white sm:inline-flex"
          >
            Output
          </Button>
          <Button
            size="sm"
            variant="accent"
            onClick={handleRunCode}
            disabled={isRunning}
            leftIcon={<Play className="h-3 w-3" />}
            className="!h-7 !rounded-[7px] !px-3 !text-[11px]"
          >
            {isRunning ? 'Running…' : 'Run'}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Activity rail */}
        <div className="hidden w-11 shrink-0 flex-col items-center gap-2 border-r border-white/[0.07] bg-[#0c0d0f] py-3 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#8b8aff]/15 text-[#a5a4ff]">
            <Files className="h-4 w-4" />
          </span>
          <button
            onClick={() => setIsOutputOpen(!isOutputOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[#8f959c] hover:bg-white/[0.06] hover:text-white"
            title="Toggle output"
          >
            <Terminal className="h-4 w-4" />
          </button>
          <button
            onClick={handleRunCode}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[#8f959c] hover:bg-white/[0.06] hover:text-white"
            title="Run current file"
          >
            <Play className="h-4 w-4" />
          </button>
        </div>

        {/* Explorer */}
        <aside
          className={`${
            isExplorerOpen ? 'absolute inset-y-0 left-0 z-20 flex w-60' : 'hidden'
          } shrink-0 flex-col border-r border-white/[0.07] bg-[#0f1011] md:static md:flex md:w-[232px]`}
        >
          <div className="flex h-9 items-center justify-between border-b border-white/[0.06] px-3">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-[#9ba1a6]">
              Explorer
            </span>
            <button
              onClick={handleAddFile}
              className="rounded-[4px] p-1 text-[#8f959c] hover:bg-white/[0.06] hover:text-white"
              title="New file"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 text-[10.5px] text-[#9ba1a6]">
            <ChevronDown className="h-3 w-3" />
            <span className="font-medium text-[#c3c7cc]">PROJECT-SPRINT-ALPHA</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {files.map((file, idx) => {
              const fm = fileMeta(file.name);
              const isActive = idx === activeFileIndex;
              return (
                <button
                  key={`${file.name}-${idx}`}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    setIsExplorerOpen(false);
                  }}
                  className={`group flex w-full items-center gap-2 rounded-[5px] px-2 py-[5px] text-left text-[11.5px] transition-colors ${
                    isActive
                      ? 'bg-[#8b8aff]/12 text-[#f4f4f2]'
                      : 'text-[#9ba1a6] hover:bg-white/[0.05] hover:text-[#f4f4f2]'
                  }`}
                >
                  <span
                    className="font-mono text-[8px] font-bold"
                    style={{ color: fm.color }}
                  >
                    {fm.short}
                  </span>
                  <span className="truncate">{file.name}</span>
                  {isActive && <Circle className="ml-auto h-1.5 w-1.5 fill-[#a5a4ff] text-[#a5a4ff]" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleAddFile}
            className="flex items-center gap-1.5 border-t border-white/[0.06] px-3 py-2.5 text-[10.5px] text-[#9ba1a6] hover:text-white"
          >
            <Plus className="h-3 w-3" /> New file
          </button>
        </aside>

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile file strip */}
          <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#101113] px-2 py-1.5 md:hidden">
            {files.map((file, idx) => (
              <button
                key={`${file.name}-m-${idx}`}
                onClick={() => setActiveFileIndex(idx)}
                className={`shrink-0 rounded-[5px] px-2 py-1 font-mono text-[10px] ${
                  idx === activeFileIndex
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#8f959c]'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="hidden h-9 shrink-0 items-stretch overflow-x-auto border-b border-white/[0.07] bg-[#0f1011] md:flex">
            {files.map((file, idx) => {
              const fm = fileMeta(file.name);
              const isActive = idx === activeFileIndex;
              return (
                <button
                  key={`tab-${file.name}-${idx}`}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`group relative flex shrink-0 items-center gap-2 border-r border-white/[0.06] px-3.5 text-[11px] transition-colors ${
                    isActive
                      ? 'bg-[#0b0c0e] text-[#f4f4f2]'
                      : 'text-[#8f959c] hover:bg-white/[0.03] hover:text-[#c3c7cc]'
                  }`}
                >
                  <span className="font-mono text-[8px] font-bold" style={{ color: fm.color }}>
                    {fm.short}
                  </span>
                  {file.name}
                  {isActive && <span className="absolute inset-x-0 top-0 h-[2px] bg-[#8b8aff]" />}
                </button>
              );
            })}
          </div>

          {/* Breadcrumb */}
          <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-white/[0.05] px-4 font-mono text-[10px] text-[#8f959c]">
            <span>project-sprint-alpha</span>
            <span className="text-[#5c6166]">/</span>
            <span className="text-[#c3c7cc]">{currentFile.name}</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#46d98a]" /> Saved
            </span>
          </div>

          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language={currentFile.language}
              theme="vs-dark"
              value={currentFile.content}
              onChange={handleContentChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 14 },
                lineNumbersMinChars: 4,
                renderLineHighlight: 'gutter',
              }}
            />
          </div>

          {/* Output drawer */}
          {isOutputOpen && (
            <div className="shrink-0 border-t border-white/[0.07] bg-[#0f1011]">
              <div className="flex h-8 items-center gap-2 px-3">
                <Terminal className="h-3 w-3 text-[#8b8aff]" />
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[#c3c7cc]">
                  Output
                </span>
                <button
                  onClick={() => setRunOutput([])}
                  className="ml-auto text-[10px] text-[#8f959c] hover:text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOutputOpen(false)}
                  className="text-[10px] text-[#8f959c] hover:text-white"
                  aria-label="Close output"
                >
                  ×
                </button>
              </div>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words px-3 pb-3 font-mono text-[10.5px] leading-relaxed text-[#9ba1a6]">
                {runOutput.length
                  ? runOutput.join('\n')
                  : 'Run a .js or .jsx file to see console output here.'}
              </pre>
            </div>
          )}

          {/* Status bar */}
          <div className="flex h-6 shrink-0 items-center justify-between gap-3 bg-[#8b8aff] px-3 font-mono text-[9.5px] text-[#0a0b0d]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                {isConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                {isConnected ? 'Synced' : 'Local'}
              </span>
              <span className="opacity-70">main</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{lineCount} lines</span>
              <span className="hidden sm:inline">{meta.label}</span>
              <span>UTF-8</span>
              <span>Spaces: 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
