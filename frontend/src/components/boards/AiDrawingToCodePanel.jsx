import React, { useState } from "react";
import {
  Sparkles,
  Code2,
  Copy,
  Check,
  X,
  Play,
  Settings,
  AlertCircle,
  Eye,
  FileCode,
  Layers,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { Button } from "../common/Button";
import { useToast } from "../../context/ToastContext";

export const AiDrawingToCodePanel = ({
  isOpen,
  onClose,
  boardTitle = "Current Board",
  editor,
}) => {
  const [targetType, setTargetType] = useState("react_tailwind");
  const [customPrompt, setCustomPrompt] = useState("");
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("convergedesk_gemini_key") || "",
  );
  const [showConfig, setShowConfig] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { success, warning, error: toastError } = useToast();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!editor) {
      setErrorMessage("The whiteboard editor is not connected yet.");
      return;
    }

    const shapes = editor.getCurrentPageShapes();

    if (!shapes.length) {
      setErrorMessage(
        "Draw something on the whiteboard before generating code.",
      );
      return;
    }

    const { exportToBlob } = await import("tldraw");

    const image = await editor.toImage(
      shapes.map((shape) => shape.id),
      {
        format: "png",
        background: true,
        scale: 2,
      },
    );


    if (!image) {
      throw new Error("Failed to export the drawing as PNG.");
    }

    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read the exported PNG."));
          return;
        }

        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = () =>
        reject(new Error("Failed to read the exported PNG."));
      reader.readAsDataURL(image.blob);
    });

    setErrorMessage(null);
    setGeneratedCode("");

    // Check if backend endpoint or client key exists
    if (!apiKey) {
      setErrorMessage(
        "Backend AI generation endpoint (/api/ai/generate/) is not yet deployed on Django, and no Gemini API key is configured. Please provide an API key in settings or deploy the AI backend service.",
      );
      warning(
        "AI Model Unconnected",
        "Configure an API key or backend service to run code generation.",
      );
      return;
    }

    setIsGenerating(true);
    setGenerationStage("Extracting whiteboard shapes & visual structure...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setGenerationStage(
        "Synthesizing Tailwind CSS classes and React JSX tree...",
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGenerationStage("Generating clean React component props...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Real call to Gemini API if key is present
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `You are an expert software engineer who converts whiteboard drawings into code.

Analyze the provided image before generating code.
Determine whether the drawing represents a user interface, a flowchart, an algorithm, or application logic.
Infer relationships between shapes, labels, arrows, and components.
Choose suitable code based on the drawing and the requested output target.
Generate clean, functional, accessible code with sensible names.
Do not invent details that contradict the drawing.
Return only the requested output, without markdown fences.`,
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Board: ${boardTitle}
Output target: ${targetType}
Additional instructions: ${
                      customPrompt || "Use your judgment based on the drawing."
                    }

Analyze the attached drawing and generate the appropriate code.`,
                  },
                  {
                    inline_data: {
                      mime_type: "image/png",
                      data: imageBase64,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API error (${response.status})`,
        );
      }

      const data = await response.json();
      const code =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "// No code returned";
      setGeneratedCode(code.trim());
      success(
        "Code Generated",
        "React component generated from whiteboard context.",
      );
    } catch (err) {
      const msg = err?.message || "Failed to generate code from whiteboard";
      setErrorMessage(msg);
      toastError("Generation Failed", msg);
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    success("Copied to Clipboard", "Generated code copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("convergedesk_gemini_key", apiKey);
    setShowConfig(false);
    success("API Key Saved", "Key stored locally in browser storage.");
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99990] animate-in fade-in duration-200"
        onClick={onClose}
        title="Click to dismiss"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[99999] w-full sm:w-[540px] bg-[var(--surface)] shadow-[var(--shadow-sm)] border-l border-[var(--border-subtle)] flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--accent)] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-[13px] font-semibold text-[var(--text-primary)]">
                Drawing to code
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Transform whiteboard wireframes into code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="AI Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Settings Drawer */}
          {showConfig && (
            <div className="p-3.5 rounded-[10px] bg-[var(--surface-inset)] border border-[var(--border-subtle)] space-y-2.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--accent)]">
                  AI Engine Integration
                </span>
                <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 px-2 py-0.5 rounded-full font-medium">
                  Gemini Vision
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Connect your Google Gemini API key to enable instant diagram-to-code synthesis.
              </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter Gemini API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <Button size="sm" onClick={handleSaveApiKey}>
                Save
              </Button>
            </div>
          </div>
        )}


        {/* Target Options */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Output Target
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "react_tailwind",
                label: "React + Tailwind",
                icon: FileCode,
              },
              { id: "js_logic", label: "JavaScript Logic", icon: Code2 },
              { id: "flowchart", label: "Flow Logic", icon: Layers },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTargetType(t.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-[10px] border text-xs font-medium transition-all ${
                    targetType === t.id
                      ? "bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--accent)] shadow-2xs font-semibold"
                      : "bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Prompt Instructions (Optional)
          </label>
          <textarea
            rows={2}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Include dark mode variants, interactive dropdown, and accessible keyboard focus..."
            className="w-full text-xs p-3 bg-[var(--surface-inset)] border border-[var(--border-subtle)] rounded-[10px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={handleGenerate}
          isLoading={isGenerating}
          leftIcon={<Play className="w-3.5 h-3.5" />}
          className="w-full"
        >
          {isGenerating
            ? generationStage || "Generating Code..."
            : "Convert Drawing to Code"}
        </Button>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[var(--error-soft)] border border-[var(--error)]/30 text-[var(--error)] text-xs">
            <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-[var(--error)]">Generation Notice</p>
              <p className="text-[11px] leading-relaxed text-[var(--error)]">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowConfig(true)}
                className="mt-1 font-semibold text-[var(--error)] underline block hover:text-[var(--error)]"
              >
                Configure Gemini API Key in Settings
              </button>
            </div>
          </div>
        )}

        {/* Output Code Container */}
        {generatedCode && (
          <div className="border border-[var(--border-subtle)] rounded-[var(--radius-card)] overflow-hidden shadow-xs mt-4">
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface-inset)] text-[var(--text-secondary)] text-xs border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[var(--accent)]">Component.jsx</span>
                <span className="text-[10px] bg-[var(--surface-hover)] text-[var(--text-muted)] px-1.5 py-0.5 rounded">
                  {targetType}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                leftIcon={
                  copied ? (
                    <Check className="w-3 h-3 text-[var(--accent)]" />
                  ) : (
                    <Copy className="w-3 h-3 text-[var(--text-muted)]" />
                  )
                }
                className="h-7 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </div>
            <pre className="p-4 bg-[var(--surface-inset)] text-[var(--accent)] font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
