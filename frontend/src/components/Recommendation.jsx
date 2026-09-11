import { BookOpen, CheckCircle2, ExternalLink, ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Recommendation – displays the ML-driven concept recommendation panel.
 * Shows: concept title, difficulty, why, ✓ bullet topics, example, practice suggestion.
 */
export default function Recommendation({ recommendation, errorCategory }) {
  if (!recommendation) {
    return (
      <div className="rec-empty-state">
        <Lightbulb size={22} className="rec-empty-icon" />
        <p className="rec-empty-msg">
          No active recommendation. Write or analyze code with an error to see personalized
          concept suggestions.
        </p>
      </div>
    );
  }

  const {
    concept,
    difficulty = "Beginner",
    why,
    topics = [],
    example,
    practice,
  } = recommendation;

  return (
    <div className="rec-panel">
      {/* Header */}
      <div className="rec-panel-header">
        <div className="rec-panel-title">
          <BookOpen size={16} className="rec-panel-icon" />
          <span>Recommended Concept</span>
        </div>
        {errorCategory && (
          <span className="rec-error-chip">{errorCategory}</span>
        )}
      </div>

      {/* Concept title + difficulty badge */}
      <div className="rec-concept-block">
        <h3 className="rec-concept-name">{concept}</h3>
        <span className={`rec-difficulty-badge level-${(difficulty || "beginner").toLowerCase()}`}>
          {difficulty}
        </span>
      </div>

      {/* Why */}
      {why && (
        <div className="rec-why-block">
          <p className="rec-why-text">{why}</p>
        </div>
      )}

      {/* Topics checklist */}
      {topics.length > 0 && (
        <div className="rec-topics-block">
          <p className="rec-topics-label">You should revise:</p>
          <ul className="rec-topics-list">
            {topics.map((topic, i) => (
              <li key={i} className="rec-topic-item">
                <CheckCircle2 size={13} className="rec-check-icon" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code example */}
      {example && (
        <div className="rec-example-block">
          <p className="rec-example-label">Example:</p>
          <pre className="rec-example-pre">
            <code>{example}</code>
          </pre>
        </div>
      )}

      {/* Practice tip */}
      {practice && (
        <div className="rec-practice-block">
          <p className="rec-practice-label">Practice:</p>
          <p className="rec-practice-text">{practice}</p>
        </div>
      )}

      {/* CTA */}
      <div className="rec-cta-row">
        <Link to="/learn" className="rec-learn-btn" id="rec-learn-concept-btn">
          <BookOpen size={14} />
          <span>Learn Concept</span>
          <ArrowRight size={13} />
        </Link>
        <Link to="/learn" className="rec-curriculum-link">
          <span>Full Curriculum</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}