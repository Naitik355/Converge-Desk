import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleBadge } from '../common/Badge';
import { MoreVertical, Edit2, Trash2, ArrowUpRight, FolderKanban } from 'lucide-react';

const TINTS = [
  ['var(--accent-soft)', 'var(--accent)'],
  ['var(--success-soft)', 'var(--success)'],
  ['var(--warning-soft)', 'var(--warning)'],
  ['var(--info-soft)', 'var(--info)'],
];

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const tint = TINTS[(Number(project.id) || 0) % TINTS.length];

  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative flex cursor-pointer flex-col justify-between rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition-all duration-150 hover:-translate-y-[1px] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lift)]"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] font-display text-[14px] font-bold"
              style={{ backgroundColor: tint[0], color: tint[1] }}
            >
              {(project.name?.[0] || 'P').toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="sx-eyebrow">Project</p>
              <RoleBadge role={project.role} />
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-[6px] p-1.5 text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                aria-label="Project actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-40 mt-1.5 w-40 overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface)] p-1 shadow-[var(--shadow-menu)]">
                    {onEdit && project.role !== 'viewer' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onEdit(project);
                        }}
                        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit project
                      </button>
                    )}
                    {onDelete && project.role === 'owner' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onDelete(project);
                        }}
                        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[var(--error)] transition-colors hover:bg-[var(--error-soft)] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete project
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <h3 className="mt-4 font-display text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-1">
          {project.name}
        </h3>
        <p className="mt-1 min-h-[32px] text-[12px] leading-relaxed text-[var(--text-muted)] line-clamp-2">
          {project.description || 'No description yet — open the project to add context.'}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
        <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
          <FolderKanban className="h-3 w-3" />
          {formattedDate ? `Created ${formattedDate}` : 'Active workspace'}
        </span>
        <span className="flex items-center gap-1 font-display text-[11px] font-semibold text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent)]">
          Open
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </div>
  );
};
