import {
  BrainCircuit,
  Code2,
  GraduationCap,
  SearchCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  Server,
  Play,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const workflowSteps = [
    { step: "Write Code", icon: Code2, desc: "Write or edit code inside the VS Code Monaco editor." },
    { step: "Real-Time Detection", icon: SearchCheck, desc: "Immediate AST & static analysis detects syntax or scope flaws." },
    { step: "ML Classification", icon: BrainCircuit, desc: "Trained scikit-learn model categorizes error into 8 classes." },
    { step: "Explanation", icon: Sparkles, desc: "Plain-language diagnosis explains what happened without dense jargon." },
    { step: "Recommendation", icon: GraduationCap, desc: "Identifies the exact computer science concept to study." },
    { step: "Fix Code", icon: Layers, desc: "User addresses the suggested fix directly in the browser editor." },
    { step: "Run Code", icon: Play, desc: "Safely execute code in isolated Python child process with timeout guards." },
    { step: "Learn", icon: GraduationCap, desc: "Retain key fundamentals and practice canonical exercises." },
  ];

  const techStack = [
    { name: "React 18 & Vite", role: "Frontend UI, state management, and real-time audio-visual feedback." },
    { name: "Monaco Editor", role: "Lightweight browser VS Code experience with Python language server support." },
    { name: "Flask & Python 3.14", role: "RESTful API backend for code analysis, parsing, and execution." },
    { name: "Machine Learning (scikit-learn)", role: "TF-IDF feature extraction & balanced Logistic Regression classifier." },
    { name: "Python AST & Subprocess Sandbox", role: "Static tree inspection and isolated dry-run subprocess execution." },
    { name: "SQLite Database", role: "Persistent audit log of all runs, analyses, errors, and revision concepts." },
  ];

  return (
    <section className="page-section about-page-container">
      {/* Title */}
      <div className="section-heading">
        <BrainCircuit size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Product &amp; Architecture</p>
          <h1>About CodeSense</h1>
        </div>
      </div>

      <p className="section-subtext" style={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
        <strong>CodeSense – Code Smarter. Learn Faster.</strong>
        <br />
        An intelligent coding environment that detects errors, explains your mistakes, recommends what to learn, and lets you run your Python code.
      </p>

      {/* 3 Core Questions */}
      <div className="feature-grid" style={{ marginBottom: "3rem" }}>
        <article className="feature-card">
          <Code2 size={28} className="text-primary" />
          <h3>What is CodeSense?</h3>
          <p>
            CodeSense is a lightweight web-based IDE modeled after VS Code, integrated with an intelligent machine learning error detection and concept recommendation system. Instead of pasting code into a simple form, students write, edit, check, and safely execute Python code in real time.
          </p>
        </article>

        <article className="feature-card">
          <ShieldAlert size={28} className="text-primary" />
          <h3>Why was it created?</h3>
          <p>
            Standard Python tracebacks and compiler errors are intimidating for beginners. When students encounter errors like TypeError or IndexError, they often don&apos;t know what went wrong. CodeSense turns confusing errors into guided learning moments.
          </p>
        </article>

        <article className="feature-card">
          <Cpu size={28} className="text-primary" />
          <h3>How does it work?</h3>
          <p>
            CodeSense uses a hybrid architecture: Python AST and static analysis perform immediate technical error detection while typing, and trained scikit-learn models classify the error, predict confidence, and recommend fundamental programming concepts.
          </p>
        </article>
      </div>

      {/* Complete Workflow Diagram */}
      <div className="chart-panel" style={{ marginBottom: "3rem" }}>
        <div className="section-heading" style={{ marginBottom: "0.5rem" }}>
          <Layers size={22} className="text-primary" />
          <h2>End-to-End Workflow Pipeline</h2>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.75rem" }}>
          The complete cycle from typing a Python statement to retaining fundamental programming knowledge:
        </p>

        <div className="about-workflow-chain">
          {workflowSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="workflow-chain-node-wrap">
                <div className="workflow-chain-card">
                  <div className="chain-step-num">{String(index + 1).padStart(2, "0")}</div>
                  <Icon size={20} className="chain-icon" />
                  <h4>{item.step}</h4>
                  <p>{item.desc}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="chain-connector" aria-hidden="true">
                    <span>&darr;</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Technologies Used */}
      <div className="chart-panel" style={{ marginBottom: "3rem" }}>
        <div className="section-heading" style={{ marginBottom: "0.5rem" }}>
          <Server size={22} className="text-primary" />
          <h2>Technology Stack</h2>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Engineered as a robust, fully communicative full-stack application:
        </p>

        <div className="tech-stack-grid">
          {techStack.map((tech) => (
            <div key={tech.name} className="tech-stack-item">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-role">{tech.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div style={{ textAlign: "center", padding: "1.5rem 0 3rem" }}>
        <Link to="/analyzer" className="primary-button hero-cta-btn" style={{ fontSize: "1rem" }}>
          <Play size={18} fill="currentColor" />
          <span>Launch CodeSense IDE</span>
        </Link>
      </div>
    </section>
  );
}