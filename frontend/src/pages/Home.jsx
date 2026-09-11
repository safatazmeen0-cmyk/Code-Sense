import {
  ArrowRight,
  BrainCircuit,
  Bug,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  SearchCode,
  ShieldCheck,
  TrendingUp,
  History,
  Sparkles,
  Play,
  Terminal,
  Code2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const workflowSteps = [
  {
    number: "01",
    label: "Write Python Code",
    desc: "Write, edit, and experiment in a lightweight VS Code browser editor.",
    icon: SearchCode,
  },
  {
    number: "02",
    label: "Real-Time Checking",
    desc: "CodeSense checks your code as you type using Python AST and static analysis.",
    icon: BrainCircuit,
  },
  {
    number: "03",
    label: "Red Error Alert",
    desc: "Gutter indicators, red line highlight, subtle pulse, and short audio cue on error.",
    icon: Bug,
  },
  {
    number: "04",
    label: "ML Error Classification",
    desc: "Trained machine learning models classify errors into 8 supported categories.",
    icon: Lightbulb,
  },
  {
    number: "05",
    label: "Smart Recommendations",
    desc: "Tailored concept suggestions, canonical code examples, and practice exercises.",
    icon: GraduationCap,
  },
  {
    number: "06",
    label: "Safe Code Execution",
    desc: "Run Python safely in isolated subshells with realtime stdout/stderr streaming.",
    icon: Play,
  },
];

const whyFeatures = [
  {
    title: "VS Code-Like Experience",
    desc: "Powered by Monaco Editor with full Python syntax, file explorer, problems panel, and keyboard shortcuts.",
    icon: Code2,
  },
  {
    title: "Real-Time Error Detection",
    desc: "Immediate feedback while typing, distinguishing syntax blunders before you even hit Run.",
    icon: BrainCircuit,
  },
  {
    title: "ML-Based Error Classification",
    desc: "Trained on thousands of real error samples with scikit-learn TF-IDF pipelines to predict categories with confidence.",
    icon: Lightbulb,
  },
  {
    title: "Audio-Visual Error Cues",
    desc: "Subtle red pulse, gutter error markers, and synthesized Web Audio beeps on newly detected bugs.",
    icon: AlertCircle,
  },
  {
    title: "Safe Subprocess Runner",
    desc: "Execute arbitrary code with timeout protection against infinite loops and zero-risk sandboxing.",
    icon: ShieldCheck,
  },
  {
    title: "Personalized Concept Guides",
    desc: "Understand 'why' an error occurred and access targeted curriculum modules to learn fundamentals faster.",
    icon: GraduationCap,
  },
];

export default function Home() {
  return (
    <div className="home-page-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-logo-box">
            <img src="/logo.png" alt="CodeSense logo" className="hero-logo" />
            <p className="eyebrow">CODE SMARTER. LEARN FASTER.</p>
          </div>
          <h1 className="hero-heading">CODE SENSE</h1>
          <p className="hero-text">
            An intelligent coding environment that detects errors, explains your mistakes, recommends what to learn, and lets you run your Python code.
          </p>
          <div className="hero-actions">
            <Link className="primary-button hero-cta-btn" to="/analyzer" id="start-coding-btn">
              <Play size={17} fill="currentColor" />
              <span>Start Coding</span>
            </Link>
            <Link className="secondary-button" to="/about" id="explore-codesense-btn">
              <span>Explore CodeSense</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* VISUAL IDE PREVIEW */}
        <div className="analyzer-visual ide-preview-mockup" aria-label="CodeSense interactive IDE preview">
          <div className="ide-mockup-topbar">
            <div className="mockup-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <span className="mockup-title">CodeSense IDE — main.py</span>
            <div className="mockup-action-pill">
              <Play size={12} fill="currentColor" /> Run (Ctrl+Enter)
            </div>
          </div>

          <div className="mockup-editor-split">
            <div className="mockup-sidebar">
              <div className="mockup-tree-title">EXPLORER</div>
              <div className="mockup-tree-item active">📄 main.py</div>
              <div className="mockup-tree-item">📄 example.py</div>
              <div className="mockup-tree-item">📄 practice.py</div>
            </div>

            <div className="mockup-code-body">
              <pre className="mockup-code">
                <code>{`1  # Real-time error detection in action
2  fruits = ["apple", "banana", "cherry"]
3  
4  # CodeSense flags out-of-range indexes:
5  print(fruits[5])  `}
                  <span className="mockup-error-tag">🔴 IndexError: list index out of range</span>
                </code>
              </pre>

              <div className="mockup-dock">
                <div className="mockup-dock-tabs">
                  <span className="mockup-tab active">PROBLEMS (1)</span>
                  <span className="mockup-tab">OUTPUT</span>
                  <span className="mockup-tab">RECOMMENDATION</span>
                </div>
                <div className="mockup-dock-content">
                  <div className="mockup-problem-row">
                    <span className="text-error">🔴 Line 5: IndexError</span>
                    <span className="mockup-tip">📚 Recommendation: Python Lists &amp; Indexing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CODESENSE WORKS */}
      <section className="page-section">
        <div className="section-heading">
          <BrainCircuit size={28} className="text-primary" />
          <div>
            <p className="eyebrow">Smart Workflow</p>
            <h2>How CodeSense Works</h2>
          </div>
        </div>
        <p className="section-subtext">
          A hybrid approach pairing static Python analysis, safe execution, machine learning classification, and tailored pedagogy.
        </p>
        <div className="step-grid">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <Icon size={26} className="step-icon" />
                <h3>{step.label}</h3>
                <p>{step.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* WHY CODESENSE */}
      <section className="page-section">
        <div className="section-heading">
          <ShieldCheck size={28} className="text-primary" />
          <div>
            <p className="eyebrow">Core Advantages</p>
            <h2>Why CodeSense?</h2>
          </div>
        </div>
        <p className="section-subtext">
          Designed specifically to help beginner Python programmers understand errors instead of fearing them.
        </p>
        <div className="feature-grid">
          {whyFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <article className="feature-card" key={feat.title}>
                <Icon size={26} className="feature-icon" />
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}