import { Settings, Moon, Sun, Monitor, Terminal, Volume2, VolumeX, Keyboard, Sparkles } from "lucide-react";

export default function SettingsPage({
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  autoCompleteEnabled,
  setAutoCompleteEnabled,
}) {
  const themesList = [
    { id: "dark", label: "Dark Theme", desc: "VS Code inspired sleek dark environment (Default)", icon: Moon },
    { id: "light", label: "Light Theme", desc: "Crisp, daylight optimized high readability interface", icon: Sun },
    { id: "traditional", label: "Traditional Theme", desc: "High contrast classic hacker/terminal appearance", icon: Terminal },
    { id: "system", label: "System / Preferred", desc: "Automatically synchronizes with your device OS settings", icon: Monitor },
  ];

  const shortcuts = [
    { key: "Ctrl + Enter", action: "Run current code" },
    { key: "Ctrl + S", action: "Save active file" },
    { key: "Ctrl + Space", action: "Trigger intelligent completions" },
    { key: "Tab", action: "Accept inline code suggestion" },
    { key: "Ctrl + /", action: "Comment or uncomment lines" },
    { key: "Ctrl + F", action: "Find / Search in document" },
    { key: "Ctrl + Z", action: "Undo last edit" },
    { key: "Ctrl + Shift + Z", action: "Redo last edit" },
    { key: "F5", action: "Run code execution" },
  ];

  return (
    <section className="page-section settings-page-container">
      <div className="section-heading">
        <Settings size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Preferences &amp; Keybindings</p>
          <h1>Platform Settings</h1>
        </div>
      </div>
      <p className="section-subtext">
        Customize your editor theme, audio siren alerts, autocomplete behavior, and review keyboard shortcuts.
      </p>

      {/* Theme Selector */}
      <div className="chart-panel settings-card" style={{ marginBottom: "2rem" }}>
        <h2>🎨 Color Theme</h2>
        <p className="chart-desc">Select your preferred IDE and platform appearance. Persists across browser sessions.</p>

        <div className="theme-options-grid">
          {themesList.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                className={`theme-card ${isSelected ? "selected" : ""}`}
                onClick={() => setTheme(t.id)}
                role="button"
                tabIndex={0}
              >
                <div className="theme-card-top">
                  <Icon size={20} className={isSelected ? "text-primary" : "text-muted"} />
                  <span className="theme-name">{t.label}</span>
                </div>
                <p className="theme-desc">{t.desc}</p>
                {isSelected && <span className="active-badge">Active Theme</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio & Alert Preferences */}
      <div className="chart-panel settings-card" style={{ marginBottom: "2rem" }}>
        <h2>🔊 Sound &amp; Error Alert System</h2>
        <p className="chart-desc">Configure the Error Siren audio cues and positive feedback chime.</p>

        <div className="setting-toggle-row">
          <div>
            <strong>Error Siren &amp; Sound Alerts</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Play the 4-beep alert when errors are flagged, and play soft positive chime on success.
            </p>
          </div>
          <button
            className={`toggle-switch ${soundEnabled ? "on" : "off"}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle sound alerts"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? "Sound ON" : "Sound OFF"}</span>
          </button>
        </div>
      </div>

      {/* Intelligent Autocomplete Settings */}
      <div className="chart-panel settings-card" style={{ marginBottom: "2rem" }}>
        <h2>💡 Autocomplete &amp; Suggestions</h2>
        <p className="chart-desc">Configure the AI-like next-word suggestion generator.</p>

        <div className="setting-toggle-row">
          <div>
            <strong>Next-Word Predictions</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Show ghost text and inline code completions while typing (e.g. for loops and functions).
            </p>
          </div>
          <button
            className={`toggle-switch ${autoCompleteEnabled ? "on" : "off"}`}
            onClick={() => setAutoCompleteEnabled(!autoCompleteEnabled)}
            aria-label="Toggle next word suggestions"
          >
            <Sparkles size={16} />
            <span>{autoCompleteEnabled ? "Enabled" : "Disabled"}</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheatsheet */}
      <div className="chart-panel settings-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Keyboard size={20} className="text-primary" />
          <h2>Keyboard Shortcuts</h2>
        </div>
        <p className="chart-desc">Standard VS Code shortcuts supported inside CodeSense.</p>

        <div className="shortcuts-table-wrap">
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th>Shortcut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((s) => (
                <tr key={s.key}>
                  <td>
                    <kbd className="shortcut-kbd">{s.key}</kbd>
                  </td>
                  <td>{s.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
