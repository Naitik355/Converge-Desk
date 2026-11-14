import React, { useEffect, useState , useRef} from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  Code2,
  FileCode,
  Plus,
  Copy,
  Check,
  Users,
  Wifi,
  WifiOff,
  Terminal,
  Folder,
  Play,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

const initialFiles = [
  {
    name: 'App.jsx',
    language: 'javascript',
    content: `import React from 'react';
import { ConvergeWorkspace } from './ConvergeDesk';

export default function App() {
  return (
    <ConvergeWorkspace
      theme="modern-slate"
      features={['whiteboards', 'tasks', 'code', 'meetings']}
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
    if (Array.isArray(parsed) && parsed.every((file) => file && typeof file.name === 'string' && typeof file.language === 'string' && typeof file.content === 'string')) return parsed;
  } catch { /* Use starter files if browser storage is unavailable or invalid. */ }
  return initialFiles;
}

export const CodeWorkspacePage = () => {
  const [files, setFiles] = useState(loadSavedFiles);
  const [runOutput, setRunOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch { /* Storage may be unavailable. */ }
  }, [files]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const yTextRef=useRef(null);

  const { success } = useToast();
  const currentFile = files[activeFileIndex] || files[0];
  useEffect(()=>{
    if(!currentFile) return;
    const ydoc=new Y.Doc();
    const provider=new WebsocketProvider(
      'ws://localhost:1234',
      `convergedesk-project-${currentFile.name}`,
      ydoc
    );
    const ytext=ydoc.getText('content');
    yTextRef.current=ytext;
    if(ytext.length===0 && currentFile.content){
      ydoc.transact(()=>{
        ytext.insert(0,currentFile.content);
      });
    }
    const syncContent=()=>{
      const sharedContent=ytext.toString();
      setFiles((previousFiles)=>
        previousFiles.map((file)=>
          file.name===currentFile.name ? {...file,content:sharedContent} : file

        )
      );
    };
    ytext.observe(syncContent);
    const handleStatus=({status})=>{
      setIsConnected(status==='connected');
    };
    provider.on('status',handleStatus);
    syncContent();
    return ()=>{
      ytext.unobserve(syncContent);
      provider.off('status',handleStatus);
      provider.destroy();
      ydoc.destroy();
      yTextRef.current=null;
      setIsConnected(false);
    };
  },[currentFile?.name]
  )

  const handleContentChange=(newContent)=>{
    if(newContent===undefined) return;
    const ytext=yTextRef.current;
    if(ytext){
      const currentSharedContent=ytext.toString();
      if(currentSharedContent!==newContent){
        ytext.doc.transact(()=>{
          ytext.delete(0,ytext.length);
          if(newContent.length>0){
            ytext.insert(0,newContent);
          }
        });
      }
    }else{
      setFiles((previousFiles)=>
        previousFiles.map((file,index)=>
        index===activeFileIndex ? {...file,content:newContent}:file
      )
      );
    }
  };

  const handleRunCode = () => {
    if (!currentFile) return;
    const extension = currentFile.name.split('.').pop()?.toLowerCase();
    if (!['js', 'jsx'].includes(extension || '')) {
      setRunOutput(['Run supports .js/.jsx files only. TypeScript/TSX and Python require a configured execution or preview service.']);
      return;
    }
    setIsRunning(true);
    setRunOutput([]);
    const workerSource = "self.onmessage=function(event){var output=[];function fmt(args){return args.map(function(v){try{return typeof v==='string'?v:JSON.stringify(v)}catch(e){return String(v)}}).join(' ')};['log','info','warn','error'].forEach(function(t){console[t]=function(){output.push(t.toUpperCase()+': '+fmt(Array.from(arguments)))}});try{(new Function(event.data))();self.postMessage(output.length?output:['Program finished with no console output.'])}catch(e){self.postMessage(['ERROR: '+(e&&e.stack?e.stack:String(e))])}}";
    const blobUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    const worker = new Worker(blobUrl);
    const timeout = window.setTimeout(() => { worker.terminate(); URL.revokeObjectURL(blobUrl); setRunOutput(['Stopped: execution exceeded 2 seconds.']); setIsRunning(false); }, 2000);
    worker.onmessage = (event) => { window.clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(blobUrl); setRunOutput(event.data); setIsRunning(false); };
    worker.onerror = (event) => { window.clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(blobUrl); setRunOutput(['ERROR: ' + event.message]); setIsRunning(false); };
    worker.postMessage(currentFile.content);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    success('Copied to Clipboard', `Contents of ${currentFile.name} copied.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFile = () => {
    const filename = prompt('Enter new file name (e.g. index.js):');
    if (!filename || !filename.trim()) return;
    const ext = filename.split('.').pop() || '';
    const lang = ext === 'py' ? 'python' : ext === 'sql' ? 'sql' : 'javascript';
    const newFile = {
      name: filename.trim(),
      language: lang,
      content: `// ${filename.trim()}\n`,
    };
    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    success('File Added', filename);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[var(--surface-canvas)] text-[var(--text-primary)] font-mono">
      {/* Top Workspace Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--signal-teal)] font-bold text-xs uppercase tracking-wider">
            <Code2 className="w-4 h-4" />
            <span>Collaborative Code Workspace</span>
          </div>

          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--btn-radius)] text-[11px] font-semibold border ${
              isConnected
                ? 'bg-[var(--surface-raised)] text-[var(--signal-teal)] border-[var(--border-subtle)]'
                : 'bg-[var(--surface-raised)] text-[var(--signal-amber)] border-[var(--border-subtle)]'
            }`}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isConnected ? 'Yjs Connected' : 'Connecting to Yjs...'}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Active Collaborators Presence Mockup */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--surface-raised)] px-2.5 py-1 rounded-[var(--btn-radius)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <Users className="w-3.5 h-3.5 text-[var(--signal-teal)] mr-1" />
            <span className="w-5 h-5 rounded-full bg-[var(--signal-teal)] flex items-center justify-center font-bold text-[10px] text-black">
              U1
            </span>
            <span className="w-5 h-5 rounded-full bg-[var(--signal-azure)] flex items-center justify-center font-bold text-[10px] text-white -ml-2">
              U2
            </span>
            <span className="text-[11px] text-[var(--text-primary)] ml-1.5">2 Peers</span>
          </div>

          <Button size="sm" variant="outline" onClick={handleRunCode} disabled={isRunning || !currentFile} leftIcon={<Play className="w-3.5 h-3.5" />} className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-card)]">
            {isRunning ? 'Running…' : 'Run'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[var(--signal-teal)]" /> : <Copy className="w-3.5 h-3.5" />}
            className="h-8 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]"><Terminal className="h-3.5 w-3.5 text-[var(--signal-teal)]" /> Run Output <button type="button" onClick={() => setRunOutput([])} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]">Clear</button></div>
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-[var(--text-muted)]">{runOutput.length ? runOutput.join('\n') : 'Run a .js or .jsx file to see output here.'}</pre>
      </div>

      {/* Main Workspace Body: File Tree + Code Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Explorer */}
        <div className="w-56 bg-[var(--surface-card)] border-r border-[var(--border-subtle)] flex flex-col shrink-0">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[var(--signal-teal)]" /> Files
            </span>
            <button
              onClick={handleAddFile}
              className="p-1 hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded transition-colors"
              title="Add file"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
            {files.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--btn-radius)] text-xs font-medium text-left transition-colors ${
                  idx === activeFileIndex
                    ? 'bg-[var(--signal-teal)] text-black font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Code Editor Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#070b10]">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#090d14] border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <span className="text-emerald-400 font-semibold">{currentFile.name}</span>
              <span className="text-slate-500 text-[10px]">({currentFile.language})</span>
            </div>
          </div>

          {/* Code Textarea / Line Number Grid */}
          <div className='flex-1 overflow-hidden'>
            <Editor height="100%" language={currentFile.language==='javascript'?'javascript':currentFile.language} theme='vs-dark' value={currentFile.content} onChange={handleContentChange} options={{minimap:{enabled:false},fontSize:13,automaticLayout:true,scrollBeyondLastLine:false,wordWrap:'on',}}/>
          </div>
        </div>
      </div>
    </div>
  );
};
