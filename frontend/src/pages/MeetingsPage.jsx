import React, { useState, useEffect } from "react";
import { Calendar, Copy, Play, Video, Users } from "lucide-react";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/common/Input";
import { useToast } from "../context/ToastContext";
import { useMeeting } from "../context/MeetingContext";
import { listProjects, getProjectMembers } from "../api/projects";
import {
  getProjectMeetings,
  createProjectMeeting,
  inviteMeetingMembers,
} from "../api/meetings";
export const MeetingsPage = () => {
  const { startMeeting, meeting, expandMeeting } = useMeeting();
  const { success, info, error } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [meetings, setMeetings] = useState([
    {
      id: "meet-1",
      title: "ConvergeDesk Sprint Kickoff",
      roomName: "convergedesk-sprint-kickoff",
      time: "Team room",
      attendees: "Anyone with room code",
    },
    {
      id: "meet-2",
      title: "Whiteboard Architecture Review",
      roomName: "convergedesk-whiteboard-review",
      time: "Team room",
      attendees: "Anyone with room code",
    },
  ]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await listProjects();
        setProjects(data);

        if (data.length > 0) {
          setSelectedProjectId(String(data[0].id));
        }
      } catch (err) {
        error("Could not load projects", "Please try again.");
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
            time: "Project meeting",
            attendees: "Invited project members",
          })),
        );
      } catch (err) {
        error("Could not load project meetings", "Please try again.");
      }
    };

    loadProjectData();
  }, [selectedProjectId]);

  const createAndJoin = (title, roomName) => {
    startMeeting(title, roomName);
    info(
      "Joining meeting",
      "Allow camera and microphone access when your browser asks.",
    );
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    if (!newMeetingTitle.trim()) {
      error("Meeting title required", "Enter a title for the meeting.");
      return;
    }

    if (!selectedProjectId) {
      error("Project required", "Select a project for this meeting.");
      return;
    }

    setIsLoading(true);

    try {
      // Create and save the meeting for the selected project.
      const created = await createProjectMeeting(
        selectedProjectId,
        newMeetingTitle.trim(),
      );

      // Invite the selected members.
      if (selectedMemberIds.length > 0) {
        await inviteMeetingMembers(
          selectedProjectId,
          created.id,
          selectedMemberIds.map(Number),
        );
      }

      const roomName = created.roomName;

      // Keep the existing LiveKit meeting flow.
      setNewMeetingTitle("");
      setNewRoomName("");
      setSelectedMemberIds([]);
      setIsCreateModalOpen(false);

      success("Meeting created", "Your project meeting is ready.");
      createAndJoin(created.title, roomName);

      // Refresh the selected project's meeting list.
      const updatedMeetings = await getProjectMeetings(selectedProjectId);
      setMeetings(
        updatedMeetings.map((item) => ({
          ...item,
          time: "Project meeting",
          attendees: "Invited project members",
        })),
      );
    } catch (err) {
      error(
        "Could not create meeting",
        err?.message || "Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoom = async (roomName) => {
    try {
      await navigator.clipboard.writeText(roomName);
      success("Room code copied", roomName);
    } catch {
      error(
        "Could not copy room code",
        "Select and copy the room code manually.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Meetings & Collaboration Calls
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Meet face-to-face, then keep the call open while working on code,
            boards, and tasks.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Create room
          </Button>
          <Button
            size="sm"
            onClick={() =>
              createAndJoin(
                "Instant Team Huddle",
                `convergedesk-huddle-${Date.now()}`,
              )
            }
            leftIcon={<Video className="h-4 w-4" />}
          >
            Start instant meeting
          </Button>
        </div>
      </div>

      {meeting && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              You're in a meeting: {meeting.title}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Room code: <span className="font-mono text-emerald-300">{meeting.roomName}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyRoom(meeting.roomName)}
              leftIcon={<Copy className="h-3.5 w-3.5" />}
            >
              Copy room code
            </Button>
            <Button size="sm" onClick={expandMeeting}>
              Open meeting
            </Button>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-[var(--text-primary)]">Team Collaboration Rooms</h3>
          <p className="mt-1 text-xs font-mono text-[var(--text-muted)]">
            // Dedicated team channels with low-latency audio, video, and screen sharing.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {meetings.map((item) => (
            <Card
              key={item.id}
              hoverable
              className="flex items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0 space-y-2">
                <h4 className="truncate font-display text-sm font-bold text-[var(--text-primary)]">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                  <Users className="h-3.5 w-3.5 text-[var(--signal-teal)]" />
                  {item.attendees}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                  <Calendar className="h-3.5 w-3.5 text-[var(--signal-teal)]" />
                  {item.time}
                </div>
                <p className="break-all font-mono text-xs text-[var(--text-muted)] bg-[var(--surface-raised)] px-2 py-0.5 rounded-[var(--btn-radius)] border border-[var(--border-subtle)] inline-block">
                  {item.roomName}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => createAndJoin(item.title, item.roomName)}
                  leftIcon={<Play className="h-3.5 w-3.5" />}
                  className="bg-[var(--signal-teal)] text-black font-bold"
                >
                  Join
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyRoom(item.roomName)}
                  leftIcon={<Copy className="h-3.5 w-3.5" />}
                >
                  Copy code
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Conference System & Media Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-teal)] flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[var(--text-primary)]">HD Video & Low Latency</h4>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">Encrypted WebRTC peer mesh with adaptive bitrate</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-azure)] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[var(--text-primary)]">Instant Team Collaboration</h4>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">Integrated whiteboard, documents, and workspace sync</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-amber)] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[var(--text-primary)]">Project Room Persistence</h4>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">Shareable room codes saved per project milestone</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create team meeting"
        description="Choose a title and optional room code. Share the room code with your teammates."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                document.getElementById("create-meeting-form")?.requestSubmit()
              }
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create & join"}
            </Button>
          </>
        }
      >
        <form
          id="create-meeting-form"
          onSubmit={handleCreateMeeting}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedMemberIds([]);
              }}
              className="w-full bg-[#080d14] text-slate-100 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            >
              <option value="" className="bg-[#0b1017]">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)} className="bg-[#0b1017]">
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Meeting topic"
            placeholder="e.g. Sprint retrospective"
            value={newMeetingTitle}
            onChange={(e) => setNewMeetingTitle(e.target.value)}
            autoFocus
            required
          />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Invite project members
            </label>

            {members.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No project members found.
              </p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-[#080d14] p-3 text-slate-300">
                {members.map((member) => {
                  const memberId = String(
                    member.user_id ?? member.user?.id ?? member.id,
                  );
                  return (
                    <label
                      key={memberId}
                      className="flex items-center gap-2 text-xs hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(memberId)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                        onChange={(e) => {
                          setSelectedMemberIds((previous) =>
                            e.target.checked
                              ? [...previous, memberId]
                              : previous.filter((id) => id !== memberId),
                          );
                        }}
                      />
                      <span>
                        {member.username ??
                          member.user?.username ??
                          member.email ??
                          memberId}
                      </span>
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
