import React, { useState, useEffect } from 'react';
import { Calendar, Copy, Play, Video, Users, Radio, Plus, MonitorUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Card';
import { useToast } from '../context/ToastContext';
import { useMeeting } from '../context/MeetingContext';
import { listProjects, getProjectMembers } from '../api/projects';
import { getProjectMeetings, createProjectMeeting, inviteMeetingMembers } from '../api/meetings';

export const MeetingsPage = () => {
  const { startMeeting, meeting, expandMeeting } = useMeeting();
  const { success, info, error } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [meetings, setMeetings] = useState([
    {
      id: 'meet-1',
      title: 'Sprint kickoff',
      roomName: 'convergedesk-sprint-kickoff',
      time: 'Team room',
      attendees: 'Anyone with the room code',
    },
    {
      id: 'meet-2',
      title: 'Architecture review',
      roomName: 'convergedesk-whiteboard-review',
      time: 'Team room',
      attendees: 'Anyone with the room code',
    },
  ]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await listProjects();
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(String(data[0].id));
      } catch {
        error('Could not load projects', 'Please try again.');
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([]);
      setMeetings([]);
      return;
    }

    const loadProjectData = async () => {
      try {
        const [projectMembers, projectMeetings] = await Promise.all([
          getProjectMembers(selectedProjectId),
          getProjectMeetings(selectedProjectId),
        ]);
        setMembers(projectMembers);
        setMeetings(
          projectMeetings.map((item) => ({
            ...item,
            time: 'Project meeting',
            attendees: 'Invited project members',
          }))
        );
      } catch {
        error('Could not load project meetings', 'Please try again.');
      }
    };

    loadProjectData();
  }, [selectedProjectId]);

  const createAndJoin = (title, roomName) => {
    startMeeting(title, roomName);
    info('Joining meeting', 'Allow camera and microphone access when your browser asks.');
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    if (!newMeetingTitle.trim()) {
      error('Meeting title required', 'Enter a title for the meeting.');
      return;
    }
    if (!selectedProjectId) {
      error('Project required', 'Select a project for this meeting.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await createProjectMeeting(selectedProjectId, newMeetingTitle.trim());

      if (selectedMemberIds.length > 0) {
        await inviteMeetingMembers(
          selectedProjectId,
          created.id,
          selectedMemberIds.map(Number)
        );
      }

      setNewMeetingTitle('');
      setNewRoomName('');
      setSelectedMemberIds([]);
      setIsCreateModalOpen(false);

      success('Meeting created', 'Your project meeting is ready.');
      createAndJoin(created.title, created.roomName);

      const updatedMeetings = await getProjectMeetings(selectedProjectId);
      setMeetings(
        updatedMeetings.map((item) => ({
          ...item,
          time: 'Project meeting',
          attendees: 'Invited project members',
        }))
      );
    } catch (err) {
      error('Could not create meeting', err?.message || 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoom = async (roomName) => {
    try {
      await navigator.clipboard.writeText(roomName);
      success('Room code copied', roomName);
    } catch {
      error('Could not copy room code', 'Select and copy the room code manually.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 p-5 text-[var(--text-primary)] md:p-8">
      <PageHeader
        eyebrow="Team"
        title="Meetings"
        description="Talk it through, then keep the room open while you write, draw and build together."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Calendar className="h-3.5 w-3.5" />}
            >
              Create room
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                createAndJoin('Instant team huddle', `convergedesk-huddle-${Date.now()}`)
              }
              leftIcon={<Video className="h-3.5 w-3.5" />}
            >
              Start instant meeting
            </Button>
          </>
        }
      />

      {meeting && (
        <div className="flex flex-col justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--success)]/25 bg-[var(--success-soft)] p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-white">
              <Radio className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-[13px] font-semibold text-[var(--text-primary)]">
                In a meeting · {meeting.title}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] text-[var(--text-muted)]">
                {meeting.roomName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyRoom(meeting.roomName)}
              leftIcon={<Copy className="h-3.5 w-3.5" />}
            >
              Copy code
            </Button>
            <Button size="sm" variant="primary" onClick={expandMeeting}>
              Open meeting
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Panel
            eyebrow="Rooms"
            title="Collaboration rooms"
            description="Dedicated channels with audio, video and screen sharing."
            bodyClassName="p-4"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {meetings.length === 0 ? (
                <div className="col-span-full rounded-[10px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-inset)] px-4 py-10 text-center md:col-span-2">
                  <Video className="mx-auto mb-2 h-5 w-5 text-[var(--text-muted)]" />
                  <p className="font-display text-[13px] font-semibold">No rooms in this project</p>
                  <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                    Create a room and invite the project members.
                  </p>
                </div>
              ) : (
                meetings.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 transition-colors hover:border-[var(--border-strong)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Video className="h-4 w-4" />
                        </span>
                        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 text-[9.5px] font-semibold text-[var(--text-muted)]">
                          {item.time}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-[13px] font-semibold leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
                        <Users className="h-3 w-3" /> {item.attendees}
                      </p>
                      <p className="mt-2.5 truncate rounded-[5px] border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]">
                        {item.roomName}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-1.5">
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => createAndJoin(item.title, item.roomName)}
                        leftIcon={<Play className="h-3 w-3" />}
                        className="flex-1"
                      >
                        Join room
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyRoom(item.roomName)}
                        className="!px-2.5"
                        aria-label="Copy room code"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <Panel eyebrow="Project" title="In the room" bodyClassName="p-4">
            <label className="mb-1.5 block font-display text-xs font-semibold text-[var(--text-secondary)]">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-[12px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            >
              {projects.length === 0 && <option value="">No projects</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <p className="sx-eyebrow mt-4">Members · {members.length}</p>
            <div className="mt-2 space-y-1">
              {members.length === 0 ? (
                <p className="text-[11.5px] text-[var(--text-muted)]">No members loaded.</p>
              ) : (
                members.slice(0, 6).map((member) => {
                  const id = member.user_id ?? member.id;
                  const name = member.username || member.email || `Member ${id}`;
                  return (
                    <div key={id} className="flex items-center gap-2 rounded-[7px] px-1 py-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display text-[9px] font-bold text-[var(--accent)]">
                        {name[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-medium text-[var(--text-primary)]">
                          {name}
                        </p>
                        <p className="text-[9.5px] capitalize text-[var(--text-muted)]">
                          {member.role || 'member'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>

          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
            <p className="sx-eyebrow">Good to know</p>
            <ul className="mt-2.5 space-y-2.5 text-[11.5px] leading-relaxed text-[var(--text-muted)]">
              <li className="flex gap-2">
                <MonitorUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                Share your screen and keep the meeting pinned while you work.
              </li>
              <li className="flex gap-2">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                Anyone with the room code can join from their own workspace.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        eyebrow="New room"
        title="Create a team meeting"
        description="Pick a project, name the topic and invite the members who need to be there."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => document.getElementById('create-meeting-form')?.requestSubmit()}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Create & join
            </Button>
          </>
        }
      >
        <form id="create-meeting-form" onSubmit={handleCreateMeeting} className="space-y-4">
          <Select
            label="Project"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedMemberIds([]);
            }}
            required
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={String(project.id)}>
                {project.name}
              </option>
            ))}
          </Select>

          <Input
            label="Meeting topic"
            placeholder="e.g. Sprint retrospective"
            value={newMeetingTitle}
            onChange={(e) => setNewMeetingTitle(e.target.value)}
            autoFocus
            required
          />

          <div>
            <p className="mb-1.5 font-display text-xs font-semibold text-[var(--text-secondary)]">
              Invite project members
            </p>
            {members.length === 0 ? (
              <p className="rounded-[8px] border border-dashed border-[var(--border-subtle)] px-3 py-3 text-[11.5px] text-[var(--text-muted)]">
                No project members found.
              </p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-2">
                {members.map((member) => {
                  const memberId = String(member.user_id ?? member.user?.id ?? member.id);
                  const name =
                    member.username ?? member.user?.username ?? member.email ?? memberId;
                  return (
                    <label
                      key={memberId}
                      className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1.5 text-[11.5px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(memberId)}
                        className="h-3.5 w-3.5 rounded border-[var(--border-strong)] accent-[var(--accent)]"
                        onChange={(e) => {
                          setSelectedMemberIds((previous) =>
                            e.target.checked
                              ? [...previous, memberId]
                              : previous.filter((id) => id !== memberId)
                          );
                        }}
                      />
                      <span className="truncate">{name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <Input
            label="Room code (optional)"
            placeholder="e.g. team-sprint-planning"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
