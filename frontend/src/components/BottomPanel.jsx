import { useState } from "react";
import {
  AlertCircle,
  Terminal,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BottomPanel({
  activeTab,
  setActiveTab,
  problems = [],
  output = "",
  terminalLogs = [],
  recommendation = null,
  activeFileName = "main.py",
  onLineClick,
  onClearOutput,
  isCollapsed = false,
  setIsCollapsed,
}) {
  const [terminalInput, setTerminalInput] = useState("");
  const [interactiveHistory, setInteractiveHistory] = useState([]);

  if (isCollapsed) {
    return (
      <div className="bottom-panel-collapsed-bar" onClick={() => setIsCollapsed(false)}>
        <div className="collapsed-tab">
          <AlertCircle size={14} className={problems.length > 0 ? "text-error" : "text-success"} />
          <span>PROBLEMS {problems.length}</span>
        </div>
        <div className="collapsed-tab">
          <FileText size={14} />
          <span>OUTPUT</span>
        </div>
        <div className="collapsed-tab">
          <Terminal size={14} />
          <span>TERMINAL</span>
        </div>
        {recommendation && (
          <div className="collapsed-tab">
            <BookOpen size={14} className="text-primary" />
            <span>RECOMMENDATION</span>
          </div>
        )}
        <button
          className="collapse-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          title="Expand Panel"
        >
          <ChevronUp size={15} />
        </button>
      </div>
    );
  }

  function handleTerminalSubmit(e) {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;
    setInteractiveHistory((prev) => [
      ...prev,
      { type: "cmd", text: `$ ${cmd}` },
      {
        type: "res",
        text: cmd === "help"
          ? "CodeSense Terminal: Use the Run (▶) button or Ctrl+Enter to execute python code."
          : cmd === "clear"
          ? ""
          : `codesense: '${cmd}' executed. Type 'help' for available guidance.`,
      },
    ]);
    if (cmd === "clear") {
      setInteractiveHistory([]);
    }
    setTerminalInput("");
  }

  return (
    <section className="vscode-bottom-panel" aria-label="Editor Output and Problems Panel">
      <div className="bottom-panel-header">
        <div className="bottom-panel-tabs">
          <button
            className={`bottom-tab ${activeTab === "problems" ? "active" : ""}`}
            onClick={() => setActiveTab("problems")}
            aria-selected={activeTab === "problems"}
          >
            <AlertCircle
              size={14}
              className={problems.length > 0 ? "tab-icon-error" : "tab-icon-muted"}
            />
            <span>PROBLEMS</span>
            <span
              className={`tab-counter ${
                problems.length > 0 ? "counter-error" : "counter-zero"
              }`}
            >
              {problems.length}
            </span>
          </button>

          <button
            className={`bottom-tab ${activeTab === "output" ? "active" : ""}`}
            onClick={() => setActiveTab("output")}
            aria-selected={activeTab === "output"}
          >
            <FileText size={14} />
            <span>OUTPUT</span>
          </button>

          <button
            className={`bottom-tab ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => setActiveTab("terminal")}
            aria-selected={activeTab === "terminal"}
          >
            <Terminal size={14} />
            <span>TERMINAL</span>
          </button>

          <button
            className={`bottom-tab ${activeTab === "recommendation" ? "active" : ""}`}
            onClick={() => setActiveTab("recommendation")}
            aria-selected={activeTab === "recommendation"}
          >
            <BookOpen size={14} className="tab-icon-primary" />
            <span>RECOMMENDATION</span>
            {recommendation && <span className="tab-dot-indicator" />}
          </button>
        </div>

        <div className="bottom-panel-actions">
          {activeTab === "output" && (
            <button
              className="panel-tool-btn"
              onClick={onClearOutput}
              title="Clear Output"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            className="panel-tool-btn"
            onClick={() => setIsCollapsed(true)}
            title="Minimize Panel"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="bottom-panel-content">
        {/* PROBLEMS TAB */}
        {activeTab === "problems" && (
          <div className="tab-view problems-view">
            {problems.length === 0 ? (
              <div className="empty-problems-state">
                <CheckCircle2 size={18} className="text-success" />
                <span>No problems have been detected in the workspace.</span>
              </div>
            ) : (
              <div className="problems-list">
                {problems.map((prob, idx) => (
                  <div
                    key={idx}
                    className="problem-item"
                    onClick={() => onLineClick && onLineClick(prob.line)}
                    title="Click to jump to line in editor"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="problem-icon">
                      <AlertCircle size={15} className="text-error" />
                    </div>
                    <div className="problem-details">
                      <div className="problem-title-row">
                        <span className="problem-category">{prob.category}</span>
                        <span className="problem-location">
                          {activeFileName} [Ln {prob.line || 1}
                          {prob.column ? `, Col ${prob.column}` : ""}]
                        </span>
                      </div>
                      <p className="problem-msg">{prob.message}</p>
                      {prob.explanation && (
                        <p className="problem-explanation">
                          <strong>Explanation:</strong> {prob.explanation}
                        </p>
                      )}
                      {prob.suggested_fix && (
                        <div className="problem-fix-row">
                          <span className="fix-label">Suggested fix:</span>
                          <span className="fix-text">{prob.suggested_fix}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OUTPUT TAB */}
        {activeTab === "output" && (
          <div className="tab-view output-view">
            <div className="output-console-area">
              <div className="console-command-header">
                <span className="console-prompt">&gt;</span> python {activeFileName}
              </div>
              {output ? (
                <pre className="output-pre">{output}</pre>
              ) : (
                <div className="output-placeholder">
                  [Program has not been executed yet. Click &quot;▶ Run&quot; or press Ctrl+Enter]
                </div>
              )}
            </div>
          </div>
        )}

        {/* TERMINAL TAB */}
        {activeTab === "terminal" && (
          <div className="tab-view terminal-view">
            <div className="terminal-log-flow">
              <div className="terminal-banner">
                CodeSense Python Interactive Terminal [Windows subshell]
                <br />
                Type &apos;help&apos; for quick commands, &apos;clear&apos; to reset.
              </div>
              {terminalLogs.map((log, i) => (
                <div key={i} className={`log-line ${log.type || ""}`}>
                  {log.text}
                </div>
              ))}
              {interactiveHistory.map((item, i) => (
                <div key={i} className={`log-line ${item.type}`}>
                  {item.text}
                </div>
              ))}
              <form onSubmit={handleTerminalSubmit} className="terminal-input-row">
                <span className="terminal-cli-prompt">&gt;&gt;&gt;</span>
                <input
                  type="text"
                  className="terminal-cli-input"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Enter python expression or command..."
                />
              </form>
            </div>
          </div>
        )}

        {/* RECOMMENDATION TAB */}
        {activeTab === "recommendation" && (
          <div className="tab-view recommendation-view">
            {recommendation ? (
              <div className="recommendation-content-box">
                <div className="rec-header-row">
                  <div className="rec-title-wrap">
                    <span className="rec-badge">📚 LEARNING RECOMMENDATION</span>
                    <h3>{recommendation.concept}</h3>
                    <span className="rec-difficulty badge">
                      Level: {recommendation.difficulty || "Beginner"}
                    </span>
                  </div>
                  <div className="rec-actions-top">
                    <Link
                      to="/learn"
                      className="learn-more-btn"
                      title="Open Full Learning Curriculum"
                    >
                      <span>Explore Curriculum</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                <div className="rec-body-grid">
                  <div className="rec-section why-section">
                    <h4>Why learn this?</h4>
                    <p>{recommendation.why}</p>

                    <h4>Key Topics to Master:</h4>
                    <ul className="rec-topics-list">
                      {(recommendation.topics || []).map((topic, i) => (
                        <li key={i}>• {topic}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rec-section code-example-section">
                    <h4>Example Reference Code:</h4>
                    <pre className="rec-example-pre">
                      <code>{recommendation.example}</code>
                    </pre>

                    <h4>Practice Suggestion:</h4>
                    <p className="rec-practice-text">
                      {recommendation.practice}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-recommendation-state">
                <Sparkles size={24} className="text-primary" />
                <p>
                  No active error recommendations. Write or analyze code with an error to see tailored concept suggestions!
                </p>
                <Link to="/learn" className="secondary-button">
                  Browse All Python Concepts &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
