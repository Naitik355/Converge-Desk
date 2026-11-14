import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Code2,
  Terminal,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
  Video,
  Presentation,
  CheckSquare,
  FileText,
  Shield,
  Zap,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Layout,
  Cpu,
  GitBranch,
  Play,
  Check,
  Radio,
  Sliders,
  GraduationCap,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme, cycleTheme, isDark, isLight, isBrutalist } = useTheme();

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('docs');
  const [activeWalkthroughStage, setActiveWalkthroughStage] = useState(0);

  // Interactive showcase state
  const [interactiveDocText, setInteractiveDocText] = useState(
    '# API Architecture\n\n- Endpoint: `/api/v2/sync/stream`\n- Protocol: WebSockets + Yjs CRDT\n- State: Conflict-free replicated\n'
  );
  const [interactiveTasks, setInteractiveTasks] = useState([
    { id: 1, text: 'Finalize WebRTC media constraints', done: true },
    { id: 2, text: 'Benchmark Hocuspocus doc sync latency', done: false },
    { id: 3, text: 'Deploy Monaco vs-dark theme tokens', done: true },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress(currentScroll / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleTask = (id) => {
    setInteractiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setInteractiveTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput('');
  };

  const walkthroughStages = [
    {
      num: '01',
      status: 'BRAINSTORM',
      color: 'teal',
      title: '01 — Brainstorm',
      desc: 'Bring your team together to explore ideas, discuss possibilities, and plan your next move.',
      badge: 'Idea Ideation',
      meta: 'REALTIME CURSORS // COLLABORATIVE CANVAS',
      preview: {
        type: 'canvas',
        elements: ['[Idea Concept] ──> [Possibilities]', '└──> [Actionable Work]'],
      },
    },
    {
      num: '02',
      status: 'DOCUMENT',
      color: 'amber',
      title: '02 — Document',
      desc: 'Capture requirements, architecture decisions, and project knowledge in one shared workspace.',
      badge: 'Shared Knowledge',
      meta: 'CRDT BACKED // ZERO DATA COLLISIONS',
      preview: {
        type: 'docs',
        snippet: '# Project Requirements & Architecture Specs',
      },
    },
    {
      num: '03',
      status: 'BUILD',
      color: 'azure',
      title: '03 — Build',
      desc: 'Collaborate on implementation and keep development connected to the original plan.',
      badge: 'Implementation',
      meta: 'CONNECTED DEV // MONACO WORKSPACE',
      preview: {
        type: 'code',
        snippet: 'export function buildSolution(requirements) {...}',
      },
    },
    {
      num: '04',
      status: 'EXECUTE',
      color: 'violet',
      title: '04 — Execute',
      desc: 'Turn plans into tasks, assign responsibilities, and move your project forward together.',
      badge: 'Clear Responsibilities',
      meta: 'TASK PIPELINE // SPRINT PROGRESS',
      preview: {
        type: 'tasks',
        count: 'Deliverables on Track',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] transition-colors duration-200 relative selection:bg-[var(--signal-teal)] selection:text-black">
      {/* Fixed Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Background Ambient Accents & Developer Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--signal-teal)] opacity-[0.035] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[var(--signal-violet)] opacity-[0.035] rounded-full blur-[140px]" />
        <div className="absolute inset-0 blueprint-grid opacity-40" />
      </div>

      {/* ==================================================
          1. FLOATING TOP NAVIGATION
         ================================================== */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
        <nav className="max-w-6xl mx-auto glass-nav px-4 py-3 flex items-center justify-between transition-all duration-200">
          {/* Logo & Technical Identity */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--signal-teal)] group-hover:border-[var(--signal-teal)] transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight text-[var(--text-primary)]">
                Converge<span className="text-[var(--signal-teal)]">Desk</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)] px-1.5 py-0.2 rounded">
                v2.4
              </span>
            </div>
          </div>

          {/* Anchor Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-[var(--text-muted)]">
            <a href="#workflow" className="hover:text-[var(--text-primary)] transition-colors">
              // WORKFLOW
            </a>
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
              // FEATURES
            </a>
            <a href="#interactive" className="hover:text-[var(--text-primary)] transition-colors">
              // LIVE DEMO
            </a>
            <a href="#metrics" className="hover:text-[var(--text-primary)] transition-colors">
              // METRICS
            </a>
          </div>

          {/* Actions & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button: 2 Themes (Light Brutalist & Dark Brutalist) */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 text-xs font-mono"
              title={`Switch to ${isDark ? 'Light Brutalist' : 'Dark Brutalist'}`}
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-[var(--signal-teal)]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[var(--signal-amber)]" />
              )}
              <span className="hidden lg:inline text-[10px] uppercase font-semibold">
                {isDark ? 'DARK BRUTALIST' : 'LIGHT BRUTALIST'}
              </span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/projects')}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--signal-teal)] text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity font-mono shadow-xs"
              >
                <span>OPEN APP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--signal-teal)] text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity font-mono shadow-xs"
                >
                  <span>GET STARTED</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 pt-24 space-y-24 md:space-y-36">
        {/* ==================================================
            2. HERO SECTION
           ================================================== */}
        <section className="min-h-[85vh] flex flex-col justify-center px-4 md:px-8 max-w-6xl mx-auto pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Technical Narrative & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Technical Metadata Stamp */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--signal-teal)] text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-teal)] animate-pulse" />
                <span>CONVERGEDESK // WORKSPACE CORE</span>
                <span className="text-[var(--border-subtle)]">|</span>
                <span className="text-[var(--text-muted)]">IDEA TO IMPLEMENTATION</span>
              </div>

              {/* Display Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.08] tracking-tight text-[var(--text-primary)]">
                One Workspace. From <span className="text-[var(--signal-teal)]">Idea to Implementation.</span>
              </h1>

              {/* Supporting Technical Card */}
              <div className="glass-card p-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-l-2 border-l-[var(--signal-teal)]">
                Bring your team’s ideas, documents, code, and tasks together in one collaborative workspace. Spend less time switching between tools and more time building great things together.
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate(isAuthenticated ? '/projects' : '/signup')}
                  className="px-5 py-3 rounded-[var(--btn-radius)] bg-[var(--signal-teal)] text-black font-bold text-xs sm:text-sm font-mono flex items-center gap-2 hover:opacity-95 transition-all shadow-md active:translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>GET STARTED</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(isAuthenticated ? '/projects' : '/collaborative-editor-test')}
                  className="px-4 py-3 rounded-[var(--btn-radius)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs sm:text-sm hover:border-[var(--signal-teal)] transition-colors flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4 text-[var(--signal-teal)]" />
                  <span>EXPLORE WORKSPACE</span>
                </button>
              </div>

              {/* Technical Feature Indicators */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs bg-[var(--signal-teal)]" />
                  <span>REAL-TIME COLLABORATION</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs bg-[var(--signal-amber)]" />
                  <span>COLLABORATIVE DOCUMENTS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs bg-[var(--signal-azure)]" />
                  <span>PLAN AND ORGANIZE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs bg-[var(--signal-violet)]" />
                  <span>CONNECTED WORKFLOW</span>
                </div>
              </div>
            </div>

            {/* Right Column: Real Interactive Product Preview */}
            <div className="lg:col-span-6 relative">
              {/* Main Product Container */}
              <div className="glass-card overflow-hidden border-2 border-[var(--border-subtle)] shadow-2xl relative">
                {/* Window Header */}
                <div className="px-4 py-2.5 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--signal-coral)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--signal-amber)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--signal-teal)]" />
                    <span className="ml-2 font-mono text-[11px] text-[var(--text-muted)] font-semibold">
                      workspace // project-sprint-alpha
                    </span>
                  </div>

                  {/* Floating Status Badge */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--signal-teal)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-teal)] animate-pulse" />
                    <span>PEER SYNCED (3 PEERS)</span>
                  </div>
                </div>

                {/* Sub-nav Mode Switcher inside Preview */}
                <div className="flex items-center border-b border-[var(--border-subtle)] bg-[var(--surface-canvas)] px-2 text-xs font-mono">
                  <button
                    onClick={() => setActiveTab('docs')}
                    className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'docs'
                        ? 'border-[var(--signal-teal)] text-[var(--signal-teal)] font-bold'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ARCHITECTURE.MD</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('canvas')}
                    className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'canvas'
                        ? 'border-[var(--signal-amber)] text-[var(--signal-amber)] font-bold'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>SYSTEM_BOARD</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'code'
                        ? 'border-[var(--signal-azure)] text-[var(--signal-azure)] font-bold'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>GATEWAY.PY</span>
                  </button>
                </div>

                {/* Interactive Simulated Preview Content */}
                <div className="p-5 font-mono text-xs min-h-[290px] bg-[var(--surface-canvas)] flex flex-col justify-between">
                  {activeTab === 'docs' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
                        <span>Hocuspocus Provider: ws://localhost:1234</span>
                        <span className="text-[var(--signal-teal)]">● Connected</span>
                      </div>
                      <div className="p-3 bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] space-y-1 text-[var(--text-primary)]">
                        <p className="text-[var(--signal-teal)] font-bold"># Real-Time Project Milestone Specs</p>
                        <p className="text-[var(--text-muted)]">
                          - Yjs CRDT ensures atomic conflict-free mutations across tabs.
                        </p>
                        <p className="text-[var(--text-muted)]">
                          - Supports drag-and-drop local file uploads (.md, .txt, .html).
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <span className="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                          WORDS: 342
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                          COLLABORATORS: ALICE, BOB, YOU
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'canvas' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
                        <span>Excalidraw Multiplayer Canvas ID: board-49</span>
                        <span className="text-[var(--signal-amber)]">● Sync Active</span>
                      </div>
                      <div className="h-36 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center relative p-3">
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Wireframe Grid 1:1
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg border-2 border-emerald-500/60 bg-[var(--surface-raised)] text-center text-[10px]">
                            UI Client (React)
                          </div>
                          <span className="text-[var(--signal-amber)]">⇄</span>
                          <div className="p-2.5 rounded-lg border-2 border-teal-500/60 bg-[var(--surface-raised)] text-center text-[10px]">
                            Django API Core
                          </div>
                          <span className="text-[var(--signal-violet)]">⇄</span>
                          <div className="p-2.5 rounded-lg border-2 border-violet-500/60 bg-[var(--surface-raised)] text-center text-[10px]">
                            Postgres DB
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'code' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
                        <span>Monaco Language Service: Python 3.12</span>
                        <span className="text-[var(--signal-azure)]">● Ready</span>
                      </div>
                      <pre className="p-3 bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] text-[11px] text-[var(--signal-azure)] leading-relaxed overflow-x-auto">
{`class ProjectCollaborationView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        doc = get_object_or_404(ProjectDocuments, pk=pk)
        return Response({"token": generate_yjs_token(request.user)})`}
                      </pre>
                    </div>
                  )}

                  {/* Simulated PiP Mini Meeting Badge */}
                  <div className="mt-3 p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-[var(--signal-teal)]" />
                      <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                        Huddle: sprint-standup
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--signal-teal)] animate-ping" />
                      <span className="text-[10px] text-[var(--text-muted)]">3 active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Scroll Indicator */}
          <div className="flex justify-center pt-10">
            <a
              href="#marquee"
              className="flex flex-col items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--signal-teal)] transition-colors"
            >
              <span>EXPLORE CAPABILITIES</span>
              <span className="animate-bounce">↓</span>
            </a>
          </div>
        </section>

        {/* ==================================================
            3. CONTINUOUS TECHNICAL MARQUEE / TICKER
           ================================================== */}
        <section id="marquee" className="border-y border-[var(--border-subtle)] bg-[var(--surface-raised)] py-3 overflow-hidden select-none">
          <div className="marquee-container">
            <div className="marquee-content font-mono text-xs font-semibold tracking-wider text-[var(--text-muted)]">
              <span>ONE WORKSPACE</span>
              <span className="text-[var(--signal-teal)]">◆</span>
              <span>FROM IDEA TO IMPLEMENTATION</span>
              <span className="text-[var(--signal-amber)]">◆</span>
              <span>REAL-TIME COLLABORATION</span>
              <span className="text-[var(--signal-azure)]">◆</span>
              <span>COLLABORATIVE DOCUMENTS</span>
              <span className="text-[var(--signal-violet)]">◆</span>
              <span>PLAN AND ORGANIZE PROJECTS</span>
              <span className="text-[var(--signal-coral)]">◆</span>
              <span>CONNECTED WORKFLOW</span>
              <span className="text-[var(--signal-teal)]">◆</span>
              <span>AI-POWERED PRODUCTIVITY</span>
              <span className="text-[var(--signal-amber)]">◆</span>
              <span>LESS SWITCHING. MORE BUILDING.</span>
              <span className="text-[var(--signal-azure)]">◆</span>
            </div>
            {/* Seamless duplicate for continuous looping */}
            <div className="marquee-content font-mono text-xs font-semibold tracking-wider text-[var(--text-muted)]" aria-hidden="true">
              <span>ONE WORKSPACE</span>
              <span className="text-[var(--signal-teal)]">◆</span>
              <span>FROM IDEA TO IMPLEMENTATION</span>
              <span className="text-[var(--signal-amber)]">◆</span>
              <span>REAL-TIME COLLABORATION</span>
              <span className="text-[var(--signal-azure)]">◆</span>
              <span>COLLABORATIVE DOCUMENTS</span>
              <span className="text-[var(--signal-violet)]">◆</span>
              <span>PLAN AND ORGANIZE PROJECTS</span>
              <span className="text-[var(--signal-coral)]">◆</span>
              <span>CONNECTED WORKFLOW</span>
              <span className="text-[var(--signal-teal)]">◆</span>
              <span>AI-POWERED PRODUCTIVITY</span>
              <span className="text-[var(--signal-amber)]">◆</span>
              <span>LESS SWITCHING. MORE BUILDING.</span>
              <span className="text-[var(--signal-azure)]">◆</span>
            </div>
          </div>
        </section>

        {/* ==================================================
            4. SCROLL-DRIVEN PRODUCT WALKTHROUGH
           ================================================== */}
        <section id="workflow" className="px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="mono-label text-[var(--signal-teal)]">
              // FROM IDEAS TO REAL PROGRESS
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight text-[var(--text-primary)]">
              From Ideas to Real Progress
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              Great projects begin with an idea. ConvergeDesk helps your team turn that idea into organized, actionable work.
            </p>
          </div>

          {/* Desktop Interactive Stage Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Stage Selector Column */}
            <div className="md:col-span-5 space-y-2.5">
              {walkthroughStages.map((stage, idx) => (
                <div
                  key={stage.num}
                  onClick={() => setActiveWalkthroughStage(idx)}
                  className={`p-3.5 rounded-[var(--card-radius)] border cursor-pointer transition-all duration-200 select-none ${
                    activeWalkthroughStage === idx
                      ? 'bg-[var(--surface-raised)] border-[var(--signal-teal)] shadow-md translate-x-1'
                      : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--signal-teal)]">
                      STAGE {stage.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {stage.status}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[var(--text-primary)] mt-1">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stage Showcase Active Display */}
            <div className="md:col-span-7 glass-card p-6 border-2 border-[var(--border-subtle)] min-h-[380px] flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <span className="mono-label text-[var(--signal-teal)]">
                      STAGE {walkthroughStages[activeWalkthroughStage].num} // {walkthroughStages[activeWalkthroughStage].status}
                    </span>
                    <h3 className="font-display font-extrabold text-lg text-[var(--text-primary)] mt-0.5">
                      {walkthroughStages[activeWalkthroughStage].title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-primary)]">
                    {walkthroughStages[activeWalkthroughStage].badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {walkthroughStages[activeWalkthroughStage].desc}
                </p>

                {/* Technical Simulation Visual */}
                <div className="p-4 rounded-xl bg-[var(--surface-canvas)] border border-[var(--border-subtle)] font-mono text-xs space-y-2">
                  <div className="text-[10px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1 flex justify-between">
                    <span>STATE: STABLE</span>
                    <span className="text-[var(--signal-teal)]">{walkthroughStages[activeWalkthroughStage].meta}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface-card)] rounded border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    {activeWalkthroughStage === 0 && (
                      <div className="space-y-1 text-[var(--signal-teal)]">
                        <p>▶ Canvas Room: convergedesk-arch-review</p>
                        <p>▶ Active Shapes: 48 | Connected Designers: 3</p>
                      </div>
                    )}
                    {activeWalkthroughStage === 1 && (
                      <div className="space-y-1 text-[var(--signal-amber)]">
                        <p>▶ Yjs Document Pad: doc-core-specs-09</p>
                        <p>▶ Hocuspocus Synchronization: Sub-10ms CRDT delta</p>
                      </div>
                    )}
                    {activeWalkthroughStage === 2 && (
                      <div className="space-y-1 text-[var(--signal-azure)]">
                        <p>▶ Monaco Editor: vs-dark active</p>
                        <p>▶ Diagnostics: 0 Errors, 0 Warnings</p>
                      </div>
                    )}
                    {activeWalkthroughStage === 3 && (
                      <div className="space-y-1 text-[var(--signal-violet)]">
                        <p>▶ Sprint Pipeline: 3 Done, 2 In-Progress, 1 Backlog</p>
                        <p>▶ Team Velocity: 42 Story Points</p>
                      </div>
                    )}
                    {activeWalkthroughStage === 4 && (
                      <div className="space-y-1 text-[var(--signal-coral)]">
                        <p>▶ WebRTC Room: project-standup-active</p>
                        <p>▶ Floating PiP Video: Active across all tabs</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Navigation Dots */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
                <span>STAGE {activeWalkthroughStage + 1} OF {walkthroughStages.length}</span>
                <div className="flex gap-1.5">
                  {walkthroughStages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveWalkthroughStage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        activeWalkthroughStage === i
                          ? 'bg-[var(--signal-teal)] scale-125'
                          : 'bg-[var(--border-subtle)] hover:bg-[var(--text-muted)]'
                      }`}
                      aria-label={`Go to stage ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            5. EVERYTHING YOUR TEAM NEEDS TO BUILD TOGETHER
           ================================================== */}
        <section id="features" className="px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="mono-label text-[var(--signal-teal)]">
              // WORKSPACE CAPABILITIES
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight text-[var(--text-primary)]">
              Everything Your Team Needs to Build Together
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              Stop losing context between discussions, planning, and development. ConvergeDesk brings your team's workflow together so everyone can stay aligned and move forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                idx: '01',
                icon: Users,
                color: 'var(--signal-teal)',
                title: 'Real-Time Collaboration',
                desc: 'Work together on shared documents, exchange ideas, and see changes as they happen. Keep your team connected, wherever they work.',
              },
              {
                idx: '02',
                icon: FileText,
                color: 'var(--signal-amber)',
                title: 'Collaborative Documents',
                desc: 'Create project notes, document requirements, and capture important decisions in a shared space your entire team can access.',
              },
              {
                idx: '03',
                icon: CheckSquare,
                color: 'var(--signal-azure)',
                title: 'Plan and Organize Projects',
                desc: 'Manage projects, assign tasks, track progress, and keep responsibilities clear from start to finish.',
              },
              {
                idx: '04',
                icon: GitBranch,
                color: 'var(--signal-violet)',
                title: 'A Connected Development Workflow',
                desc: 'Move from brainstorming and planning toward implementation without losing the context behind your team\'s decisions.',
              },
              {
                idx: '05',
                icon: Sparkles,
                color: 'var(--signal-coral)',
                title: 'AI-Powered Productivity',
                desc: 'Our vision is to help teams turn discussions and project context into useful summaries, suggested tasks, and actionable next steps.',
                featured: true,
              },
            ].map((f) => (
              <div
                key={f.idx}
                className={`glass-card p-5 space-y-4 hover:translate-y-[-2px] transition-transform group ${
                  f.featured ? 'md:col-span-2 lg:col-span-2 border-[var(--signal-coral)]/40 bg-[var(--surface-raised)]/70' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                    style={{ color: f.color }}
                  >
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    {f.featured && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--signal-coral)]/10 text-[var(--signal-coral)] border border-[var(--signal-coral)]/30">
                        VISION
                      </span>
                    )}
                    <span className="font-mono text-xs text-[var(--text-muted)] group-hover:text-[var(--signal-teal)] transition-colors">
                      [{f.idx}]
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[var(--text-primary)]">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            6. BUILT FOR TEAMS THAT CREATE TOGETHER
           ================================================== */}
        <section id="teams" className="px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="mono-label text-[var(--signal-teal)]">
              // AUDIENCE & USE CASES
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight text-[var(--text-primary)]">
              Built for Teams That Create Together
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              Whether you're building your first college project, participating in a hackathon, or developing software with a small team, ConvergeDesk is designed to keep your work connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                tag: 'ACADEMIC & LEARNING',
                icon: GraduationCap,
                color: 'var(--signal-teal)',
                title: 'For Student Developers',
                desc: 'Organize college projects, collaborate with teammates, and turn ideas into working solutions.',
                badge: 'STUDENT // CAMPUS',
              },
              {
                tag: 'RAPID SPRINTING',
                icon: Zap,
                color: 'var(--signal-amber)',
                title: 'For Hackathon Teams',
                desc: 'Plan quickly, share knowledge, coordinate responsibilities, and keep everyone focused on building.',
                badge: '48H // FAST HACKS',
              },
              {
                tag: 'PRODUCTION WORKFLOWS',
                icon: Cpu,
                color: 'var(--signal-azure)',
                title: 'For Software Teams',
                desc: 'Connect project documentation, collaboration, and task execution in a shared development workspace.',
                badge: 'TEAMS // SHIP FASTER',
              },
            ].map((team, idx) => (
              <div
                key={idx}
                className="glass-card p-6 space-y-4 hover:translate-y-[-2px] transition-transform border-2 border-[var(--border-subtle)] hover:border-[var(--signal-teal)] group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                      style={{ color: team.color }}
                    >
                      <team.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {team.badge}
                    </span>
                  </div>
                  <div>
                    <span className="mono-label text-[10px] text-[var(--text-muted)]">
                      {team.tag}
                    </span>
                    <h3 className="font-display font-extrabold text-base text-[var(--text-primary)] mt-1">
                      {team.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                      {team.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--signal-teal)]">
                  <span>OPTIMIZED WORKFLOW</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            6. PRODUCT SHOWCASE SECTION (Interactive Playground)
           ================================================== */}
        <section id="interactive" className="px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="mono-label text-[var(--signal-teal)]">
              // INTERACTIVE SHOWCASE
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight text-[var(--text-primary)]">
              Test drive the live reactive components
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Interact directly with the live editor and sprint task state below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Component 1: Live Markdown Spec Editor */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--signal-teal)]" />
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    LIVE SPEC WRITER
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--signal-teal)] bg-[var(--surface-raised)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                  INTERACTIVE
                </span>
              </div>
              <textarea
                value={interactiveDocText}
                onChange={(e) => setInteractiveDocText(e.target.value)}
                rows={7}
                className="w-full bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-lg p-3 font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--signal-teal)] resize-none"
                placeholder="Type specs here..."
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span>CHARS: {interactiveDocText.length}</span>
                <span className="text-[var(--signal-teal)]">✓ REAL-TIME BUFFER READY</span>
              </div>
            </div>

            {/* Interactive Component 2: Reactive Sprint Task List */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[var(--signal-amber)]" />
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    SPRINT PIPELINE MINI
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {interactiveTasks.filter((t) => t.done).length}/{interactiveTasks.length} COMPLETED
                </span>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {interactiveTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-canvas)] border border-[var(--border-subtle)] hover:border-[var(--signal-teal)] cursor-pointer text-xs font-mono transition-colors"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        task.done
                          ? 'bg-[var(--signal-teal)] border-[var(--signal-teal)] text-black'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {task.done && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className={task.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddTask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add sprint item..."
                  className="flex-1 bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--signal-teal)]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[var(--signal-teal)] text-black font-mono font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  ADD
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ==================================================
            7. KEY WORKSPACE HIGHLIGHTS
           ================================================== */}
        <section id="metrics" className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="glass-card p-6 md:p-8 border-2 border-[var(--border-subtle)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
              <div className="space-y-1.5 pt-4 md:pt-0">
                <div className="font-display font-extrabold text-3xl md:text-4xl text-[var(--signal-teal)]">
                  4-in-1
                </div>
                <div className="mono-label text-[var(--text-primary)] font-bold text-xs">
                  UNIFIED WORKSPACE
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Docs, Tasks, Boards & Code
                </div>
              </div>

              <div className="space-y-1.5 pt-4 md:pt-0">
                <div className="font-display font-extrabold text-3xl md:text-4xl text-[var(--signal-amber)]">
                  100%
                </div>
                <div className="mono-label text-[var(--text-primary)] font-bold text-xs">
                  REAL-TIME SYNC
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Live Multi-User Collaboration
                </div>
              </div>

              <div className="space-y-1.5 pt-4 md:pt-0">
                <div className="font-display font-extrabold text-3xl md:text-4xl text-[var(--signal-azure)]">
                  0 min
                </div>
                <div className="mono-label text-[var(--text-primary)] font-bold text-xs">
                  SETUP TIME
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Instant In-Browser Access
                </div>
              </div>

              <div className="space-y-1.5 pt-4 md:pt-0">
                <div className="font-display font-extrabold text-3xl md:text-4xl text-[var(--signal-violet)]">
                  ZERO
                </div>
                <div className="mono-label text-[var(--text-primary)] font-bold text-xs">
                  LOST CONTEXT
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  From Idea to Implementation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            8. FINAL CTA SECTION: LESS SWITCHING. MORE BUILDING.
           ================================================== */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="glass-card p-8 md:p-14 border-2 border-[var(--signal-teal)] text-center relative overflow-hidden bg-gradient-to-b from-[var(--surface-card)] to-[var(--surface-raised)] shadow-xl">
            <div className="absolute inset-0 dot-matrix opacity-25 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--signal-teal)] text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>With ConvergeDesk, your team can focus on what matters: turning ideas into results.</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] tracking-tight">
                Less Switching. More Building.
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-xl mx-auto">
                Your team's best ideas shouldn't get lost between applications. Keep project knowledge accessible, responsibilities clear, and collaboration connected.
              </p>

              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-canvas)] border border-[var(--border-subtle)] space-y-1.5 max-w-lg mx-auto">
                <div className="font-display font-bold text-sm sm:text-base text-[var(--text-primary)]">
                  Start Building Together Today
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Create your workspace, bring your team together, and take your next project from idea to implementation.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate(isAuthenticated ? '/projects' : '/signup')}
                  className="px-8 py-3.5 rounded-[var(--btn-radius)] bg-[var(--signal-teal)] text-black font-bold text-xs sm:text-sm font-mono flex items-center gap-2 hover:opacity-95 transition-all shadow-md active:translate-y-0.5"
                >
                  <span>GET STARTED</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(isAuthenticated ? '/projects' : '/login')}
                  className="px-6 py-3.5 rounded-[var(--btn-radius)] bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs sm:text-sm hover:border-[var(--signal-teal)] transition-colors"
                >
                  EXPLORE WORKSPACE
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================
          9. FOOTER
         ================================================== */}
      <footer className="mt-24 border-t border-[var(--border-subtle)] bg-[var(--surface-canvas)] py-8 px-4 md:px-8 relative z-10 text-xs font-mono">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--signal-teal)]" />
            <span className="font-bold text-[var(--text-primary)]">ConvergeDesk</span>
            <span>— One Workspace. From Idea to Implementation.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[var(--signal-teal)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-teal)]" />
              STATUS: ALL SYSTEMS NOMINAL
            </span>
            <span>•</span>
            <span>© 2026 CONVERGEDESK INC.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
