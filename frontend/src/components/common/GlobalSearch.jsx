import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, Presentation, Code2, Video, Settings, X, ArrowRight } from 'lucide-react';
import { listProjects } from '../../api/projects';

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
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNavItems = [
    { label: 'Dashboard', path: '/', icon: <FolderKanban className="w-4 h-4 text-emerald-400" /> },
    { label: 'All Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4 text-teal-400" /> },
    { label: 'Task Management', path: '/tasks', icon: <CheckSquare className="w-4 h-4 text-emerald-400" /> },
    { label: 'Multiplayer Whiteboards', path: '/whiteboards', icon: <Presentation className="w-4 h-4 text-amber-400" /> },
    { label: 'Code Workspace (Yjs)', path: '/code', icon: <Code2 className="w-4 h-4 text-cyan-400" /> },
    { label: 'Meetings & Calls', path: '/meetings', icon: <Video className="w-4 h-4 text-rose-400" /> },
  ];

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredNav = quickNavItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-24 font-mono">
        <div className="relative w-full max-w-xl rounded-[var(--card-radius)] bg-[var(--surface-card)] shadow-2xl border-2 border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="flex items-center px-4 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]">
            <Search className="w-5 h-5 text-[var(--signal-teal)] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, workspaces, or features..."
              className="w-full bg-transparent px-3.5 py-4 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--surface-canvas)] rounded border border-[var(--border-subtle)]">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {/* Quick Navigation */}
            {filteredNav.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Navigation
                </p>
                <div className="space-y-0.5 mt-1">
                  {filteredNav.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-[var(--btn-radius)] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--signal-teal)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projects List */}
            {projects.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Projects ({filteredProjects.length})
                </p>
                {filteredProjects.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-[var(--text-muted)] italic">No matching projects found</p>
                ) : (
                  <div className="space-y-0.5 mt-1">
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleSelect(`/projects/${project.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-[var(--btn-radius)] transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-[var(--btn-radius)] bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--signal-teal)] flex items-center justify-center font-bold text-xs shrink-0">
                            {(project?.name?.[0] || 'P').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--signal-teal)] transition-colors truncate">{project.name}</p>
                            {project.description && (
                              <p className="text-xs text-[var(--text-muted)] truncate">{project.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-[var(--btn-radius)] bg-[var(--surface-canvas)] text-[var(--text-muted)] border border-[var(--border-subtle)] capitalize shrink-0 ml-2">
                          {project.role || 'member'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filteredNav.length === 0 && filteredProjects.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                No matching results for "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
