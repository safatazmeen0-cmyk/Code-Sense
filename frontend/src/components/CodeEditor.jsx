/**
 * CodeEditor.jsx
 *
 * Per the CodeSense specification, this is the primary code-editor component.
 * It wraps VSCodeEditor (Monaco-based) to provide the full VS Code-like experience
 * while keeping the legacy CodeMirror version available via CodeEditorLegacy.
 *
 * Props (passed straight through to VSCodeEditor):
 *   code            – current code string
 *   onChange        – (newCode: string) => void
 *   onRun           – () => void  (Ctrl+Enter / F5)
 *   onSave          – () => void  (Ctrl+S)
 *   errorLine       – number | null
 *   errorMessage    – string
 *   errorCategory   – string
 *   language        – "python" | "javascript" | "cpp" | "c" | "java"
 *   theme           – "dark" | "light" | "traditional"
 *   editorRefOut    – React ref forwarded to the Monaco instance
 */
import VSCodeEditor from "./VSCodeEditor.jsx";

export default function CodeEditor(props) {
  return <VSCodeEditor {...props} />;
}

/**
 * CodeEditorLegacy – original CodeMirror-based editor kept for backwards-compat.
 * Import this named export if you need the old implementation.
 */
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Upload, AlertCircle } from "lucide-react";

export function CodeEditorLegacy({ code, setCode, highlightedLine }) {
  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCode(String(reader.result || ""));
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <section className="editor-panel" aria-label="Python code editor">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Input Script</p>
          <h2>Python Code Editor</h2>
        </div>
        <div className="panel-header-actions">
          <label className="upload-button" title="Upload a local Python file">
            <Upload size={15} />
            <span>Upload .py</span>
            <input type="file" accept=".py,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {highlightedLine ? (
        <div className="line-alert" role="alert">
          <AlertCircle size={18} />
          <span>Line {highlightedLine}: Potential issue detected on or near this line</span>
        </div>
      ) : null}

      <div className="cm-theme-container">
        <CodeMirror
          value={code}
          height="420px"
          extensions={[python()]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
          }}
          onChange={(value) => setCode(value)}
        />
      </div>
    </section>
  );
}