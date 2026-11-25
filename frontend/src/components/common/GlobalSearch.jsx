import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FolderKanban,
  CheckSquare,
  Presentation,
  Code2,
  Video,
  Settings,
  FileText,
  X,
  ArrowRight,
  Home,
} from 'lucide-react';
import { listProjects } from '../../api/projects';

const QUICK_NAV = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Whiteboards', path: '/whiteboards', icon: Presentation },
  { label: 'Code workspace', path: '/code', icon: Code2 },
  { label: 'Team & meetings', path: '/meetings', icon: Video },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      listProjects().then(setProjects).catch(() => setProjects([]));
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredNav = QUICK_NAV.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0a0b0d]/55 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-[12vh] sm:p-6">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-menu)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4">
            <Search className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects and workspace…"
              className="w-full bg-transparent py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] sm:block">
              ESC
            </kbd>
          </div>

          <div className="max-h-[420px] space-y-4 overflow-y-auto p-2.5">
            {filteredNav.length > 0 && (
              <div>
                <p className="sx-eyebrow px-2.5 py-1.5">Go to</p>
                <div className="space-y-0.5">
                  {filteredNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelect(item.path)}
                        className="group flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[13px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                          {item.label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <p className="sx-eyebrow px-2.5 py-1.5">Projects · {filteredProjects.length}</p>
                {filteredProjects.length === 0 ? (
                  <p className="px-2.5 py-2 text-xs text-[var(--text-muted)]">
                    No projects match “{query}”.
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleSelect(`/projects/${project.id}`)}
                        className="group flex w-full items-center justify-between gap-3 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-[var(--border-subtle)] bg-[var(--surface-inset)] font-display text-[11px] font-bold text-[var(--accent)]">
                            {(project?.name?.[0] || 'P').toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]">
                              {project.name}
                            </span>
                            {project.description && (
                              <span className="block truncate text-[11.5px] text-[var(--text-muted)]">
                                {project.description}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-2 py-0.5 text-[10px] font-semibold capitalize text-[var(--text-muted)]">
                          {project.role || 'member'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filteredNav.length === 0 && filteredProjects.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="sx-title text-[var(--text-primary)]">No results</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Nothing matches “{query}”.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
