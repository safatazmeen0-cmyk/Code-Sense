import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { runCode } from "../services/api.js";
import { toast } from "../components/Toast.jsx";

const CHALLENGES_DATA = [
  {
    id: "sum_two",
    difficulty: "Beginner",
    title: "Sum of Two Numbers",
    description: "Write a function sum_numbers(a, b) that takes two integers and returns their sum.",
    exampleInput: "sum_numbers(3, 5)",
    expectedOutput: "8",
    starterCode: `def sum_numbers(a, b):\n    # Write your solution here\n    return a + b\n\nprint(sum_numbers(3, 5))\n`,
    hint: "Use the + arithmetic operator to add the two values and return the result.",
    explanation: "Addition is computed with the + operator. The return keyword outputs the result back to the caller.",
    testCases: [
      { input: "sum_numbers(10, 20)", expected: "30" },
      { input: "sum_numbers(-5, 5)", expected: "0" },
    ],
  },
  {
    id: "reverse_string",
    difficulty: "Beginner",
    title: "Reverse a String",
    description: "Write a function reverse_str(text) that returns the reversed version of the given string.",
    exampleInput: 'reverse_str("python")',
    expectedOutput: "nohtyp",
    starterCode: `def reverse_str(text):\n    # Return reversed string\n    return text[::-1]\n\nprint(reverse_str("python"))\n`,
    hint: "Python slice notation [::-1] steps backwards through any sequence or string.",
    explanation: "Slice syntax [start:stop:step] with a step of -1 reverses sequences efficiently in O(n) time.",
    testCases: [
      { input: 'reverse_str("code")', expected: "edoc" },
    ],
  },
  {
    id: "is_palindrome",
    difficulty: "Intermediate",
    title: "Palindrome Checker",
    description: "Write a function is_palindrome(text) that returns True if the text reads the same backwards and forwards (ignoring case), and False otherwise.",
    exampleInput: 'is_palindrome("Racecar")',
    expectedOutput: "True",
    starterCode: `def is_palindrome(text):\n    clean = text.lower()\n    return clean == clean[::-1]\n\nprint(is_palindrome("Racecar"))\nprint(is_palindrome("hello"))\n`,
    hint: "Convert the string to lowercase first using .lower(), then compare it to clean[::-1].",
    explanation: "A palindrome is symmetric. Normalizing case ensures accurate comparison.",
    testCases: [
      { input: 'is_palindrome("madam")', expected: "True" },
      { input: 'is_palindrome("world")', expected: "False" },
    ],
  },
  {
    id: "find_max",
    difficulty: "Intermediate",
    title: "Find Maximum Element",
    description: "Write a function find_maximum(numbers) that returns the largest number in a list without using the built-in max() function.",
    exampleInput: "find_maximum([12, 45, 2, 89, 34])",
    expectedOutput: "89",
    starterCode: `def find_maximum(numbers):\n    if not numbers:\n        return None\n    largest = numbers[0]\n    for num in numbers:\n        if num > largest:\n            largest = num\n    return largest\n\nprint(find_maximum([12, 45, 2, 89, 34]))\n`,
    hint: "Initialize a variable largest with the first element, then loop through each number updating largest if a greater number is found.",
    explanation: "This linear scan examines each element once, running in O(n) time complexity.",
    testCases: [
      { input: "find_maximum([5, 1, 9, 3])", expected: "9" },
    ],
  },
  {
    id: "binary_search",
    difficulty: "Advanced",
    title: "Binary Search",
    description: "Implement binary_search(arr, target) which searches for target in a sorted list arr and returns its index, or -1 if not found. Must run in O(log n) time.",
    exampleInput: "binary_search([2, 5, 8, 12, 16, 23, 38], 16)",
    expectedOutput: "4",
    starterCode: `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nprint(binary_search([2, 5, 8, 12, 16, 23, 38], 16))\n`,
    hint: "Calculate mid = (left + right) // 2 on each iteration and adjust left or right boundaries accordingly.",
    explanation: "Binary search cuts the search space in half at each step, yielding logarithmic O(log n) time complexity.",
    testCases: [
      { input: "binary_search([1, 3, 5, 7], 3)", expected: "1" },
      { input: "binary_search([1, 3, 5, 7], 9)", expected: "-1" },
    ],
  },
];

export default function Challenges() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [activeChallenge, setActiveChallenge] = useState(CHALLENGES_DATA[0]);
  const [code, setCode] = useState(CHALLENGES_DATA[0].starterCode);
  const [runResult, setRunResult] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const filteredChallenges = CHALLENGES_DATA.filter(
    (c) => selectedDifficulty === "All" || c.difficulty === selectedDifficulty
  );

  function handleSelectChallenge(ch) {
    setActiveChallenge(ch);
    setCode(ch.starterCode);
    setRunResult("");
    setShowHint(false);
    setSubmitStatus(null);
  }

  async function handleRun() {
    setIsRunning(true);
    setRunResult("Executing test code...");
    try {
      const res = await runCode(code, `${activeChallenge.id}.py`);
      if (res.success) {
        setRunResult(res.output || "Code ran with no console output.");
        toast("Code ran successfully!", "success");
      } else {
        setRunResult(res.error || "Runtime execution failed.");
        toast(res.error_category || "Runtime error detected", "error");
      }
    } catch (err) {
      setRunResult(`Error: ${err.message}`);
      toast("Failed to connect to server.", "error");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    setIsRunning(true);
    setSubmitStatus("checking");
    try {
      const res = await runCode(code, `${activeChallenge.id}.py`);
      const output = (res.output || "").trim();
      const expected = activeChallenge.expectedOutput.trim();

      if (res.success && output.includes(expected)) {
        setSubmitStatus("passed");
        setRunResult(`✓ Test Passed!\nOutput: ${output}`);
        toast("🎉 Challenge passed! Great work!", "success", 4000);
        // Update progress in localStorage
        try {
          const progress = JSON.parse(localStorage.getItem("codesense_user_progress") || "{}");
          progress.problemsSolved = (progress.problemsSolved || 0) + 1;
          progress.programsCompleted = (progress.programsCompleted || 0) + 1;
          localStorage.setItem("codesense_user_progress", JSON.stringify(progress));
        } catch (e) {}
      } else {
        setSubmitStatus("failed");
        setRunResult(
          `❌ Test did not match expected output.\nExpected: ${expected}\nActual Output: ${output || res.error || "None"}`
        );
        toast(`Expected: ${expected} — Got: ${output || "none"}`, "warning", 4000);
      }
    } catch (err) {
      setSubmitStatus("failed");
      setRunResult(`Submission error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="page-section challenges-page-container">
      <div className="section-heading">
        <Code2 size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Interactive Practice</p>
          <h1>Coding Challenges</h1>
        </div>
      </div>
      <p className="section-subtext">
        Select a challenge, write your solution in the browser editor, run test cases, and submit to earn progress badges!
      </p>

      {/* Difficulty Filter */}
      <div className="difficulty-pills">
        {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
          <button
            key={level}
            className={`difficulty-pill ${selectedDifficulty === level ? "active" : ""}`}
            onClick={() => setSelectedDifficulty(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="challenge-workspace-split">
        {/* Left Challenge List */}
        <aside className="challenge-list-sidebar">
          <h3>Practice Problems</h3>
          <div className="challenge-menu">
            {filteredChallenges.map((ch) => (
              <div
                key={ch.id}
                className={`challenge-menu-item ${ch.id === activeChallenge.id ? "active" : ""}`}
                onClick={() => handleSelectChallenge(ch)}
              >
                <div className="challenge-item-header">
                  <span className="challenge-item-title">{ch.title}</span>
                  <span className={`badge badge-${ch.difficulty.toLowerCase()}`}>{ch.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Problem Solver */}
        <div className="challenge-solver-pane">
          <div className="challenge-problem-card">
            <div className="problem-header-row">
              <h2>{activeChallenge.title}</h2>
              <span className={`badge badge-${activeChallenge.difficulty.toLowerCase()}`}>
                {activeChallenge.difficulty}
              </span>
            </div>

            <p className="problem-description">{activeChallenge.description}</p>

            <div className="io-example-box">
              <div className="io-item">
                <span className="io-label">Example Input:</span>
                <code>{activeChallenge.exampleInput}</code>
              </div>
              <div className="io-item">
                <span className="io-label">Expected Output:</span>
                <code>{activeChallenge.expectedOutput}</code>
              </div>
            </div>

            <div className="hint-section">
              <button className="btn-link" onClick={() => setShowHint(!showHint)}>
                <HelpCircle size={14} />
                <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
              </button>
              {showHint && <p className="hint-text">💡 {activeChallenge.hint}</p>}
            </div>
          </div>

          {/* Monaco Editor for Challenges */}
          <div className="challenge-editor-box">
            <div className="challenge-editor-header">
              <span>Solution Editor (Python)</span>
              <div className="challenge-actions">
                <button
                  className="secondary-button"
                  onClick={handleRun}
                  disabled={isRunning}
                  id="challenge-run-btn"
                >
                  <Play size={14} />
                  <span>{isRunning ? "Running…" : "Run"}</span>
                </button>
                <button
                  className="primary-button"
                  onClick={handleSubmit}
                  disabled={isRunning}
                  id="challenge-submit-btn"
                >
                  <Send size={14} />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>

            <div className="challenge-monaco-wrap">
              <Editor
                height="240px"
                defaultLanguage="python"
                language="python"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  tabSize: 4,
                  wordWrap: "on",
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  renderLineHighlight: "line",
                  folding: false,
                  padding: { top: 8, bottom: 8 },
                }}
              />
            </div>

            {/* Output and Status */}
            {runResult && (
              <div
                className={`challenge-output-box ${
                  submitStatus === "passed"
                    ? "output-passed"
                    : submitStatus === "failed"
                    ? "output-failed"
                    : ""
                }`}
              >
                <pre>{runResult}</pre>
                {submitStatus === "passed" && (
                  <div className="challenge-explanation-card">
                    <h4>🎉 Solution Explanation</h4>
                    <p>{activeChallenge.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
