import { useState } from "react";
import {
  Sparkles,
  Lightbulb,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  HardDrive,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function RightAssistantPanel({
  analysisData,
  activeLanguage = "python",
  isOpen = true,
  onToggleOpen,
  onApplySuggestion,
}) {
  const [activeTab, setActiveTab] = useState("suggestions");

  if (!isOpen) {
    return (
      <aside className="assistant-sidebar-collapsed" onClick={onToggleOpen} title="Expand CodeSense Assistant">
        <button className="expand-assistant-btn">
          <ChevronLeft size={16} />
        </button>
        <span className="vertical-label">ASSISTANT</span>
        <Sparkles size={16} className="text-primary" />
      </aside>
    );
  }

  const hasError = analysisData?.has_error;
  const statusType = analysisData?.status_type || (hasError ? "error" : "correct");
  const complexity = analysisData?.complexity || { time: "O(1)", space: "O(1)" };
  const improvements = analysisData?.improvements || [];
  const learnNext = analysisData?.learn_next || [];

  return (
    <aside className="vscode-assistant-panel" aria-label="CodeSense Intelligent Assistant">
      <div className="assistant-header">
        <div className="assistant-header-title">
          <Sparkles size={16} className="text-primary" />
          <span>CodeSense Assistant</span>
        </div>
        <button
          className="panel-tool-btn"
          onClick={onToggleOpen}
          title="Collapse Assistant"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Tri-State Status Pill */}
      <div className="assistant-status-ribbon">
        {statusType === "error" && (
          <div className="ribbon-pill error">
            <XCircle size={14} />
            <span>❌ Error Detected — Code Cannot Execute</span>
          </div>
        )}
        {statusType === "improvement" && (
          <div className="ribbon-pill improvement">
            <AlertTriangle size={14} />
            <span>⚠️ Works, but could be improved</span>
          </div>
        )}
        {statusType === "correct" && (
          <div className="ribbon-pill correct">
            <CheckCircle2 size={14} />
            <span>✅ Correct &amp; Clean Code</span>
          </div>
        )}
      </div>

      {/* Sub tabs */}
      <div className="assistant-tabs">
        <button
          className={`assistant-tab ${activeTab === "suggestions" ? "active" : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          <Lightbulb size={13} />
          <span>Suggestions</span>
        </button>
        <button
          className={`assistant-tab ${activeTab === "analysis" ? "active" : ""}`}
          onClick={() => setActiveTab("analysis")}
        >
          <Search size={13} />
          <span>Analysis</span>
        </button>
        <button
          className={`assistant-tab ${activeTab === "improvements" ? "active" : ""}`}
          onClick={() => setActiveTab("improvements")}
        >
          <AlertTriangle size={13} />
          <span>Improvements {improvements.length > 0 ? `(${improvements.length})` : ""}</span>
        </button>
        <button
          className={`assistant-tab ${activeTab === "learn" ? "active" : ""}`}
          onClick={() => setActiveTab("learn")}
        >
          <BookOpen size={13} />
          <span>Learn Next</span>
        </button>
      </div>

      <div className="assistant-content-body">
        {/* SUGGESTIONS TAB */}
        {activeTab === "suggestions" && (
          <div className="assistant-view suggestions-view">
            <div className="assistant-card">
              <h4>💡 What could you write next?</h4>
              <p className="assistant-sub">
                Intelligent autocomplete pattern for {capitalize(activeLanguage)}:
              </p>

              {activeLanguage === "python" ? (
                <div className="pattern-suggestion-box">
                  <code>for i in range(10):</code>
                  <span className="pattern-desc">Loop through numbers 0 to 9</span>
                  <button
                    className="apply-pattern-btn"
                    onClick={() => onApplySuggestion && onApplySuggestion("\nfor i in range(10):\n    print(i)\n")}
                  >
                    Insert Pattern
                  </button>
                </div>
              ) : (
                <div className="pattern-suggestion-box">
                  <code>for (let i = 0; i &lt; 10; i++)</code>
                  <span className="pattern-desc">Standard iteration construct</span>
                </div>
              )}
            </div>

            <div className="assistant-card">
              <h4>🎯 Coding Tip</h4>
              <p>
                Press <kbd>Tab</kbd> or <kbd>Enter</kbd> to accept ghost text code suggestions while typing in the editor.
              </p>
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <div className="assistant-view analysis-view">
            <div className="assistant-card">
              <h4>🔍 What the Code Does</h4>
              <p className="analysis-summary-text">
                {analysisData?.summary || "Sequential statement execution. Verifies syntax and data flow."}
              </p>
            </div>

            <div className="assistant-card complexity-card">
              <h4>⚡ Algorithmic Complexity</h4>
              <div className="complexity-grid">
                <div className="complexity-item">
                  <div className="comp-label">
                    <Clock size={13} /> Time Complexity
                  </div>
                  <strong className="comp-value">{complexity.time}</strong>
                </div>
                <div className="complexity-item">
                  <div className="comp-label">
                    <HardDrive size={13} /> Space Complexity
                  </div>
                  <strong className="comp-value">{complexity.space}</strong>
                </div>
              </div>
            </div>

            {analysisData?.variables?.length > 0 && (
              <div className="assistant-card">
                <h4>Variables Used</h4>
                <div className="tag-cloud">
                  {analysisData.variables.map((v) => (
                    <span key={v} className="var-chip">{v}</span>
                  ))}
                </div>
              </div>
            )}

            {analysisData?.functions?.length > 0 && (
              <div className="assistant-card">
                <h4>Functions Declared</h4>
                <div className="tag-cloud">
                  {analysisData.functions.map((f) => (
                    <span key={f} className="func-chip">{f}()</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IMPROVEMENTS TAB */}
        {activeTab === "improvements" && (
          <div className="assistant-view improvements-view">
            {hasError ? (
              <div className="assistant-card error-card">
                <div className="card-error-header">
                  <XCircle size={16} className="text-error" />
                  <h4>❌ Critical Error Found</h4>
                </div>
                <p><strong>{analysisData.error_category}:</strong> {analysisData.error_message}</p>
                {analysisData.suggested_fix && (
                  <div className="suggested-fix-box">
                    <strong>Suggested Fix:</strong> {analysisData.suggested_fix}
                  </div>
                )}
              </div>
            ) : null}

            {improvements.length === 0 && !hasError ? (
              <div className="empty-improvements-card">
                <CheckCircle2 size={24} className="text-success" />
                <p>No code smells or style issues detected! Your code follows solid best practices.</p>
              </div>
            ) : (
              improvements.map((imp, idx) => (
                <div key={idx} className="assistant-card improvement-card">
                  <div className="card-warn-header">
                    <AlertTriangle size={15} className="text-accent" />
                    <h4>⚠️ {imp.type?.toUpperCase() || "IMPROVEMENT"}</h4>
                  </div>
                  <p>{imp.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* LEARN NEXT TAB */}
        {activeTab === "learn" && (
          <div className="assistant-view learn-next-view">
            <h4>📚 What Should You Learn Next?</h4>
            <p className="assistant-sub">
              Recommended concepts based on your current code:
            </p>

            {learnNext.length === 0 ? (
              <div className="assistant-card">
                <h5>Control Flow &amp; Logic</h5>
                <p>Explore conditional branches and loops to build interactive logic.</p>
                <Link to="/learn" className="learn-link-btn">
                  <span>Explore Concepts</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              learnNext.map((item, idx) => (
                <div key={idx} className="assistant-card learn-card">
                  <div className="learn-card-top">
                    <h5>{item.topic}</h5>
                    <span className="badge">{item.difficulty || "Beginner"}</span>
                  </div>
                  <p>{item.explanation}</p>
                  <Link to="/learn" className="learn-link-btn">
                    <span>Study Concept</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
