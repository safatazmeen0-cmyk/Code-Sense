import { BookOpen, ExternalLink, Code2, Globe, FileText, Bookmark } from "lucide-react";

const OFFICIAL_DOCS = [
  {
    language: "Python",
    title: "Official Python Documentation (docs.python.org)",
    desc: "Complete standard library reference, built-in functions, language tutorial, and PEP specifications.",
    url: "https://docs.python.org/3/",
    badge: "Official",
  },
  {
    language: "JavaScript",
    title: "MDN Web Docs (Mozilla Developer Network)",
    desc: "The gold-standard reference for modern ECMAScript, JavaScript syntax, arrays, objects, and APIs.",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    badge: "Community Gold Standard",
  },
  {
    language: "C++",
    title: "cppreference.com",
    desc: "Comprehensive reference manual for C and C++ language standards, STL containers, and algorithms.",
    url: "https://en.cppreference.com/",
    badge: "C / C++ Reference",
  },
  {
    language: "Java",
    title: "Oracle Java SE Documentation",
    desc: "Official API specifications, tutorials, and class documentation for Java standard edition.",
    url: "https://docs.oracle.com/en/java/",
    badge: "Official",
  },
];

const TUTORIAL_GUIDES = [
  {
    topic: "Python Control Flow & Loops",
    desc: "Understanding if statements, for/while loops, and break/continue flow control.",
    url: "https://docs.python.org/3/tutorial/controlflow.html",
  },
  {
    topic: "Python Data Structures & List Slicing",
    desc: "Lists, sets, dictionaries, tuples, and index boundary operations.",
    url: "https://docs.python.org/3/tutorial/datastructures.html",
  },
  {
    topic: "Python Exception Handling & Debugging",
    desc: "Handling syntax and runtime exceptions cleanly with try/except/finally suites.",
    url: "https://docs.python.org/3/tutorial/errors.html",
  },
  {
    topic: "Algorithms & Time Complexity (Big-O)",
    desc: "Beginner-friendly breakdown of constant O(1), linear O(n), and quadratic O(n²) time scaling.",
    url: "https://en.wikipedia.org/wiki/Time_complexity",
  },
];

export default function References() {
  return (
    <section className="page-section references-page-container">
      <div className="section-heading">
        <Bookmark size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Documentation &amp; Portals</p>
          <h1>References &amp; Learning Resources</h1>
        </div>
      </div>
      <p className="section-subtext">
        Direct links to official language manuals, tutorials, and computer science references to support your study.
      </p>

      {/* Official Documentation Cards */}
      <h2 style={{ fontSize: "1.25rem", margin: "2rem 0 1rem" }}>Official Language Manuals</h2>
      <div className="references-grid">
        {OFFICIAL_DOCS.map((doc) => (
          <article key={doc.language} className="reference-card">
            <div className="reference-card-header">
              <span className="badge badge-teal">{doc.language}</span>
              <span className="badge">{doc.badge}</span>
            </div>
            <h3 className="reference-title">{doc.title}</h3>
            <p className="reference-desc">{doc.desc}</p>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ref-link-btn"
            >
              <span>Visit Documentation</span>
              <ExternalLink size={14} />
            </a>
          </article>
        ))}
      </div>

      {/* Targeted Concept Tutorials */}
      <h2 style={{ fontSize: "1.25rem", margin: "2.5rem 0 1rem" }}>Curated Concept Tutorials</h2>
      <div className="references-grid">
        {TUTORIAL_GUIDES.map((guide) => (
          <article key={guide.topic} className="reference-card">
            <div className="reference-card-header">
              <span className="badge">Topic Guide</span>
            </div>
            <h3 className="reference-title">{guide.topic}</h3>
            <p className="reference-desc">{guide.desc}</p>
            <a
              href={guide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ref-link-btn"
            >
              <span>Read Tutorial</span>
              <ExternalLink size={14} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
