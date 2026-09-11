import { useState, useEffect } from "react";
import { Clock, Code2, AlertTriangle, CheckCircle2, RotateCw, ExternalLink, Play, FileCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/api.js";

export default function HistoryPage({ onSelectCode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  function fetchHistory() {
    setLoading(true);
    setError("");
    getHistory()
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError("History is currently unavailable. Ensure the CodeSense server is running.");
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  function handleOpenInAnalyzer(code) {
    if (onSelectCode) {
      onSelectCode(code);
    } else {
      sessionStorage.setItem("codesense_code", code);
    }
    navigate("/analyzer");
  }

  return (
    <section className="page-section history-page-container">
      <div className="section-heading">
        <Clock size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Audit &amp; Revision Log</p>
          <h1>Analysis &amp; Execution History</h1>
        </div>
        <button
          className="secondary-button refresh-btn"
          onClick={fetchHistory}
          title="Refresh History"
        >
          <RotateCw size={16} /> Refresh
        </button>
      </div>

      <p className="section-subtext">
        Review your past Python code runs, ML analyses, detected errors, and tailored concept revisions.
      </p>

      {error ? <div className="notice error-notice">{error}</div> : null}

      {loading ? (
        <div className="loading-state">
          <RotateCw className="spin" size={28} />
          <p>Loading your history...</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>File</th>
                <th>Action</th>
                <th>Error</th>
                <th>Category</th>
                <th>Concept</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6">
                    No history recorded yet. Start by writing or running code in the Code Editor!
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const isRun = item.action_type === "run";
                  const hasError = item.has_error;
                  const status = item.status || (hasError ? "Needs Revision" : "Correct");

                  return (
                    <tr
                      key={item.id}
                      className={hasError ? "history-row-error" : "history-row-success"}
                    >
                      <td className="timestamp-cell">
                        {new Date(item.created_at ? `${item.created_at}Z` : Date.now()).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <div className="file-cell">
                          <FileCode size={14} className="file-cell-icon" />
                          <span className="font-semibold">{item.filename || "main.py"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isRun ? "badge-run" : "badge-analysis"}`}>
                          {isRun ? <Play size={11} /> : <Code2 size={11} />}
                          <span>{isRun ? "Run" : "Analyze"}</span>
                        </span>
                      </td>
                      <td>
                        {hasError ? (
                          <span className="text-error font-medium">
                            {item.error_type || item.error_category || "Error Detected"}
                          </span>
                        ) : (
                          <span className="text-muted">No Error</span>
                        )}
                      </td>
                      <td>
                        <span className="category-cell">
                          {hasError ? item.error_category || "—" : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="concept-cell">
                          {item.concept && hasError ? item.concept : "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            status === "Correct" ? "success-badge" : "error-badge"
                          }`}
                        >
                          {status === "Correct" ? (
                            <>
                              <CheckCircle2 size={12} /> Correct
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} /> Needs Revision
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-link"
                            onClick={() => setSelectedItem(item)}
                            title="View Code & Details"
                          >
                            <Code2 size={15} /> Details
                          </button>
                          <button
                            className="btn-link btn-link-primary"
                            onClick={() => handleOpenInAnalyzer(item.code)}
                            title="Open code in CodeSense IDE"
                          >
                            <ExternalLink size={15} /> Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Code Details Modal */}
      {selectedItem ? (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Details: {selectedItem.filename || "main.py"} (#{selectedItem.id})</h3>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-meta-grid">
                <div>
                  <span className="meta-label">Status</span>
                  <span className={selectedItem.has_error ? "badge error-badge" : "badge success-badge"}>
                    {selectedItem.status || (selectedItem.has_error ? "Needs Revision" : "Correct")}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Category</span>
                  <strong>{selectedItem.error_category || "None"}</strong>
                </div>
                <div>
                  <span className="meta-label">Concept to Revise</span>
                  <strong>{selectedItem.concept || "—"}</strong>
                </div>
                <div>
                  <span className="meta-label">Action</span>
                  <strong>{selectedItem.action_type === "run" ? "Code Execution" : "Deep Analysis"}</strong>
                </div>
              </div>

              <div className="code-snippet-box">
                <span className="snippet-label">Submitted Code</span>
                <pre>
                  <code>{selectedItem.code}</code>
                </pre>
              </div>

              {selectedItem.execution_result && (
                <div className="modal-output-box">
                  <span className="snippet-label">Output / Result</span>
                  <pre className="output-pre">
                    <code>{selectedItem.execution_result}</code>
                  </pre>
                </div>
              )}

              {selectedItem.result?.explanation && (
                <div className="modal-explanation">
                  <strong>Explanation:</strong> {selectedItem.result.explanation}
                </div>
              )}
              {selectedItem.result?.suggested_fix && (
                <div className="modal-fix">
                  <strong>Suggested Fix:</strong> {selectedItem.result.suggested_fix}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="primary-button"
                onClick={() => handleOpenInAnalyzer(selectedItem.code)}
              >
                Load into Code Editor
              </button>
              <button className="secondary-button" onClick={() => setSelectedItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
