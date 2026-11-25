import React, { useCallback, useEffect, useState } from "react";
import { UserPlus, RefreshCw, Trash2, Users } from "lucide-react";
import {
  addProjectMember,
  getProjectMembers,
  getProjectInvitations,
  revokeProjectInvitation,
  removeProjectMember,
  updateProjectMember,
} from "../../api/projects";

const roleValue = (role) => String(role).toUpperCase();

export const ProjectMembersPanel = ({ projectId, isOwner }) => {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [username, setUsername] = useState("");
  const [newRole, setNewRole] = useState("EDITOR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const memberList = await getProjectMembers(projectId);
      setMembers(memberList);

      if (isOwner) {
        const invitationList = await getProjectInvitations(projectId);
        setInvitations(invitationList);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load project members.",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, isOwner]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const runMemberAction = async (action, successMessage) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(successMessage);
      await loadMembers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The member action failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getUserId = (member) => member.user_id ?? member.id;

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 space-y-6 text-[var(--text-primary)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="sx-eyebrow">Collaboration</p>
          <h3 className="mt-1 font-display text-[16px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Project members
          </h3>
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
            Manage who can access this project and what they can do.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadMembers()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--accent)]' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--error)]/30 bg-[var(--error-soft)] p-3 text-xs text-[var(--error)]"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-[8px] border border-[var(--success)]/25 bg-[var(--success-soft)] p-3 text-[11.5px] text-[var(--success)]"
        >
          {notice}
        </p>
      )}

      {isOwner && (
        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 border-b border-[var(--border-subtle)] pb-6"
          onSubmit={(event) => {
            event.preventDefault();
            const cleanUsername = username.trim();
            if (!cleanUsername) return;
            void runMemberAction(
              () => addProjectMember(projectId, cleanUsername, newRole),
              `Request proceeded for ${cleanUsername}.`,
            ).then(() => setUsername(""));
          }}
        >
          <label className="block">
            <span className="mb-1.5 block font-display text-xs font-semibold text-[var(--text-secondary)]">
              Username or email
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username or email address"
              autoComplete="off"
              required
              className="w-full rounded-[var(--btn-radius)] border border-[var(--border-subtle)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs font-mono text-[var(--text-primary)] placeholder:[var(--text-muted)] outline-none focus:border-[var(--signal-teal)] transition-colors"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-display text-xs font-semibold text-[var(--text-secondary)]">
              Role
            </span>
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
              className="w-full rounded-[var(--btn-radius)] border border-[var(--border-subtle)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs font-mono text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--ink)] px-4 py-2.5 font-display text-xs font-semibold text-[var(--on-ink)] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-xs font-mono text-[var(--text-muted)]">Loading members…</p>
      ) : members.length === 0 ? (
        <div className="rounded-[var(--card-radius)] border border-dashed border-[var(--border-subtle)] p-8 text-center bg-[var(--surface-raised)] font-mono">
          <Users className="w-7 h-7 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            No members returned
          </p>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {members.map((member, index) => {
            const userId = getUserId(member);
            const role = roleValue(member.role);
            const isProjectOwner = role === "OWNER";

            return (
              <div
                key={userId ?? `${member.username}-${index}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[var(--card-radius)] border-2 border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {member.username}
                  </p>
                  {member.email && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {member.email}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && !isProjectOwner && userId !== undefined ? (
                    <>
                      <select
                        aria-label={`Role for ${member.username}`}
                        value={role === "VIEWER" ? "VIEWER" : "EDITOR"}
                        disabled={saving}
                        onChange={(event) =>
                          void runMemberAction(
                            () =>
                              updateProjectMember(
                                projectId,
                                userId,
                                event.target.value,
                              ),
                            `Updated ${member.username}'s role.`,
                          )
                        }
                        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>

                      <button
                        type="button"
                        title={`Remove ${member.username}`}
                        aria-label={`Remove ${member.username}`}
                        disabled={saving}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${member.username} from this project?`,
                            )
                          ) {
                            void runMemberAction(
                              () => removeProjectMember(projectId, userId),
                              `Removed ${member.username} from the project.`,
                            );
                          }
                        }}
                        className="rounded-lg border border-[var(--border-subtle)] p-2 text-[var(--error)] hover:bg-[var(--error-soft)] disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                        isProjectOwner
                          ? "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30/80"
                          : role === "VIEWER"
                            ? "bg-[var(--surface-hover)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                            : "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/25"
                      }`}
                    >
                      {isProjectOwner
                        ? "Owner"
                        : role === "VIEWER"
                          ? "Viewer"
                          : "Editor"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isOwner && (
        <div className="space-y-3 border-t border-[var(--border-subtle)] pt-5">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Project Invitations
          </h4>

          {invitations.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No invitations found.</p>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {invitation.email}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {roleValue(invitation.role)} · Invited{" "}
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      invitation.status === "pending"
                        ? "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30"
                        : invitation.status === "accepted"
                          ? "bg-[var(--accent-soft)] text-[var(--accent)] border-emerald-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                    }`}
                  >
                    {invitation?.status
                      ? invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)
                      : "Pending"}
                  </span>

                  {invitation.status === "pending" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Permanently delete the invitation to ${invitation.email}?`,
                          )
                        ) {
                          void runMemberAction(
                            () =>
                              revokeProjectInvitation(projectId, invitation.id),
                            `Invitation to ${invitation.email} deleted.`,
                          );
                        }
                      }}
                      className="rounded-lg border border-[var(--border-subtle)] p-2 text-[var(--error)] hover:bg-[var(--error-soft)] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
