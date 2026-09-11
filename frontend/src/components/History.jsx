import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Search,
  Code2,
} from "lucide-react";
import { getHistory } from "../services/api.js";

/**
 * History – shows recent code analysis / execution attempts as a clickable timeline.
 * Used as a sidebar widget or standalone component.
 */
export default function History({ onSelectCode, maxItems = 20 }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  function loadHistory() {
    setLoading(true);
    setError(null);
    getHistory()
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load history. Check that the backend is running.");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadHistory();
  }, []);

  /* Filter by search */
  const filtered = history
    .filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (item.error_category || "").toLowerCase().includes(q) ||
        (item.concept || "").toLowerCase().includes(q) ||
        (item.filename || "").toLowerCase().includes(q) ||
        (item.status || "").toLowerCase().includes(q)
      );
    })
    .slice(0, maxItems);

  /* Format timestamp */
  function formatTime(ts) {
    if (!ts) return "";
    try {
      const date = new Date(`${ts}Z`);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) {
        const h = Math.floor(diffMins / 60);
        return `${h}h ago`;
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  function getIcon(item) {
    const isRun = item.action_type === "run";
    const isError = item.has_error;
    if (isRun && isError) return <AlertTriangle size={14} className="hist-icon error" />;
    if (isRun && !isError) return <Play size={13} className="hist-icon success" />;
    if (!isRun && isError) return <XCircle size={14} className="hist-icon error" />;
    return <CheckCircle2 size={14} className="hist-icon success" />;
  }

  function getLabel(item) {
    const isRun = item.action_type === "run";
    const isError = item.has_error;
    if (isRun && isError) return item.error_category || "Runtime Error";
    if (isRun) return "Correct Execution";
    if (isError) return item.error_category || "Error Detected";
    return "Correct Code";
  }

  if (loading) {
    return (
      <div className="hist-loading">
        <RefreshCw size={16} className="spin hist-load-icon" />
        <span>Loading history…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hist-error-state">
        <AlertTriangle size={16} className="hist-icon error" />
        <p>{error}</p>
        <button className="hist-retry-btn" onClick={loadHistory}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="hist-container">
      {/* Header */}
      <div className="hist-header">
        <div className="hist-title-row">
          <Clock size={15} className="text-primary" />
          <span className="hist-title">Recent Attempts</span>
          <span className="hist-count-badge">{history.length}</span>
        </div>
        <button className="hist-refresh-btn" onClick={loadHistory} title="Refresh history">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Search */}
      {history.length > 5 && (
        <div className="hist-search-row">
          <Search size={13} className="hist-search-icon" />
          <input
            className="hist-search-input"
            type="text"
            placeholder="Filter by category, concept…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter history"
          />
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="hist-empty">
          <Code2 size={24} className="hist-empty-icon" />
          <p>
            {search
              ? "No history entries match your search."
              : "No history yet. Start writing and running code in the Editor!"}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="hist-timeline">
        {filtered.map((item) => (
          <button
            key={item.id}
            className={`hist-item ${item.has_error ? "hist-item-error" : "hist-item-success"}`}
            onClick={() => onSelectCode && item.code && onSelectCode(item.code)}
            title={`Click to load this code into the editor\n${item.code?.slice(0, 120) || ""}`}
            aria-label={`History entry: ${getLabel(item)}, ${formatTime(item.created_at)}`}
          >
            <div className="hist-item-icon-wrap">{getIcon(item)}</div>

            <div className="hist-item-body">
              <div className="hist-item-top">
                <span className="hist-item-label">{getLabel(item)}</span>
                <span className="hist-item-time">{formatTime(item.created_at)}</span>
              </div>

              <div className="hist-item-meta">
                <span className="hist-item-file">{item.filename || "main.py"}</span>
                {item.has_error && item.concept && (
                  <span className="hist-item-concept">
                    <BookOpen size={11} />
                    {item.concept}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}