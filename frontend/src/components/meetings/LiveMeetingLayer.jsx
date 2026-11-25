import React, { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { Minimize2, Maximize2, PhoneOff, Video } from 'lucide-react';
import '@livekit/components-styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMeeting } from '../../context/MeetingContext';
import { useAuth } from '../../context/AuthContext';

export function LiveMeetingLayer() {
  const { meeting, minimized, minimizeMeeting, expandMeeting, endMeeting } = useMeeting();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function connect() {
      if (!meeting) {
        setCredentials(null);
        setError('');
        return;
      }
      const tokenServerId = import.meta.env.VITE_LIVEKIT_TOKEN_SERVER_ID;
      if (!tokenServerId) {
        setError('Missing VITE_LIVEKIT_TOKEN_SERVER_ID in frontend/.env.local');
        setCredentials(null);
        return;
      }
      setLoading(true);
      setError('');
      setCredentials(null);
      try {
        const source = TokenSource.developmentTokenServer(tokenServerId);
        const participantName =
          user?.first_name
            ? `${user.first_name} ${user.last_name || ''}`.trim()
            : (user?.username || localStorage.getItem('username') || 'Team Member');
        const participantIdentity = user?.id
          ? `user-${user.id}-${user.username || 'member'}`
          : `guest-${Date.now().toString(36)}`;

        const result = await source.fetch({
          roomName: meeting.roomName,
          participantName: participantName,
          participantIdentity: participantIdentity,
        });
        if (!cancelled) setCredentials({
          serverUrl: result.serverUrl,
          token: result.participantToken,
        });
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Could not get meeting access token.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    connect();
    return () => { cancelled = true; };
  }, [meeting, user]);

  if (!meeting) return null;

  const showFull = !minimized;

  const handleMaximize = (e) => {
    e?.stopPropagation?.();
    expandMeeting();
  };

  const handleMinimize = (e) => {
    e?.stopPropagation?.();
    minimizeMeeting();
  };

  const handleEnd = (e) => {
    e?.stopPropagation?.();
    endMeeting();
  };

  const header = (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 bg-[#090d14] text-white border-b border-slate-800 shrink-0 select-none ${
        !showFull ? 'cursor-pointer hover:bg-slate-900/90' : ''
      }`}
      onDoubleClick={!showFull ? handleMaximize : undefined}
    >
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Video className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="truncate">{meeting.title}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono truncate">Room: {meeting.roomName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {showFull ? (
          <button
            type="button"
            onClick={handleMinimize}
            title="Minimize to floating window"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minimize</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMaximize}
            title="Maximize meeting to full screen"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-strong)] hover:text-white transition-all border border-[var(--accent)]/30"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Maximize</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleEnd}
          title="Leave meeting"
          className="rounded-lg bg-[var(--error)] px-2 py-1 text-xs font-medium text-white hover:opacity-90 transition-colors flex items-center gap-1"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">End</span>
        </button>
      </div>
    </div>
  );

  const body = loading ? (
    <div className="flex h-full items-center justify-center bg-slate-950 text-xs text-slate-300">
      Connecting to meeting…
    </div>
  ) : error ? (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-950 p-4 text-center text-xs text-white">
      <p className="font-semibold text-[var(--error)]">Could not start video meeting</p>
      <p className="max-w-xs text-[11px] text-slate-400">{error}</p>
    </div>
  ) : credentials ? (
    <LiveKitRoom
      serverUrl={credentials.serverUrl}
      token={credentials.token}
      connect
      video
      audio
      onError={(e) => setError(e?.message || 'LiveKit connection failed.')}
      data-lk-theme="default"
      className="h-full min-h-0"
    >
      <VideoConference />
    </LiveKitRoom>
  ) : null;

  if (showFull) {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col bg-slate-950 text-white animate-in fade-in duration-150">
        {header}
        <div className="min-h-0 flex-1">{body}</div>
      </div>
    );
  }

  return (
    <div className="mini-meeting-layer fixed bottom-4 right-4 z-[9995] flex h-[340px] w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[var(--radius-card)] border border-slate-700/80 bg-slate-950 shadow-2xl transition-all">
      {header}
      <div className="min-h-0 flex-1 overflow-hidden">{body}</div>
    </div>
  );
}
