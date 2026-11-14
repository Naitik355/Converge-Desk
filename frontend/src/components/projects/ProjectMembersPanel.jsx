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
    <section className="max-w-3xl bg-[#0d131c] rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl text-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">
            Project Members
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage who can access this project and their permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadMembers()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#090d14] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-[#121c29] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-3 text-xs text-rose-300"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-3 text-xs text-emerald-400"
        >
          {notice}
        </p>
      )}

      {isOwner && (
        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 border-b border-slate-800/80 pb-6"
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
            <span className="block text-xs font-mono font-semibold text-[var(--text-muted)] mb-1.5">
              Username or Email Address
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
            <span className="block text-xs font-mono font-semibold text-[var(--text-muted)] mb-1.5">
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius)] bg-[var(--signal-teal)] px-4 py-2.5 text-xs font-mono font-bold text-black hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
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
                        className="rounded-lg border border-slate-800 bg-[#080c12] px-3 py-1.5 text-xs font-semibold text-slate-300"
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
                        className="rounded-lg border border-slate-800 p-2 text-rose-400 hover:bg-rose-950/40 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                        isProjectOwner
                          ? "bg-amber-950/70 text-amber-400 border-amber-800/80"
                          : role === "VIEWER"
                            ? "bg-slate-800 text-slate-400 border-slate-700"
                            : "bg-emerald-950/70 text-emerald-400 border-emerald-800/80"
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
        <div className="space-y-3 border-t border-slate-800/80 pt-5">
          <h4 className="text-sm font-bold text-slate-200">
            Project Invitations
          </h4>

          {invitations.length === 0 ? (
            <p className="text-sm text-slate-500">No invitations found.</p>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0f1622] p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">
                    {invitation.email}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {roleValue(invitation.role)} · Invited{" "}
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      invitation.status === "pending"
                        ? "bg-amber-950/70 text-amber-400 border-amber-800"
                        : invitation.status === "accepted"
                          ? "bg-emerald-950/70 text-emerald-400 border-emerald-800"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {invitation.status.charAt(0).toUpperCase() +
                      invitation.status.slice(1)}
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
                      className="rounded-lg border border-slate-800 p-2 text-rose-400 hover:bg-rose-950/40 disabled:opacity-50 transition-colors cursor-pointer"
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
