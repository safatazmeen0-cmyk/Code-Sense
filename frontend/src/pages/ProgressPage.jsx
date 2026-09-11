import { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Bug,
  BookOpen,
  Code2,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProgressPage() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("codesense_user_progress");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      problemsSolved: 42,
      programsCompleted: 35,
      errorsFixed: 67,
      topicsLearned: 18,
      currentStreak: 7,
      accuracy: 84,
      skills: {
        Python: 80,
        Loops: 95,
        Functions: 70,
        Arrays: 55,
        OOP: 30,
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("codesense_user_progress", JSON.stringify(progress));
    } catch (e) {}
  }, [progress]);

  function handleResetProgress() {
    const defaultData = {
      problemsSolved: 0,
      programsCompleted: 0,
      errorsFixed: 0,
      topicsLearned: 0,
      currentStreak: 1,
      accuracy: 90,
      skills: {
        Python: 10,
        Loops: 10,
        Functions: 10,
        Arrays: 10,
        OOP: 5,
      },
    };
    setProgress(defaultData);
  }

  return (
    <section className="page-section progress-page-container">
      <div className="section-heading">
        <TrendingUp size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Personal Growth &amp; Mastery</p>
          <h1>Your Progress &amp; Skills</h1>
        </div>
        <button
          className="secondary-button"
          onClick={handleResetProgress}
          style={{ marginLeft: "auto" }}
          title="Reset sample stats"
        >
          <RotateCcw size={14} /> Reset Stats
        </button>
      </div>

      <p className="section-subtext">
        Track your coding milestones, skill proficiencies across topics, and maintain your learning streak.
      </p>

      {/* Main Metric Cards */}
      <div className="stats-grid progress-metrics-grid">
        <article className="stats-card">
          <div className="metric-header">
            <span>Problems Solved</span>
            <Award size={18} className="text-primary" />
          </div>
          <strong style={{ color: "#0284c7" }}>{progress.problemsSolved}</strong>
        </article>

        <article className="stats-card">
          <div className="metric-header">
            <span>Programs Completed</span>
            <Code2 size={18} className="text-success" />
          </div>
          <strong style={{ color: "var(--success)" }}>{progress.programsCompleted}</strong>
        </article>

        <article className="stats-card">
          <div className="metric-header">
            <span>Errors Fixed</span>
            <Bug size={18} className="text-error" />
          </div>
          <strong style={{ color: "var(--error-dark)" }}>{progress.errorsFixed}</strong>
        </article>

        <article className="stats-card">
          <div className="metric-header">
            <span>Topics Learned</span>
            <BookOpen size={18} className="text-teal" />
          </div>
          <strong style={{ color: "#0f766e" }}>{progress.topicsLearned}</strong>
        </article>

        <article className="stats-card streak-card">
          <div className="metric-header">
            <span>Current Streak</span>
            <Flame size={18} className="text-accent" />
          </div>
          <strong style={{ color: "#f59e0b" }}>{progress.currentStreak} days 🔥</strong>
        </article>
      </div>

      {/* Skill Progress Section */}
      <section className="chart-panel skill-progress-panel" style={{ marginTop: "2rem" }}>
        <h2>Skill Proficiency Progress</h2>
        <p className="chart-desc">
          Proficiency rating calculated from exercises, error diagnosis, and clean code runs.
        </p>

        <div className="skills-bar-list">
          {Object.entries(progress.skills || {}).map(([skill, percentage]) => (
            <div key={skill} className="skill-row">
              <div className="skill-label-row">
                <span className="skill-name">{skill}</span>
                <span className="skill-percentage">{percentage}%</span>
              </div>
              <div className="skill-track">
                <div
                  className="skill-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor:
                      percentage >= 80
                        ? "var(--success)"
                        : percentage >= 60
                        ? "var(--primary)"
                        : "var(--accent)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practice Next CTA */}
      <div className="progress-cta-box" style={{ marginTop: "2rem" }}>
        <div>
          <h3>Ready to level up your skills?</h3>
          <p>Practice interactive coding challenges or learn deeper computer science fundamentals.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/challenges" className="primary-button">
            Practice Challenges &rarr;
          </Link>
          <Link to="/learn" className="secondary-button">
            Explore Concepts
          </Link>
        </div>
      </div>
    </section>
  );
}
