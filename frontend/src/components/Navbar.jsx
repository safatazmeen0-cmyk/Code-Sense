import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Code2,
  LayoutDashboard,
  Info,
  BookOpen,
  Puzzle,
  TrendingUp,
  Bookmark,
  Settings,
  Volume2,
  VolumeX,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

/* Primary nav links shown always (per spec: Home, Analyzer, Dashboard, About) */
const PRIMARY_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/analyzer", label: "Analyzer", icon: Code2 },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/about", label: "About", icon: Info },
];

/* Extended links in a "More" dropdown */
const MORE_LINKS = [
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/challenges", label: "Challenges", icon: Puzzle },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/references", label: "References", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar({ soundEnabled, setSoundEnabled, theme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  function closeMobile() {
    setMobileMenuOpen(false);
    setMoreOpen(false);
  }

  return (
    <header className="navbar">
      {/* Brand */}
      <NavLink className="brand" to="/" onClick={closeMobile}>
        <img src="/logo.png" alt="CodeSense logo" className="brand-logo" />
        <div className="brand-info">
          <span className="brand-name">CODE SENSE</span>
          <span className="brand-tagline">Code Smarter. Learn Faster.</span>
        </div>
      </NavLink>

      {/* Mobile hamburger */}
      <button
        className="mobile-menu"
        aria-label="Toggle navigation menu"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Primary nav */}
      <nav
        className={`nav-links ${mobileMenuOpen ? "open" : ""}`}
        aria-label="Main Navigation"
      >
        {PRIMARY_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={closeMobile}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* "More" dropdown for extended links */}
        <div
          className={`nav-more-dropdown ${moreOpen ? "open" : ""}`}
          onMouseEnter={() => setMoreOpen(true)}
          onMouseLeave={() => setMoreOpen(false)}
        >
          <button
            className="nav-more-trigger"
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-label="More navigation options"
          >
            <span>More</span>
            <ChevronDown size={13} className={`more-chevron ${moreOpen ? "rotated" : ""}`} />
          </button>

          {moreOpen && (
            <div className="nav-more-menu" role="menu">
              {MORE_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  role="menuitem"
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Right: Sound toggle */}
      <div className="navbar-right">
        <button
          className={`sound-toggle ${soundEnabled ? "active" : ""}`}
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Sound Siren ON – click to mute" : "Sound Siren OFF – click to unmute"}
          id="navbar-sound-toggle"
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundEnabled ? "Sound ON" : "Sound OFF"}</span>
        </button>
      </div>
    </header>
  );
}