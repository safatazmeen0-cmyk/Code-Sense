import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function VSCodeEditor({
  code,
  onChange,
  onRun,
  onSave,
  errorLine,
  errorMessage,
  errorCategory,
  language = "python",
  theme = "vs-dark",
  editorRefOut,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (editorRefOut) {
      editorRefOut.current = editor;
    }

    // Configure keybindings: Ctrl+Enter + F5 for Run, Ctrl+S for Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // F5 → Run (VS Code convention)
    editor.addCommand(monaco.KeyCode.F5, () => {
      if (onRun) onRun();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });

    // Ctrl+Shift+Z → Redo (VS Code convention)
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
      () => {
        editor.trigger("keyboard", "redo", null);
      }
    );

    // Intelligent next-word completions provider for Python
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "for i in range",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for ${1:i} in range(${2:10}):\n    ${0}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Generate a standard Python iteration loop",
            range,
          },
          {
            label: "def function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "def ${1:function_name}(${2:args}):\n    ${0:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Define a new Python function",
            range,
          },
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "print(${1:\"Hello CodeSense\"})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Print output to the console",
            range,
          },
          {
            label: "if statement",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if ${1:condition}:\n    ${0}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Conditional branch",
            range,
          },
          {
            label: "try-except block",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "try:\n    ${1}\nexcept Exception as e:\n    print(e)",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Safe exception handling block",
            range,
          },
          {
            label: "list comprehension",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "[${1:x} for ${1:x} in ${2:items} if ${3:condition}]",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Pythonic inline list comprehension",
            range,
          },
        ];

        return { suggestions };
      },
    });

    // Intelligent next-word completions provider for JavaScript
    monaco.languages.registerCompletionItemProvider("javascript", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "for loop",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for (let i = 0; i < ${1:10}; i++) {\n    ${0}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Standard JavaScript for loop",
            range,
          },
          {
            label: "console.log",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "console.log(${1:'Hello CodeSense'});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Log message to terminal output",
            range,
          },
          {
            label: "arrow function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "const ${1:myFunc} = (${2:args}) => {\n    ${0}\n};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Modern ES6 arrow function",
            range,
          },
        ];
        return { suggestions };
      },
    });

    // Auto closing pairs
    monaco.languages.setLanguageConfiguration("python", {
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "'", close: "'", notIn: ["string", "comment"] },
      ],
    });
  }

  // Update error squiggles and line decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    if (errorLine && errorLine > 0) {
      const lineCount = model.getLineCount();
      const targetLine = Math.min(errorLine, lineCount);
      const lineMaxCol = model.getLineMaxColumn(targetLine);

      // Set Monaco marker (red squiggle)
      monaco.editor.setModelMarkers(model, "codesense", [
        {
          startLineNumber: targetLine,
          startColumn: 1,
          endLineNumber: targetLine,
          endColumn: lineMaxCol,
          message: `${errorCategory ? `[${errorCategory}] ` : ""}${errorMessage || "Error detected here"}`,
          severity: monaco.MarkerSeverity.Error,
        },
      ]);

      // Set gutter glyph and line highlight decoration
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(targetLine, 1, targetLine, lineMaxCol),
          options: {
            isWholeLine: true,
            className: "monaco-error-line-highlight",
            glyphMarginClassName: "monaco-error-glyph-margin",
            overviewRuler: {
              color: "#ef4444",
              position: monaco.editor.OverviewRulerLane.Right,
            },
          },
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, "codesense", []);
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [errorLine, errorMessage, errorCategory, code]);

  const monacoTheme = theme === "light" ? "vs" : theme === "traditional" ? "hc-black" : "vs-dark";

  return (
    <div className="vscode-editor-wrapper" style={{ height: "100%", width: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={monacoTheme}
        value={code}
        onChange={(val) => onChange && onChange(val || "")}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          renderWhitespace: "selection",
          glyphMargin: true,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          matchBrackets: "always",
          folding: true,
          foldingHighlight: true,
          dragAndDrop: true,
          bracketPairColorization: { enabled: true },
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          wordBasedSuggestions: "matchingDocuments",
          inlineSuggest: { enabled: true },
          minimap: {
            enabled: true,
            scale: 1,
            renderCharacters: false,
            side: "right",
          },
          fixedOverflowWidgets: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
