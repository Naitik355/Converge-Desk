import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  ExternalLink,
  Loader2,
  Trash2,
  UploadCloud,
  Search,
  Download,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import {
  createProjectDocument,
  getProjectDocuments,
  deleteDocument,
} from '../../api/documents';
import { CollaborativeEditor } from '../documents/CollaborativeEditor';

export const ProjectDocumentsPanel = ({ projectId, canEdit }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const { success, error: toastError } = useToast();

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getProjectDocuments(projectId);
      setDocuments(items);
      setSelectedDocument((current) =>
        current ? items.find((item) => item.id === current.id) || items[0] || null : items[0] || null
      );
    } catch (err) {
      toastError(
        'Could not load documents',
        err instanceof Error ? err.message : 'Check that the Docs API is configured.'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, toastError]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  // Clean filename into human readable title
  const cleanFilenameToTitle = (filename) => {
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
  };

  // Process text-based file from local storage
  const processUploadedFile = async (file) => {
    if (!file) return;

    setUploading(true);
    const docTitle = cleanFilenameToTitle(file.name) || 'Uploaded Document';

    try {
      const text = await file.text();
      const res = await createProjectDocument(projectId, docTitle, text);
      const newDoc = res.document || res;
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocument(newDoc);
      success('Document uploaded', `"${docTitle}" imported from local storage.`);
    } catch (err) {
      toastError(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not read or upload file.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      void processUploadedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (canEdit) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!canEdit) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processUploadedFile(file);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setCreating(true);
    try {
      const res = await createProjectDocument(projectId, cleanTitle);
      const newDoc = res.document || res;
      setDocuments((current) => [newDoc, ...current]);
      setSelectedDocument(newDoc);
      setTitle('');
      setShowCreateForm(false);
      success('Document created', 'Your collaborative document is ready to edit.');
    } catch (err) {
      toastError(
        'Could not create document',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (docId, docTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      return;
    }
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      setDocuments((current) => current.filter((d) => d.id !== docId));
      if (selectedDocument?.id === docId) {
        setSelectedDocument((current) => {
          const remaining = documents.filter((d) => d.id !== docId);
          return remaining[0] || null;
        });
      }
      success('Document deleted', `"${docTitle}" has been removed.`);
    } catch (err) {
      toastError(
        'Could not delete document',
        err instanceof Error ? err.message : 'Failed to delete.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Export current document content to local machine
  const handleExportDocument = () => {
    if (!selectedDocument) return;
    const content = selectedDocument.content || '';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDocument.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('Export started', 'Document downloaded as markdown.');
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative space-y-5"
    >
      {/* Hidden local storage file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept=".txt,.md,.markdown,.html,.htm,.json,.csv,.js,.jsx,.ts,.tsx,.py,.sql"
        className="hidden"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-400 bg-[#090e17]/95 backdrop-blur-sm pointer-events-none p-6 text-center shadow-2xl">
          <div className="mb-3 rounded-full bg-emerald-500/10 p-5 ring-1 ring-emerald-500/30">
            <UploadCloud className="h-10 w-10 text-emerald-400 animate-bounce" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Drop your file here</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            We will import your local file and initialize real-time collaborative editing instantly.
          </p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between glass-card p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">Collaborative Docs</h3>
            <span className="mono-label text-[var(--signal-teal)] bg-[var(--surface-raised)] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[10px]">
              CRDT LIVE
            </span>
          </div>
          <p className="mt-1 text-xs font-mono text-[var(--text-muted)]">
            Real-time peer synchronized documents backed by Yjs and PostgreSQL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadDocuments()}
            disabled={loading}
            leftIcon={loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--signal-teal)]" /> : <RefreshCw className="h-3.5 w-3.5" />}
          >
            REFRESH
          </Button>

          {canEdit && (
            <>
              {/* Upload from Local Storage Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload document from your computer (.md, .txt, .html, etc.)"
                className="inline-flex items-center gap-1.5 rounded-[var(--btn-radius)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-mono font-semibold text-[var(--signal-teal)] hover:border-[var(--signal-teal)] transition-all shadow-xs"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--signal-teal)]" />
                ) : (
                  <UploadCloud className="h-3.5 w-3.5 text-[var(--signal-teal)]" />
                )}
                <span>UPLOAD DOC</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateForm((current) => !current)}
                className="inline-flex items-center gap-1.5 rounded-[var(--btn-radius)] bg-[var(--signal-teal)] px-3 py-1.5 text-xs font-mono font-bold text-black hover:opacity-90 transition-opacity shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>NEW DOC</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-[#0f1622] p-4 sm:flex-row shadow-xl"
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
            autoFocus
            placeholder="Document title, e.g. Technical Architecture Specification"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#090d14] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Main Grid: Sidebar + Editor */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left Sidebar: Document List & Search */}
        <aside className="flex flex-col rounded-2xl border border-slate-800/80 bg-[#0d131c] p-3.5 shadow-xl">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs..."
              className="w-full rounded-lg border border-slate-800/80 bg-[#080c12] pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/80 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Documents ({filteredDocuments.length})
            </span>
            {canEdit && (
              <span className="text-[10px] text-slate-500">
                Drag & drop files
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Loading documents…</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800/80 rounded-xl my-2">
              <FileCode className="h-6 w-6 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">
                {searchQuery ? 'No matching documents' : 'No documents yet'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {canEdit ? 'Create or drop a file from your computer.' : 'Documents will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-[620px] pr-0.5">
              {filteredDocuments.map((document) => {
                const isSelected = selectedDocument?.id === document.id;
                return (
                  <div
                    key={document.id}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#15202e] text-slate-100 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                        : 'text-slate-400 hover:bg-[#111925] hover:text-slate-200 border border-transparent'
                    }`}
                    onClick={() => setSelectedDocument(document)}
                  >
                    {/* Active accent bar */}
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-emerald-400" />
                    )}

                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <FileText
                        className={`mt-0.5 h-4 w-4 shrink-0 transition-colors ${
                          isSelected ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-xs font-semibold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                          {document.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {document.created_by_username ? `@${document.created_by_username} • ` : ''}
                          {new Date(document.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(document.id, document.title);
                        }}
                        disabled={deletingId === document.id}
                        title="Delete document"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                      >
                        {deletingId === document.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Local storage upload tip banner */}
          <div className="mt-3 rounded-xl border border-slate-800/80 bg-[#080c13] p-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-slate-400">Import local notes</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
            >
              Browse <UploadCloud className="h-3 w-3" />
            </button>
          </div>
        </aside>

        {/* Right Section: Collaborative Editor */}
        <section className="min-w-0">
          {selectedDocument ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
                <div>
                  <h4 className="text-lg font-bold text-slate-100 tracking-tight">
                    {selectedDocument.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created {new Date(selectedDocument.created_at).toLocaleDateString()}
                    {selectedDocument.created_by_username ? ` by @${selectedDocument.created_by_username}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportDocument}
                    title="Export document as markdown"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0f1622] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </button>

                  {selectedDocument.embed_url && (
                    <a
                      href={selectedDocument.embed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 bg-[#0f1622] px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                      title="Open legacy Etherpad view"
                    >
                      Etherpad <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Collaborative Editor Engine */}
              <CollaborativeEditor
                key={selectedDocument.id}
                documentId={selectedDocument.id}
                readOnly={!canEdit}
              />
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#0c1017] p-8 text-center shadow-xl">
              <div className="mb-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-4 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <FileText className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-200">No document selected</h4>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Choose a document from the left, or upload a markdown/text file from your computer to begin editing together.
              </p>
              {canEdit && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/60 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Upload local file</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create blank doc</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProjectDocumentsPanel;
