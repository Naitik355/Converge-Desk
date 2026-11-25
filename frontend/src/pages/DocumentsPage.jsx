import React, { useEffect, useRef, useState } from 'react';
import { CollaborativeEditor } from '../components/documents/CollaborativeEditor';
import { getProjectDocuments, createProjectDocument } from '../api/documents';
import { listProjects } from '../api/projects';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileText,
  Plus,
  Loader2,
  UploadCloud,
  FolderKanban,
  ChevronDown,
  Search,
  BookOpen,
  PanelLeft,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const DocumentsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const fileInputRef = useRef(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function init() {
      try {
        const projs = await listProjects();
        const list = Array.isArray(projs) ? projs : projs.results || [];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
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
        setSelectedDocument(docs.length > 0 ? docs[0] : null);
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
      success('Document created', `“${doc.title}” is ready.`);
    } catch (err) {
      toastError('Creation failed', err?.message || 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setUploading(true);
    const title =
      file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Uploaded document';

    try {
      const text = await file.text();
      const res = await createProjectDocument(selectedProjectId, title, text);
      const doc = res.document || res;
      setDocuments((prev) => [doc, ...prev]);
      setSelectedDocument(doc);
      success('File imported', `“${title}” added to the project.`);
    } catch (err) {
      toastError('Upload failed', err?.message || 'Could not read file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );
  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col text-[var(--text-primary)]">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        accept=".txt,.md,.markdown,.html,.htm,.json,.csv,.js,.jsx,.ts,.tsx,.py,.sql"
        className="hidden"
      />

      {/* Workspace header */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface)] px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border-subtle)] text-[var(--text-muted)] lg:hidden"
            aria-label="Toggle document library"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[13px] font-semibold tracking-[-0.01em]">Documents</h1>
            <p className="truncate text-[10.5px] text-[var(--text-muted)]">
              {activeProject?.name || 'No project selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            leftIcon={
              uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )
            }
          >
            <span className="hidden sm:inline">Import</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
          <span className="text-[12px]">Opening the document library…</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="Create a project first"
            description="Documents live inside projects. Create a workspace, then start writing."
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* Library */}
          <aside
            className={`${
              isLibraryOpen ? 'absolute inset-y-0 left-0 z-30 flex w-72 bg-[var(--surface)]' : 'hidden'
            } shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-raised)] lg:static lg:flex lg:w-[272px]`}
          >
            {/* Project selector */}
            <div className="border-b border-[var(--border-subtle)] p-3">
              <label className="sx-eyebrow mb-1.5 block px-0.5">Project</label>
              <div className="relative">
                <FolderKanban className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="h-9 w-full cursor-pointer appearance-none rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface)] pl-8 pr-7 font-display text-[11.5px] font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </div>

            <div className="border-b border-[var(--border-subtle)] p-3">
              <form onSubmit={handleCreateDoc} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="New document…"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 text-[11.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--ink)] text-[var(--on-ink)] transition-opacity hover:opacity-90 disabled:opacity-40"
                  aria-label="Create document"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4" />}
                </button>
              </form>
            </div>

            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a document"
                  className="h-8 w-full rounded-[7px] border border-[var(--border-subtle)] bg-[var(--surface)] pl-8 pr-2.5 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 pb-1 pt-3">
              <span className="sx-eyebrow">Library · {documents.length}</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {filteredDocs.length === 0 ? (
                <p className="px-2 py-3 text-[11.5px] text-[var(--text-muted)]">
                  {documents.length === 0 ? 'No documents in this project yet.' : 'No matches.'}
                </p>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = selectedDocument?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocument(doc);
                        setIsLibraryOpen(false);
                      }}
                      className={`group flex w-full items-start gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <FileText
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-medium">{doc.title}</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">
                          {doc.updated_at
                            ? new Date(doc.updated_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Project document'}
                        </span>
                      </span>
                      {isSelected && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border-t border-[var(--border-subtle)] px-4 py-3 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <UploadCloud className="h-3.5 w-3.5" /> Import a local file
            </button>
          </aside>

          {/* Reading / editing pane */}
          <div className="flex min-w-0 flex-1 flex-col bg-[var(--canvas)]">
            {selectedDocument ? (
              <>
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2.5 sm:px-6">
                  <div className="flex min-w-0 items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate font-display text-[12.5px] font-semibold">
                      {selectedDocument.title}
                    </span>
                    <span className="hidden rounded-full border border-[var(--border-subtle)] px-2 py-0.5 font-mono text-[9.5px] text-[var(--text-muted)] sm:inline">
                      doc-{selectedDocument.id}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[var(--text-muted)]">
                    Shared with project members
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="mx-auto max-w-4xl">
                    <CollaborativeEditor
                      key={selectedDocument.id}
                      documentId={selectedDocument.id}
                      className="shadow-[var(--shadow-sm)]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState
                  icon={<FileText className="h-5 w-5" />}
                  title="No document selected"
                  description="Pick a document from the library, create a new one, or import a local file."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
