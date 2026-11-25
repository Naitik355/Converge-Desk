import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowRight,
  Check,
  Moon,
  Sun,
  FileText,
  ListChecks,
  Shapes,
  Code2,
  Video,
  FolderKanban,
  Users,
  Plus,
  Sparkles,
  MoveUpRight,
  Circle,
} from 'lucide-react';

const MODULES = [
  {
    icon: FileText,
    label: 'Documents',
    title: 'Writing that stays in the room',
    body: 'Specs, decisions and meeting notes live beside the work — edited together in real time, never lost in a thread.',
  },
  {
    icon: ListChecks,
    label: 'Tasks',
    title: 'A plan everyone can act on',
    body: 'Board or list, priority or deadline. Move work forward without exporting a single spreadsheet.',
  },
  {
    icon: Shapes,
    label: 'Whiteboards',
    title: 'Think before the ticket exists',
    body: 'Sketch the system, argue about the shape of it, then turn the diagram into the thing you ship.',
  },
  {
    icon: Code2,
    label: 'Code',
    title: 'An IDE with the context attached',
    body: 'Files, tabs and a live editor in the browser, next to the spec that explains why the code exists.',
  },
];

const WORKFLOW = [
  {
    step: '01',
    title: 'Capture',
    body: 'Start with the raw thought. A note, a canvas, a half-formed idea. No template required.',
  },
  {
    step: '02',
    title: 'Shape',
    body: 'Turn the thought into a document the team can read, comment on and trust.',
  },
  {
    step: '03',
    title: 'Plan',
    body: 'Break the decision into tasks with owners, priorities and dates the team can see.',
  },
  {
    step: '04',
    title: 'Build',
    body: 'Move into the code workspace while the plan stays one click away.',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isDark, cycleTheme } = useTheme();

  const [docText, setDocText] = useState(
    '## Release 2.4\n\n- Ship the collaborative editor\n- Tighten the review flow\n- Invite the design team'
  );
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalise the workspace spec', done: true },
    { id: 2, text: 'Review the editor prototype', done: false },
    { id: 3, text: 'Prep the launch checklist', done: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const startPath = isAuthenticated ? '/projects' : '/signup';

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-soft)]">
      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 cursor-pointer">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--ink)] text-[var(--on-ink)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 5.5h7.5M3 10.5h5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12.25" cy="10.5" r="1.6" fill="var(--accent)" />
              </svg>
            </span>
            <span className="font-display text-[15px] font-bold tracking-[-0.03em]">SyncSpace</span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              ['Modules', '#modules'],
              ['Workflow', '#workflow'],
              ['Try it', '#demo'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="font-display text-[12.5px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={cycleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-[7px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/projects')}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 font-display text-[12px] font-semibold text-[var(--on-ink)] transition-colors hover:bg-[var(--ink-hover)] cursor-pointer"
              >
                Open workspace <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden h-9 items-center rounded-full px-3.5 font-display text-[12px] font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 font-display text-[12px] font-semibold text-[var(--on-ink)] transition-colors hover:bg-[var(--ink-hover)] cursor-pointer"
                >
                  Start free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] sx-marketing-grid opacity-60" />
          <div className="relative mx-auto max-w-[1120px] px-5 pb-16 pt-16 sm:px-6 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1.5 shadow-[var(--shadow-xs)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="font-display text-[11px] font-semibold tracking-[0.02em] text-[var(--text-secondary)]">
                  Docs, tasks, boards and code — one workspace
                </span>
              </div>

              <h1 className="sx-display-xl mt-6">
                From the first idea
                <br />
                to the{' '}
                <span className="relative whitespace-nowrap text-[var(--accent)]">
                  shipped work
                  <svg
                    className="absolute -bottom-2 left-0 h-2 w-full text-[var(--accent)] opacity-40"
                    viewBox="0 0 300 8"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M2 6C60 2 180 1 298 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                .
              </h1>

              <p className="mx-auto mt-7 max-w-xl text-[16px] leading-[1.65] text-[var(--text-secondary)]">
                SyncSpace keeps the thinking, the plan and the build in the same place — so your
                team spends less time switching tools and more time making progress.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => navigate(startPath)}
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 font-display text-[13.5px] font-semibold text-white shadow-[var(--shadow-lift)] transition-all hover:bg-[var(--accent-strong)] active:translate-y-[1px] sm:w-auto cursor-pointer"
                >
                  Start building free <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(isAuthenticated ? '/projects' : '/code')}
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 font-display text-[13.5px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] sm:w-auto cursor-pointer"
                >
                  Explore the workspace
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-[var(--text-muted)]">
                {['No setup required', 'Real-time by default', 'Free for small teams'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[var(--success)]" /> {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Product mock */}
            <div className="relative mx-auto mt-14 max-w-5xl">
              <div className="absolute -inset-x-6 -bottom-6 top-10 rounded-[28px] bg-[var(--accent-soft)] blur-2xl opacity-70" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[18px] border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-menu)]">
                <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
                  </div>
                  <div className="mx-auto hidden items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1 sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">syncspace.app/workspace</span>
                  </div>
                  <span className="ml-auto rounded-full bg-[var(--success-soft)] px-2 py-0.5 font-display text-[10px] font-semibold text-[var(--success)]">
                    3 online
                  </span>
                </div>

                <div className="flex min-h-[360px]">
                  {/* mini rail */}
                  <div className="hidden w-[52px] shrink-0 flex-col items-center gap-3 border-r border-[var(--border-subtle)] bg-[var(--surface-raised)] py-4 sm:flex">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[var(--ink)] text-[var(--on-ink)]">
                      <span className="font-display text-[10px] font-bold">S</span>
                    </span>
                    {[FolderKanban, ListChecks, FileText, Shapes, Code2].map((Icon, i) => (
                      <span
                        key={i}
                        className={`flex h-7 w-7 items-center justify-center rounded-[7px] ${
                          i === 1 ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    ))}
                  </div>

                  {/* main */}
                  <div className="min-w-0 flex-1 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-[13px] font-semibold">Sprint 14</p>
                        <p className="text-[10.5px] text-[var(--text-muted)]">Product team · 8 tasks</p>
                      </div>
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)]">
                        This week
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['In progress', '4', 'var(--warning)'],
                        ['In review', '2', 'var(--accent)'],
                        ['Done', '6', 'var(--success)'],
                      ].map(([label, value, color]) => (
                        <div key={label} className="rounded-[9px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-[9.5px] text-[var(--text-muted)]">{label}</span>
                          </div>
                          <p className="mt-1 font-display text-[17px] font-bold tracking-tight">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        ['To do', ['Draft API contract', 'Review empty states']],
                        ['In progress', ['Editor presence layer']],
                        ['Done', ['Workspace shell']],
                      ].map(([label, items]) => (
                        <div key={label} className="rounded-[9px] bg-[var(--surface-inset)] p-2">
                          <p className="px-0.5 pb-1.5 font-display text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                            {label}
                          </p>
                          <div className="space-y-1.5">
                            {items.map((item) => (
                              <div key={item} className="rounded-[7px] border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
                                <p className="text-[10px] font-medium leading-snug text-[var(--text-primary)]">{item}</p>
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="h-1 w-6 rounded-full bg-[var(--border-strong)]" />
                                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[7px] font-bold text-[var(--accent)]">
                                    A
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center justify-center gap-1 rounded-[7px] border border-dashed border-[var(--border-strong)] py-1.5 text-[9px] text-[var(--text-muted)]">
                              <Plus className="h-2.5 w-2.5" /> Add
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* right rail */}
                  <div className="hidden w-[190px] shrink-0 border-l border-[var(--border-subtle)] p-4 lg:block">
                    <p className="sx-eyebrow">Activity</p>
                    <div className="mt-3 space-y-3.5">
                      {[
                        ['Maya', 'edited the release doc', '2m'],
                        ['Arun', 'moved a task to review', '14m'],
                        ['Design', 'added 3 frames to the board', '1h'],
                      ].map(([who, what, when]) => (
                        <div key={what} className="flex gap-2">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-inset)] text-[8px] font-bold text-[var(--text-secondary)]">
                            {who[0]}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9.5px] leading-snug text-[var(--text-secondary)]">
                              <span className="font-semibold text-[var(--text-primary)]">{who}</span> {what}
                            </p>
                            <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{when} ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[9px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Video className="h-3 w-3 text-[var(--accent)]" />
                        <span className="text-[9.5px] font-semibold">Huddle live</span>
                      </div>
                      <p className="mt-1 text-[9px] text-[var(--text-muted)]">3 people in the room</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MODULE STRIP ============ */}
        <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="mx-auto grid max-w-[1120px] grid-cols-2 divide-x divide-[var(--border-subtle)] px-5 sm:grid-cols-4 sm:px-6">
            {[
              [FileText, 'Documents', 'Live, linked and readable'],
              [ListChecks, 'Tasks', 'Boards and lists that agree'],
              [Shapes, 'Whiteboards', 'Canvas for the messy part'],
              [Code2, 'Code', 'Editor with context'],
            ].map(([Icon, name, note]) => (
              <div key={name} className="flex items-center gap-3 px-4 py-5 first:pl-0 last:pr-0 sm:px-6">
                <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <div>
                  <p className="font-display text-[12px] font-semibold">{name}</p>
                  <p className="text-[10.5px] text-[var(--text-muted)]">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ WORKFLOW ============ */}
        <section id="workflow" className="mx-auto max-w-[1120px] px-5 py-20 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="sx-eyebrow">One continuous workflow</p>
            <h2 className="sx-display-l mt-3">The handoffs were the problem.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Every tool switch loses a little context. SyncSpace removes the switch, so a decision
              made in a document is still visible when the code gets written.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((item) => (
              <div key={item.step} className="group bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-raised)]">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-inset)] font-mono text-[10px] text-[var(--text-muted)]">
                    {item.step}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--border-strong)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </div>
                <h3 className="mt-5 font-display text-[15px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ MODULES BENTO ============ */}
        <section id="modules" className="border-y border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-6 sm:py-24">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="sx-eyebrow">The modules</p>
                <h2 className="sx-display-l mt-3">Everything the work touches.</h2>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
                Four focused surfaces, one shared language. Each one is useful alone; together they
                close the gap between thinking and building.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {MODULES.map((module, index) => (
                <article
                  key={module.label}
                  className={`group relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] p-6 transition-colors hover:border-[var(--border-strong)] ${
                    index === 0 ? 'bg-[var(--accent-soft)] border-transparent' : 'bg-[var(--surface-raised)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-[10px] border ${
                        index === 0
                          ? 'border-transparent bg-[var(--accent)] text-white'
                          : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--accent)]'
                      }`}
                    >
                      <module.icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      0{index + 1} — {module.label}
                    </span>
                  </div>
                  <h3 className="mt-6 max-w-sm font-display text-[19px] font-semibold leading-snug tracking-[-0.025em]">
                    {module.title}
                  </h3>
                  <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                    {module.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 font-display text-[11.5px] font-semibold text-[var(--accent)]">
                    Included in every workspace
                    <MoveUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ INTERACTIVE DEMO ============ */}
        <section id="demo" className="mx-auto max-w-[1120px] px-5 py-20 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <p className="sx-eyebrow">Try the surfaces</p>
              <h2 className="sx-display-m mt-3">Two of the four, live.</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
                Write a line in the document and check off a task. This is the same editing and
                task-state behaviour the real workspace uses.
              </p>
              <button
                onClick={() => navigate(startPath)}
                className="mt-6 inline-flex items-center gap-1.5 font-display text-[12.5px] font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)] cursor-pointer"
              >
                Open the full workspace <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)]">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2.5">
                  <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span className="font-display text-[11.5px] font-semibold">Release notes</span>
                  <span className="ml-auto rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[9.5px] font-semibold text-[var(--success)]">
                    Live
                  </span>
                </div>
                <textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  rows={7}
                  className="w-full resize-none bg-transparent p-4 font-mono text-[11.5px] leading-relaxed text-[var(--text-primary)] focus:outline-none"
                  aria-label="Try the document editor"
                />
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2 text-[10px] text-[var(--text-muted)]">
                  <span>{docText.length} characters</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Saved
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface)]">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2.5">
                  <ListChecks className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span className="font-display text-[11.5px] font-semibold">Sprint tasks</span>
                  <span className="ml-auto text-[10px] text-[var(--text-muted)]">
                    {tasks.filter((t) => t.done).length}/{tasks.length} done
                  </span>
                </div>
                <div className="space-y-1 p-2.5">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-2 text-left transition-colors hover:bg-[var(--surface-hover)] cursor-pointer"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                          task.done
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                            : 'border-[var(--border-strong)]'
                        }`}
                      >
                        {task.done && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span
                        className={`text-[11.5px] ${
                          task.done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
                <form onSubmit={addTask} className="flex gap-1.5 border-t border-[var(--border-subtle)] p-2.5">
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task…"
                    className="h-8 flex-1 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2.5 text-[11.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[var(--ink)] text-[var(--on-ink)] transition-colors hover:bg-[var(--ink-hover)] cursor-pointer"
                    aria-label="Add task"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ============ AUDIENCE ============ */}
        <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 px-5 py-16 sm:px-6 md:grid-cols-3 sm:py-20">
            {[
              [Users, 'Student teams', 'Keep a semester project legible to everyone, even when the team meets twice a week.'],
              [Circle, 'Hackathon crews', 'Plan, sketch and build in the same window. No onboarding, no environment to install.'],
              [FolderKanban, 'Product squads', 'Carry the decision from the doc to the board to the code without repeating yourself.'],
            ].map(([Icon, title, body]) => (
              <div key={title}>
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="mt-4 font-display text-[15px] font-semibold">{title}</h3>
                <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed text-[var(--text-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CLOSING CTA ============ */}
        <section className="mx-auto max-w-[1120px] px-5 py-20 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[var(--ink)] px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 sx-dot-grid opacity-[0.18]" />
            <div className="relative">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
                Less switching. More building.
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl sx-display-l text-[var(--on-ink)]">
                {isAuthenticated
                  ? `Welcome back, ${user?.username || 'builder'}. Your workspace is ready.`
                  : 'Bring the whole idea into one workspace.'}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-[var(--on-ink)]/60">
                Documents, tasks, whiteboards and code — already connected, already yours.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => navigate(isAuthenticated ? '/projects' : '/signup')}
                  className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[var(--on-ink)] px-6 font-display text-[13px] font-semibold text-[var(--ink)] transition-opacity hover:opacity-90 sm:w-auto cursor-pointer"
                >
                  {isAuthenticated ? 'Open workspace' : 'Create your workspace'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex h-[48px] w-full items-center justify-center rounded-full border border-white/20 px-6 font-display text-[13px] font-semibold text-[var(--on-ink)] transition-colors hover:bg-white/10 sm:w-auto cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[var(--ink)] text-[var(--on-ink)]">
              <span className="font-display text-[9px] font-bold">S</span>
            </span>
            <span className="font-display text-[12px] font-semibold">SyncSpace</span>
            <span className="text-[11px] text-[var(--text-muted)]">Studio workspace</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Built for teams that think, plan and build in the same place.
          </p>
        </div>
      </footer>
    </div>
  );
};
