import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  CheckCircle,
  RotateCcw,
  FilePlus,
  Save,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Code2,
  Sparkles,
  Terminal as TerminalIcon,
  SidebarClose,
  SidebarOpen,
} from "lucide-react";
import VSCodeEditor from "../components/VSCodeEditor.jsx";
import FileExplorer from "../components/FileExplorer.jsx";
import BottomPanel from "../components/BottomPanel.jsx";
import RightAssistantPanel from "../components/RightAssistantPanel.jsx";
import { analyzeCode, runCode } from "../services/api.js";
import { toast } from "../components/Toast.jsx";

const POSITIVE_MESSAGES = [
  "Great! Your code is correct.",
  "Perfect! Well done.",
  "Fantastic! You solved it.",
  "Correct! Nice work.",
  "Excellent coding!",
  "You did it!",
  "Great job!",
];

const LANGUAGE_STARTERS = {
  python: `# Python 3.14 Environment
name = "CodeSense"
print("Hello", name)
`,
  javascript: `// JavaScript Environment
const greeting = "Hello CodeSense";
console.log(greeting);
`,
  cpp: `// C++ Environment
#include <iostream>

int main() {
    std::cout << "Hello CodeSense in C++" << std::endl;
    return 0;
}
`,
  c: `// C Environment
#include <stdio.h>

int main() {
    printf("Hello CodeSense in C\\n");
    return 0;
}
`,
  java: `// Java Environment
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello CodeSense in Java");
    }
}
`,
};

const DEFAULT_FILES = {
  "main.py": LANGUAGE_STARTERS.python,
  "example.py": `# Example: Loop through list items safely
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    print(f"Item {index}: {fruit}")
`,
  "practice.py": `# Practice script - solve your challenges here
def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

scores = [85, 92, 78, 90]
print("Average score:", calculate_average(scores))
`,
};

const ERROR_PRESETS = [
  {
    label: "Syntax Error Example",
    filename: "syntax_error.py",
    language: "python",
    code: `if x > 5\n    print("x is greater than 5")\n`,
  },
  {
    label: "Name Error Example",
    filename: "name_error.py",
    language: "python",
    code: `total = 100\nprint(total_score)\n`,
  },
  {
    label: "Index Error Example",
    filename: "index_error.py",
    language: "python",
    code: `numbers = [10, 20, 30]\nprint(numbers[5])\n`,
  },
  {
    label: "Type Error Example",
    filename: "type_error.py",
    language: "python",
    code: `age = 22\nprint("Age: " + age)\n`,
  },
  {
    label: "Zero Division (Runtime Error)",
    filename: "runtime_error.py",
    language: "python",
    code: `a = 10\nb = 0\nprint(a / b)\n`,
  },
  {
    label: "JavaScript Example",
    filename: "script.js",
    language: "javascript",
    code: `const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled);\n`,
  },
  {
    label: "Correct Code Example",
    filename: "clean_code.py",
    language: "python",
    code: `def get_even_numbers(nums):\n    return [n for n in nums if n % 2 == 0]\n\nnumbers = [1, 2, 3, 4, 5, 6]\nprint("Evens:", get_even_numbers(numbers))\n`,
  },
];

export default function Analyzer({ appContext }) {
  // File management
  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("codesense_ide_files");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_FILES;
  });

  const [activeFile, setActiveFile] = useState(() => {
    const saved = localStorage.getItem("codesense_active_file");
    // Read files from localStorage directly since `files` state isn't yet initialized here
    try {
      const savedFiles = JSON.parse(localStorage.getItem("codesense_ide_files") || "{}");
      if (saved && savedFiles[saved]) return saved;
    } catch (e) {}
    return "main.py";
  });

  const [selectedLanguage, setSelectedLanguage] = useState("python");

  const [code, setCode] = useState(() => {
    if (appContext?.activeCode) return appContext.activeCode;
    return files[activeFile] || DEFAULT_FILES["main.py"];
  });

  // UI layout toggles
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState("problems");
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Error & Status states: "normal" | "error" | "success"
  const [visualState, setVisualState] = useState("normal");
  const [positiveMessage, setPositiveMessage] = useState(POSITIVE_MESSAGES[0]);
  const [detectedIssue, setDetectedIssue] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [executionOutput, setExecutionOutput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  // Sound preference from appContext
  const soundEnabled = appContext?.soundEnabled ?? true;

  // Track previous error signature to avoid repeat audio alerts
  const lastBeepSignatureRef = useRef("");
  const debounceTimerRef = useRef(null);
  const editorRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("codesense_ide_files", JSON.stringify(files));
      localStorage.setItem("codesense_active_file", activeFile);
    } catch (e) {}
  }, [files, activeFile]);

  // Sync external activeCode (e.g. from Practice or History buttons)
  useEffect(() => {
    if (appContext?.activeCode) {
      setCode(appContext.activeCode);
      setFiles((prev) => ({
        ...prev,
        [activeFile]: appContext.activeCode,
      }));
    }
  }, [appContext?.activeCode]);

  // Error Siren: 4-pulse rhythmic alert (beep-beep-beep-beep)
  const playSirenAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 4 quick rhythmic alert beeps: beep-beep-beep-beep
      const pulses = [0, 0.12, 0.24, 0.36];
      pulses.forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, ctx.currentTime + t);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + t + 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.08);
      });
    } catch (e) {}
  }, [soundEnabled]);

  // Positive chime
  const playSuccessChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {}
  }, [soundEnabled]);

  // Real-time error detection
  const performRealtimeCheck = useCallback(
    async (codeToCheck, currentFile, currentLang) => {
      const trimmed = codeToCheck.trim();
      if (!trimmed) {
        setDetectedIssue(null);
        setAnalysisData(null);
        setVisualState("normal");
        setRecommendation(null);
        lastBeepSignatureRef.current = "";
        return;
      }

      try {
        const data = await analyzeCode(trimmed, currentFile, currentLang);
        setAnalysisData(data);

        if (data.has_error) {
          const errorSig = `${data.line}_${data.error_category}_${data.error_message}`;
          setDetectedIssue(data);
          setVisualState("error");
          setRecommendation(data.recommendation || null);

          // Trigger 4-beep siren alert on NEW error
          if (lastBeepSignatureRef.current !== errorSig) {
            lastBeepSignatureRef.current = errorSig;
            playSirenAlert();
          }
        } else {
          // Code is clean! Rotate positive praise message
          setDetectedIssue(null);
          setVisualState("success");
          lastBeepSignatureRef.current = "";
          const randomMsg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
          setPositiveMessage(randomMsg);
        }
      } catch (err) {
        // Silent during fast typing
      }
    },
    [playSirenAlert]
  );

  function handleCodeChange(newCode) {
    setCode(newCode);
    setFiles((prev) => ({
      ...prev,
      [activeFile]: newCode,
    }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performRealtimeCheck(newCode, activeFile, selectedLanguage);
    }, 600);
  }

  useEffect(() => {
    performRealtimeCheck(code, activeFile, selectedLanguage);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // RUN CODE
  async function handleRunCode() {
    const trimmed = code.trim();
    if (!trimmed) {
      setExecutionOutput("No code to execute. Enter code statements first.");
      setBottomTab("output");
      setIsBottomCollapsed(false);
      return;
    }

    setIsRunning(true);
    setBottomTab("output");
    setIsBottomCollapsed(false);

    setTerminalLogs((prev) => [
      ...prev,
      { type: "info", text: `[${new Date().toLocaleTimeString()}] Running ${activeFile} (${selectedLanguage})...` },
    ]);

    try {
      const res = await runCode(trimmed, activeFile, selectedLanguage);

      if (res.success) {
        setExecutionOutput(res.output || "Process finished successfully with no output.");
        setVisualState("success");
        setDetectedIssue(null);
        playSuccessChime();
        const randomMsg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
        setPositiveMessage(randomMsg);
        setTerminalLogs((prev) => [
          ...prev,
          { type: "success", text: `✓ ${activeFile} executed successfully.` },
        ]);
        toast(`✓ ${activeFile} executed successfully.`, "success");
      } else {
        // Runtime error!
        setExecutionOutput(res.error || res.output || "Runtime execution error occurred.");
        setVisualState("error");
        playSirenAlert();

        const issueData = {
          has_error: true,
          error_category: res.error_category || "Runtime Error",
          error_type: res.error_type || "Runtime Error",
          error_message: res.error_message || res.error || "Runtime error occurred",
          line: res.line,
          explanation: res.recommendation?.why || "An error occurred during execution.",
          suggested_fix: "Inspect the traceback and validate inputs or add try/except blocks.",
          recommendation: res.recommendation,
        };

        setDetectedIssue(issueData);
        if (res.recommendation) setRecommendation(res.recommendation);

        setTerminalLogs((prev) => [
          ...prev,
          { type: "error", text: `🔴 ${res.error_category || "Runtime Error"} in ${activeFile}: Ln ${res.line || "?"}` },
        ]);
        toast(`🔴 ${res.error_category || "Runtime Error"} in ${activeFile} (Ln ${res.line || "?"})`, "error");
      }
    } catch (err) {
      setExecutionOutput(`Failed to execute code: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }

  // DEEP ANALYZE CODE
  async function handleAnalyzeDeep() {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    setIsBottomCollapsed(false);

    try {
      const data = await analyzeCode(trimmed, activeFile, selectedLanguage);
      setAnalysisData(data);

      if (data.has_error) {
        setDetectedIssue(data);
        setVisualState("error");
        setRecommendation(data.recommendation || null);
        setBottomTab("problems");
        playSirenAlert();
      } else {
        setDetectedIssue(null);
        setVisualState("success");
        setBottomTab("problems");
        playSuccessChime();
      }
    } catch (err) {
      setExecutionOutput(`Analysis error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleSaveCode() {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: code,
    }));
    setSaveStatus("Saved!");
    setTimeout(() => setSaveStatus(""), 2000);
    toast(`💾 ${activeFile} saved.`, "success", 2000);
  }

  function handleResetCode() {
    const defaultContent = DEFAULT_FILES[activeFile] || LANGUAGE_STARTERS[selectedLanguage] || "";
    setCode(defaultContent);
    setFiles((prev) => ({
      ...prev,
      [activeFile]: defaultContent,
    }));
    performRealtimeCheck(defaultContent, activeFile, selectedLanguage);
    toast("Editor reset to default.", "info", 2000);
  }

  function handleSelectFile(fileName) {
    setActiveFile(fileName);
    const content = files[fileName] || "";
    setCode(content);
    // Auto-detect language by extension
    if (fileName.endsWith(".js")) setSelectedLanguage("javascript");
    else if (fileName.endsWith(".cpp")) setSelectedLanguage("cpp");
    else if (fileName.endsWith(".c")) setSelectedLanguage("c");
    else if (fileName.endsWith(".java")) setSelectedLanguage("java");
    else setSelectedLanguage("python");

    performRealtimeCheck(content, fileName, selectedLanguage);
  }

  function handleLanguageChange(e) {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    const starter = LANGUAGE_STARTERS[lang] || "";
    setCode(starter);
    setFiles((prev) => ({
      ...prev,
      [activeFile]: starter,
    }));
    performRealtimeCheck(starter, activeFile, lang);
  }

  function handleCreateFile(newFileName) {
    setFiles((prev) => ({
      ...prev,
      [newFileName]: `# ${newFileName}\n`,
    }));
    setActiveFile(newFileName);
    setCode(`# ${newFileName}\n`);
    performRealtimeCheck(`# ${newFileName}\n`, newFileName, selectedLanguage);
    toast(`📄 Created ${newFileName}`, "info", 2000);
  }

  function handleRenameFile(oldName, newName) {
    if (oldName === newName || !newName) return;
    setFiles((prev) => {
      const updated = {};
      Object.keys(prev).forEach((k) => {
        if (k === oldName) updated[newName] = prev[oldName];
        else updated[k] = prev[k];
      });
      return updated;
    });
    if (activeFile === oldName) setActiveFile(newName);
  }

  function handleDeleteFile(fileName) {
    if (Object.keys(files).length <= 1) return;
    const remaining = { ...files };
    delete remaining[fileName];
    setFiles(remaining);

    if (activeFile === fileName) {
      const nextFile = Object.keys(remaining)[0];
      setActiveFile(nextFile);
      setCode(remaining[nextFile]);
      performRealtimeCheck(remaining[nextFile], nextFile, selectedLanguage);
    }
  }

  function handleSelectPreset(e) {
    const idx = Number(e.target.value);
    const preset = ERROR_PRESETS[idx];
    if (preset) {
      setCode(preset.code);
      if (preset.language) setSelectedLanguage(preset.language);
      setFiles((prev) => ({
        ...prev,
        [activeFile]: preset.code,
      }));
      performRealtimeCheck(preset.code, activeFile, preset.language || selectedLanguage);
    }
    e.target.value = "";
  }

  function handleLineJump(line) {
    if (editorRef.current && line) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      editorRef.current.focus();
    }
  }

  function handleApplySuggestion(snippet) {
    setCode((prev) => prev + snippet);
  }

  const problemsList = detectedIssue
    ? [
        {
          line: detectedIssue.line,
          column: detectedIssue.column,
          category: detectedIssue.error_category || "Error",
          message: detectedIssue.error_message || "Code issue detected",
          explanation: detectedIssue.explanation,
          suggested_fix: detectedIssue.suggested_fix,
        },
      ]
    : [];

  return (
    <div
      className={`vscode-ide-container state-${visualState}`}
      id="codesense-ide"
      data-testid="codesense-ide"
    >
      {/* Visual pulse aura */}
      <div className={`ide-aura-indicator aura-${visualState}`} aria-hidden="true" />

      {/* TOP TOOLBAR */}
      <header className="vscode-top-toolbar" aria-label="Editor Action Toolbar">
        <div className="toolbar-left">
          <div className="ide-brand-chip">
            <Code2 size={16} className="brand-chip-icon" />
            <span className="brand-chip-text">CodeSense IDE</span>
          </div>

          <button
            className="toolbar-btn primary-run"
            onClick={handleRunCode}
            disabled={isRunning}
            title="Run Code (Ctrl+Enter)"
            id="run-code-btn"
          >
            {isRunning ? <Loader2 size={14} className="spin" /> : <Play size={14} fill="currentColor" />}
            <span>Run</span>
          </button>

          <button
            className="toolbar-btn analyze-btn"
            onClick={handleAnalyzeDeep}
            disabled={isAnalyzing}
            title="Perform Code Analysis & Complexity Check"
            id="analyze-code-btn"
          >
            {isAnalyzing ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
            <span>Analyze Code</span>
          </button>

          <button
            className="toolbar-btn text-btn"
            onClick={handleResetCode}
            title="Reset code editor"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            className="toolbar-btn text-btn"
            onClick={() => handleCreateFile(`script_${Object.keys(files).length + 1}.py`)}
            title="New File"
          >
            <FilePlus size={13} />
            <span>New File</span>
          </button>

          <button
            className="toolbar-btn text-btn"
            onClick={handleSaveCode}
            title="Save File (Ctrl+S)"
          >
            <Save size={13} />
            <span>{saveStatus || "Save"}</span>
          </button>
        </div>

        <div className="toolbar-right">
          {/* Language Selector */}
          <select
            className="toolbar-preset-select language-picker"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            title="Select Programming Language"
            aria-label="Programming Language"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>

          {/* Preset Selector */}
          <select
            className="toolbar-preset-select"
            onChange={handleSelectPreset}
            defaultValue=""
            title="Load an error example preset"
          >
            <option value="" disabled>
              ⚡ Presets...
            </option>
            {ERROR_PRESETS.map((preset, idx) => (
              <option key={idx} value={idx}>
                {preset.label}
              </option>
            ))}
          </select>

          {/* Sound Siren Toggle */}
          <button
            className={`toolbar-icon-toggle ${soundEnabled ? "on" : "off"}`}
            onClick={() => appContext?.setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Audio Siren ON (click to mute)" : "Audio Siren OFF (click to unmute)"}
            aria-label="Toggle error audio siren"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="toggle-label">{soundEnabled ? "Siren ON" : "Muted"}</span>
          </button>

          {/* Assistant Toggle Button */}
          <button
            className="toolbar-icon-toggle on"
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            title={isAssistantOpen ? "Hide Assistant Panel" : "Show Assistant Panel"}
          >
            <Sparkles size={14} />
            <span className="toggle-label">Assistant</span>
          </button>

          {/* State Badge */}
          {visualState === "error" && (
            <div className="state-badge badge-error" title="Syntax or Runtime Error Detected">
              <AlertCircle size={14} />
              <span>Issue Found</span>
            </div>
          )}

          {visualState === "success" && (
            <div className="state-badge badge-success" title="Code is validated clean">
              <CheckCircle2 size={14} />
              <span>✓ CODE IS CORRECT</span>
            </div>
          )}
        </div>
      </header>

      {/* FILE TABS BAR */}
      <div className="vscode-tabs-bar">
        <div className="tabs-scroll-area">
          {Object.keys(files).map((fileName) => (
            <div
              key={fileName}
              className={`editor-tab ${fileName === activeFile ? "active" : ""}`}
              onClick={() => handleSelectFile(fileName)}
            >
              <span className="tab-filename">{fileName}</span>
              {Object.keys(files).length > 1 && (
                <button
                  className="tab-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(fileName);
                  }}
                  title="Close file"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN 3-COLUMN WORKSPACE: SIDEBAR + EDITOR + ASSISTANT */}
      <div className="vscode-main-workspace three-column-workspace">
        {/* Activity Bar */}
        <aside className="vscode-activity-bar" aria-label="Activity Bar">
          <button
            className={`activity-icon-btn ${isExplorerOpen ? "active" : ""}`}
            onClick={() => setIsExplorerOpen(!isExplorerOpen)}
            title="Toggle Explorer"
          >
            <FolderTree size={18} />
          </button>
          <button
            className="activity-icon-btn"
            onClick={() => {
              setIsBottomCollapsed(false);
              setBottomTab("problems");
            }}
            title="Problems Panel"
          >
            <AlertCircle size={18} />
            {detectedIssue && <span className="activity-badge-dot" />}
          </button>
          <button
            className="activity-icon-btn"
            onClick={() => {
              setIsBottomCollapsed(false);
              setBottomTab("output");
            }}
            title="Terminal Output"
          >
            <TerminalIcon size={18} />
          </button>
        </aside>

        {/* 1. Left Explorer Sidebar */}
        <FileExplorer
          files={files}
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          isOpen={isExplorerOpen}
        />

        {/* 2. Center Editor + Bottom Dock */}
        <div className="vscode-editor-pane">
          {/* Top banner: Error vs Success */}
          {visualState === "error" && detectedIssue && (
            <div className="editor-error-banner" role="alert">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={16} className="text-error" />
                <span>
                  <strong>{detectedIssue.error_category}:</strong> {detectedIssue.error_message}
                  {detectedIssue.line ? ` (Line ${detectedIssue.line})` : ""}
                </span>
              </div>
              <button
                className="banner-jump-btn"
                onClick={() => handleLineJump(detectedIssue.line)}
              >
                Go to Line {detectedIssue.line || 1} &rarr;
              </button>
            </div>
          )}

          {visualState === "success" && (
            <div className="editor-success-banner" role="status">
              <CheckCircle2 size={16} className="text-success" />
              <span>
                <strong>{positiveMessage}</strong> Your syntax is valid and the program is ready to run.
              </span>
            </div>
          )}

          {/* Monaco Editor Container */}
          <div className="monaco-host-container">
            <VSCodeEditor
              code={code}
              onChange={handleCodeChange}
              onRun={handleRunCode}
              onSave={handleSaveCode}
              errorLine={detectedIssue?.line}
              errorMessage={detectedIssue?.error_message}
              errorCategory={detectedIssue?.error_category}
              language={selectedLanguage}
              theme={appContext?.theme || "dark"}
              editorRefOut={editorRef}
            />
          </div>

          {/* Bottom Dock Console */}
          <BottomPanel
            activeTab={bottomTab}
            setActiveTab={setBottomTab}
            problems={problemsList}
            output={executionOutput}
            terminalLogs={terminalLogs}
            recommendation={recommendation}
            activeFileName={activeFile}
            onLineClick={handleLineJump}
            onClearOutput={() => setExecutionOutput("")}
            isCollapsed={isBottomCollapsed}
            setIsCollapsed={setIsBottomCollapsed}
          />
        </div>

        {/* 3. Right Assistant Panel */}
        <RightAssistantPanel
          analysisData={analysisData}
          activeLanguage={selectedLanguage}
          isOpen={isAssistantOpen}
          onToggleOpen={() => setIsAssistantOpen(!isAssistantOpen)}
          onApplySuggestion={handleApplySuggestion}
        />
      </div>

      {/* STATUS BAR */}
      <footer className="vscode-status-bar" aria-label="IDE Status Bar">
        <div className="status-bar-left">
          <span className="status-item ready">
            <span className={`status-dot dot-${visualState}`} />
            {visualState === "error"
              ? "Error detected"
              : visualState === "success"
              ? "Code is clean"
              : "CodeSense Ready"}
          </span>
          <span className="status-item problems-badge">
            <AlertCircle size={12} />
            <span>{problemsList.length} problems</span>
          </span>
        </div>

        <div className="status-bar-right">
          <span className="status-item">UTF-8</span>
          <span className="status-item" style={{ textTransform: "capitalize" }}>
            {selectedLanguage}
          </span>
          <span className="status-item">Spaces: 4</span>
          <span className="status-item shortcut-hint">
            Ctrl+Enter: Run | Tab: Accept Suggestion | Ctrl+S: Save
          </span>
        </div>
      </footer>
    </div>
  );
}