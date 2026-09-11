import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import Learn from "./pages/Learn.jsx";
import Challenges from "./pages/Challenges.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import References from "./pages/References.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import About from "./pages/About.jsx";
import ToastContainer from "./components/Toast.jsx";

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("codesense_theme") || "dark";
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("codesense_sound");
    return saved !== null ? saved === "true" : true;
  });

  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(() => {
    const saved = localStorage.getItem("codesense_autocomplete");
    return saved !== null ? saved === "true" : true;
  });

  // status can be "idle", "error-active", "success-active"
  const [viewportStatus, setViewportStatus] = useState("idle");
  const [activeCode, setActiveCode] = useState(() => {
    return sessionStorage.getItem("codesense_code") || "";
  });

  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("codesense_sound", String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("codesense_autocomplete", String(autoCompleteEnabled));
  }, [autoCompleteEnabled]);

  useEffect(() => {
    localStorage.setItem("codesense_theme", theme);
    // Resolve "system" theme → detect OS preference
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : theme;
    document.documentElement.setAttribute("data-theme", resolved);
  }, [theme]);

  // Watch OS preference changes when "system" theme is active
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e) => {
      document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const handleSelectCode = (code) => {
    setActiveCode(code);
    sessionStorage.setItem("codesense_code", code);
  };

  const appContext = {
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    autoCompleteEnabled,
    setAutoCompleteEnabled,
    activeCode,
    setActiveCode: handleSelectCode,
  };

  return (
    <div
      className={`app-shell theme-${theme} ${viewportStatus !== "idle" ? `viewport-${viewportStatus}` : ""}`}
      data-theme={theme}
    >
      {/* Global toast notifications */}
      <ToastContainer />
      {/* Top red/green viewport edge aura */}
      <div className="viewport-aura" aria-hidden="true" />

      <Navbar
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/analyzer"
            element={<Analyzer appContext={appContext} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/history"
            element={<HistoryPage onSelectCode={handleSelectCode} />}
          />
          <Route
            path="/learn"
            element={<Learn onSelectCode={handleSelectCode} />}
          />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/references" element={<References />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                theme={theme}
                setTheme={setTheme}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                autoCompleteEnabled={autoCompleteEnabled}
                setAutoCompleteEnabled={setAutoCompleteEnabled}
              />
            }
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.png" alt="CodeSense" className="footer-logo" />
            <div>
              <span className="footer-title">CODE SENSE</span>
              <p className="footer-tagline">Code Smarter. Learn Faster.</p>
            </div>
          </div>
          <p className="footer-desc">
            An intelligent VS Code-like coding environment with ML-powered error classification, real-time feedback, and concept recommendations.
          </p>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} CodeSense. All rights reserved.</span>
            <span className="footer-badge">Powered by Machine Learning &amp; Flask</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
