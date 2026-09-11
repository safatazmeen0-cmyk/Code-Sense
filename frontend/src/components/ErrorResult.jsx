import { AlertCircle, CheckCircle2, Info, MapPin, Tag, BarChart2, Wrench } from "lucide-react";

/**
 * ErrorResult – compact error analysis panel that appears in the right assistant area.
 * Shows: detected error type, line number, ML-predicted category, confidence, explanation, and fix.
 */
export default function ErrorResult({ issue, confidence, positiveMessage }) {
  /* ---- No-error / success state ---- */
  if (!issue || !issue.has_error) {
    return (
      <div className="er-success-state">
        <CheckCircle2 size={22} className="er-success-icon" />
        <p className="er-success-msg">
          {positiveMessage || "Great job! No errors detected."}
        </p>
        <p className="er-success-sub">Your code is syntactically valid and ready to run.</p>
      </div>
    );
  }

  /* ---- Confidence value ---- */
  const conf = typeof confidence === "number" ? confidence : issue.confidence ?? 0.86;
  const confPct = Math.round(conf * 100);
  const confColor =
    confPct >= 85 ? "var(--success)" : confPct >= 65 ? "var(--accent)" : "var(--error)";

  return (
    <div className="er-panel" role="alert" aria-label="Error Analysis Result">
      {/* Header */}
      <div className="er-header">
        <AlertCircle size={16} className="er-header-icon" />
        <span className="er-header-text">Error Detected</span>
        {issue.line && (
          <span className="er-line-badge">
            <MapPin size={11} />
            Line {issue.line}
          </span>
        )}
      </div>

      {/* Error type */}
      <div className="er-row">
        <span className="er-label">
          <Tag size={12} /> Error Type
        </span>
        <span className="er-value er-value-error">
          {issue.error_type || issue.exception_name || "—"}
        </span>
      </div>

      {/* Error message */}
      {issue.error_message && (
        <div className="er-message-box">
          <code className="er-message-code">{issue.error_message}</code>
        </div>
      )}

      {/* ML Category */}
      <div className="er-row">
        <span className="er-label">
          <BarChart2 size={12} /> ML Category
        </span>
        <span className="er-value er-category-pill">
          {issue.error_category || "Runtime Error"}
        </span>
      </div>

      {/* Confidence */}
      <div className="er-confidence-section">
        <div className="er-confidence-header">
          <span className="er-label">Confidence</span>
          <span className="er-confidence-pct" style={{ color: confColor }}>
            {confPct}%
          </span>
        </div>
        <div className="er-confidence-track">
          <div
            className="er-confidence-fill"
            style={{ width: `${confPct}%`, background: confColor }}
            role="progressbar"
            aria-valuenow={confPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Explanation */}
      {issue.explanation && (
        <div className="er-explanation">
          <div className="er-explanation-header">
            <Info size={13} />
            <strong>What happened?</strong>
          </div>
          <p className="er-explanation-text">{issue.explanation}</p>
        </div>
      )}

      {/* Suggested Fix */}
      {issue.suggested_fix && (
        <div className="er-fix-box">
          <div className="er-fix-header">
            <Wrench size={12} />
            <strong>Suggested Fix</strong>
          </div>
          <p className="er-fix-text">{issue.suggested_fix}</p>
        </div>
      )}
    </div>
  );
}
