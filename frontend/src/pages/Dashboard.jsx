import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  Play,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getHistory } from "../services/api.js";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    const total = history.length;
    const runs = history.filter((item) => item.action_type === "run");
    const analyses = history.filter((item) => item.action_type !== "run");
    const errors = history.filter((item) => item.has_error);
    const correct = history.filter((item) => !item.has_error);

    const errorCounts = errors.reduce((acc, item) => {
      const cat = item.error_category || "Syntax Error";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const conceptCounts = errors.reduce((acc, item) => {
      if (item.concept) {
        acc[item.concept] = (acc[item.concept] || 0) + 1;
      }
      return acc;
    }, {});

    const mostCommonError =
      Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None Yet";

    const mostRecommendedConcept =
      Object.entries(conceptCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Python Syntax";

    return {
      total,
      totalRuns: runs.length,
      totalAnalyses: analyses.length,
      errorCount: errors.length,
      correctCount: correct.length,
      errorCounts,
      conceptCounts,
      mostCommonError,
      mostRecommendedConcept,
      accuracyRate: total > 0 ? Math.round((correct.length / total) * 100) : 0,
    };
  }, [history]);

  const maxErrorCount = Math.max(1, ...Object.values(stats.errorCounts));

  return (
    <section className="page-section dashboard-page-container">
      <div className="section-heading">
        <BarChart3 size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Learning Analytics &amp; Telemetry</p>
          <h1>Student Dashboard</h1>
        </div>
      </div>
      <p className="section-subtext">
        Track your Python coding trends, recurring error patterns, execution history, and high-priority revision concepts.
      </p>

      {/* 6 Stats Cards */}
      <div className="stats-grid dashboard-six-grid">
        <article className="stats-card">
          <span>Total Code Runs</span>
          <strong style={{ color: "#0284c7" }}>{stats.totalRuns}</strong>
        </article>
        <article className="stats-card">
          <span>Total Analyses</span>
          <strong>{stats.totalAnalyses}</strong>
        </article>
        <article className="stats-card">
          <span>Errors Detected</span>
          <strong style={{ color: "var(--error-dark)" }}>{stats.errorCount}</strong>
        </article>
        <article className="stats-card">
          <span>Correct Programs</span>
          <strong style={{ color: "var(--success)" }}>{stats.correctCount}</strong>
        </article>
        <article className="stats-card">
          <span>Most Common Error</span>
          <strong style={{ fontSize: "1.15rem", color: "#1e293b", marginTop: "0.25rem" }}>
            {stats.mostCommonError}
          </strong>
        </article>
        <article className="stats-card">
          <span>Most Recommended Concept</span>
          <strong style={{ fontSize: "1.1rem", color: "#0f766e", marginTop: "0.25rem" }}>
            {stats.mostRecommendedConcept}
          </strong>
        </article>
      </div>

      {/* Charts & Distribution Grid */}
      <div className="dashboard-grid">
        {/* Error Category Distribution */}
        <section className="chart-panel">
          <h2>Error Category Distribution</h2>
          <p className="chart-desc">Breakdown of syntax, runtime, and logical classification errors.</p>
          {Object.keys(stats.errorCounts).length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "1.5rem 0" }}>
              No errors detected yet. Run or analyze code in the Editor to populate this distribution.
            </p>
          ) : (
            <div className="bar-chart-container">
              {Object.entries(stats.errorCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div className="bar-row" key={category}>
                    <span className="bar-label" title={category}>
                      {category}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(count / maxErrorCount) * 100}%` }}
                      />
                    </div>
                    <span className="bar-value">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Results Ratio */}
        <section className="chart-panel">
          <h2>Success vs Revision Ratio</h2>
          <p className="chart-desc">Overall compilation &amp; execution health score.</p>
          <div className="result-split">
            <div className="split-box errors">
              <XCircle size={36} />
              <strong>{stats.errorCount}</strong>
              <span>Errors Flagged</span>
            </div>
            <div className="split-box correct">
              <CheckCircle2 size={36} />
              <strong>{stats.correctCount}</strong>
              <span>Clean Executions</span>
            </div>
          </div>
          <div className="accuracy-meter-wrap">
            <div className="accuracy-label-row">
              <span>Clean Code Rate</span>
              <strong>{stats.accuracyRate}%</strong>
            </div>
            <div className="accuracy-meter-track">
              <div
                className="accuracy-meter-fill"
                style={{ width: `${stats.accuracyRate}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Recent Activity Section */}
      <section className="chart-panel recent-activity-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2>Recent Activity</h2>
            <p className="chart-desc">Live timeline of programs analyzed and executed.</p>
          </div>
          <Link to="/history" className="btn-link btn-link-primary">
            View Full History &rarr;
          </Link>
        </div>

        {history.length === 0 ? (
          <p style={{ color: "var(--muted)", padding: "1rem 0" }}>
            No recent activity recorded. Start typing and running code in the Editor!
          </p>
        ) : (
          <div className="activity-feed-list">
            {history.slice(0, 8).map((item) => {
              const isRun = item.action_type === "run";
              const isError = item.has_error;

              return (
                <div key={item.id} className="activity-feed-item">
                  <div className="feed-icon-wrap">
                    {isRun ? (
                      isError ? (
                        <AlertTriangle size={16} className="text-error" />
                      ) : (
                        <Play size={15} className="text-primary" />
                      )
                    ) : isError ? (
                      <XCircle size={16} className="text-error" />
                    ) : (
                      <CheckCircle2 size={16} className="text-success" />
                    )}
                  </div>

                  <div className="feed-content">
                    <div className="feed-title-line">
                      <span className="feed-title">
                        {isRun
                          ? isError
                            ? `🔴 ${item.error_category || "Runtime Error"} detected during execution`
                            : `✓ Program successfully executed (${item.filename || "main.py"})`
                          : isError
                          ? `🔴 ${item.error_category || "Syntax Error"} detected in ${item.filename || "main.py"}`
                          : `✓ Python program analyzed clean (${item.filename || "main.py"})`}
                      </span>
                      <span className="feed-time">
                        {new Date(item.created_at ? `${item.created_at}Z` : Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {item.concept && isError && (
                      <div className="feed-concept-hint">
                        <BookOpen size={13} className="text-teal" />
                        <span>Recommended to revise: <strong>{item.concept}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Revision Concepts */}
      <div className="chart-panel" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2>High-Priority Concepts to Revise</h2>
            <p className="chart-desc">Concepts mapped directly from your identified coding mistakes.</p>
          </div>
          <Link to="/learn" className="btn-link btn-link-primary">
            Explore Learning Guides &rarr;
          </Link>
        </div>

        {Object.keys(stats.conceptCounts).length === 0 ? (
          <p style={{ color: "var(--muted)", padding: "0.5rem 0" }}>
            No revision concepts logged yet. As you analyze scripts with errors, personalized topics will appear here.
          </p>
        ) : (
          <div className="concepts-summary-grid">
            {Object.entries(stats.conceptCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([concept, count]) => (
                <div key={concept} className="concept-summary-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <BookOpen size={18} className="text-primary" />
                    <strong style={{ fontSize: "0.95rem" }}>{concept}</strong>
                  </div>
                  <span className="badge badge-teal">
                    {count} {count === 1 ? "time flagged" : "times flagged"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}