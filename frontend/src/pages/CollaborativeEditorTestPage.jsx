import React, { useEffect, useRef, useState } from 'react';
import { CollaborativeEditor } from '../components/documents/CollaborativeEditor';
import { getProjectDocuments, createProjectDocument } from '../api/documents';
import { listProjects } from '../api/projects';
import { Button } from '../components/common/Button';
import { FileText, Plus, Loader2, UploadCloud, Sparkles, Folder } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const CollaborativeEditorTestPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function init() {
      try {
        const projs = await listProjects();
        const list = Array.isArray(projs) ? projs : projs.results || [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    async function loadDocs() {
      try {
        const docs = await getProjectDocuments(selectedProjectId);
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocument(docs[0]);
        } else {
          setSelectedDocument(null);
        }
      } catch (err) {
        console.error('Failed to load project docs:', err);
      }
    }
    loadDocs();
  }, [selectedProjectId]);

  const handleCreateDoc = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedProjectId) return;
    setCreating(true);
    try {
      const res = await createProjectDocument(selectedProjectId, newTitle.trim());
      const doc = res.document || res;
      setDocuments((prev) => [doc, ...prev]);
      setSelectedDocument(doc);
      setNewTitle('');
      success('Document created', `"${doc.title}" is ready.`);
    } catch (err) {
      toastError('Creation failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setUploading(true);
    const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Uploaded Document';

    try {
      const text = await file.text();
      const res = await createProjectDocument(selectedProjectId, title, text);
      const doc = res.document || res;
      setDocuments((prev) => [doc, ...prev]);
      setSelectedDocument(doc);
      success('File uploaded', `"${title}" imported successfully from local storage.`);
    } catch (err) {
      toastError('Upload failed', err instanceof Error ? err.message : 'Could not read file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 p-6 md:p-8">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        accept=".txt,.md,.markdown,.html,.htm,.json,.csv,.js,.jsx,.ts,.tsx,.py,.sql"
        className="hidden"
      />

      <div className="max-w-6xl mx-auto space-y-6 text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-5 border-2 border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)]">Collaborative Docs Test Room</h2>
              <span className="inline-flex items-center gap-1 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] px-2 py-0.5 text-[10px] font-mono font-semibold text-[var(--signal-teal)] border border-[var(--border-subtle)]">
                <Sparkles className="h-2.5 w-2.5" />
                CRDT MULTIPLAYER
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
              // Open this URL in two separate browser windows or tabs to test real-time CRDT multi-cursor editing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {projects.length > 0 && (
              <div className="flex items-center gap-2 bg-[var(--surface-canvas)] px-3 py-1.5 rounded-[var(--btn-radius)] border border-[var(--border-subtle)] font-mono text-xs">
                <Folder className="h-3.5 w-3.5 text-[var(--signal-teal)]" />
                <span className="font-medium text-[var(--text-muted)]">Project:</span>
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="font-semibold bg-transparent text-[var(--text-primary)] outline-none cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[var(--surface-card)] text-[var(--text-primary)]">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-[var(--btn-radius)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-mono font-semibold text-[var(--text-primary)] hover:border-[var(--signal-teal)] transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5 text-[var(--signal-teal)]" />
              )}
              <span>Upload local doc</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 text-[var(--text-muted)] gap-2 font-mono">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--signal-teal)]" />
            <span className="text-xs">Connecting to project workspace…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <form onSubmit={handleCreateDoc} className="space-y-2 glass-card p-3 border border-[var(--border-subtle)]">
                <input
                  type="text"
                  placeholder="New document name..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs font-mono rounded-[var(--btn-radius)] border border-[var(--border-subtle)] bg-[var(--surface-canvas)] px-3 py-2 text-[var(--text-primary)] placeholder:[var(--text-muted)] outline-none focus:border-[var(--signal-teal)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-[var(--btn-radius)] bg-[var(--signal-teal)] px-3 py-1.5 text-xs font-mono font-bold text-black hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>Create Document</span>
                </button>
              </form>

              <div className="glass-card p-3 space-y-1.5 border border-[var(--border-subtle)] font-mono">
                <p className="mono-label text-[var(--text-muted)] px-2 py-1">
                  DOCUMENTS ({documents.length})
                </p>
                {documents.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] p-2">No documents yet.</p>
                ) : (
                  documents.map((d) => {
                    const isSelected = selectedDocument?.id === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDocument(d)}
                        className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-[var(--btn-radius)] text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[var(--surface-raised)] text-[var(--signal-teal)] border border-[var(--signal-teal)] font-bold'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] border border-transparent'
                        }`}
                      >
                        <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-[var(--signal-teal)]' : 'text-[var(--text-muted)]'}`} />
                        <span className="truncate">{d.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main editor container */}
            <div>
              {selectedDocument ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                      {selectedDocument.title}
                    </h3>
                    <span className="text-[11px] text-[var(--signal-teal)] font-mono bg-[var(--surface-raised)] px-2.5 py-1 rounded-[var(--btn-radius)] border border-[var(--border-subtle)]">
                      Room: convergedesk-document-{selectedDocument.id}
                    </span>
                  </div>
                  <CollaborativeEditor
                    key={selectedDocument.id}
                    documentId={selectedDocument.id}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-16 border border-dashed border-[var(--border-subtle)] bg-[var(--surface-canvas)] rounded-[var(--card-radius)] text-center text-[var(--text-muted)] font-mono text-xs">
                  Select or upload a document to start collaborative editing.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeEditorTestPage;
