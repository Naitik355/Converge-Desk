import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { RoleBadge } from '../common/Badge';
import { FolderKanban, MoreVertical, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

export const ProjectCard = ({
  project,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card hoverable className="relative flex flex-col justify-between group">
      <div>
        {/* Header: Icon, Role Badge, Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] text-[var(--signal-teal)] flex items-center justify-center font-bold text-sm shrink-0 border border-[var(--border-subtle)] shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <RoleBadge role={project.role} />
          </div>

          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] rounded-lg transition-colors cursor-pointer"
                aria-label="Project actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-[var(--surface-card)] rounded-xl shadow-2xl border border-[var(--border-subtle)] p-1 z-40 text-xs">
                    {onEdit && project.role !== 'viewer' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onEdit(project);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] rounded-lg text-left transition-colors cursor-pointer font-mono"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Project
                      </button>
                    )}
                    {onDelete && project.role === 'owner' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onDelete(project);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[var(--signal-coral)] hover:bg-rose-500/10 rounded-lg text-left font-medium transition-colors cursor-pointer font-mono"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Project
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title and Description */}
        <h3
          onClick={() => navigate(`/projects/${project.id}`)}
          className="font-display text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--signal-teal)] transition-colors cursor-pointer line-clamp-1"
        >
          {project.name}
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed min-h-[2rem]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
        <span>{formattedDate ? `CREATED ${formattedDate.toUpperCase()}` : 'ACTIVE // SYNCED'}</span>
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="flex items-center gap-1 font-semibold text-[var(--signal-teal)] hover:opacity-80 transition-colors group/btn cursor-pointer font-mono"
        >
          <span>OPEN</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
};
