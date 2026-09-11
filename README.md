# CodeSense

**CodeSense – Code Smarter. Learn Faster.**

An ML-powered, VS Code-style intelligent coding learning platform for beginner Python programmers. CodeSense detects errors in real time, classifies them with a trained machine learning model, explains what went wrong in plain English, recommends the exact programming concept to revise, and lets you safely execute code — all in a single browser window.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Dataset](#dataset)
5. [ML Pipeline](#ml-pipeline)
6. [API Reference](#api-reference)
7. [Frontend](#frontend)
8. [Installation](#installation)
9. [Running the Application](#running-the-application)
10. [Running Tests](#running-tests)
11. [Jupyter Notebooks](#jupyter-notebooks)
12. [Project Structure](#project-structure)
13. [Error Categories](#error-categories)
14. [Tech Stack](#tech-stack)

---

## Overview

CodeSense is a full-stack web application that acts as an intelligent Python tutor. It mimics the VS Code experience in the browser using Monaco Editor, adds a real-time error detection layer powered by Python AST analysis and subprocess execution, and uses a trained scikit-learn classifier to predict the category of any detected error. Based on that prediction, it surfaces a tailored concept recommendation to guide the student toward the relevant topic.

**The learning loop:**

```
Student writes code
  → Real-time AST + static analysis (600 ms debounce)
  → Error detected → editor pulses red, audio siren fires
  → ML model predicts error category (8 classes)
  → Explanation generated in plain English
  → Concept recommendation surfaced
  → Student revises code → success banner + chime
  → History entry saved to SQLite
  → Dashboard updates with new analytics
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Monaco Editor** | Full VS Code browser experience — syntax highlighting, IntelliSense, line numbers, code folding, squiggles |
| **Real-Time Error Detection** | 600 ms debounced analysis on every keystroke using Python AST + static name analysis + isolated subprocess |
| **Red Pulse Animation** | Editor container pulsates with a red aura when an error is present; switches to green on success |
| **Audio Cues** | 4-pulse Web Audio API siren on new errors; success chime when code is fixed |
| **ML Error Classification** | TF-IDF + Logistic Regression trained on 2,000 samples across 8 categories |
| **Error Result Panel** | Shows error type, line number, ML category, confidence bar, plain-English explanation, and suggested fix |
| **Concept Recommendation** | Targeted learning topic with ✓ bullet topics, code example, and practice exercise |
| **Safe Code Execution** | Isolated subprocess with `python -I -s` flags and 4-second timeout against infinite loops |
| **History Timeline** | SQLite-backed audit log of all analyses and runs, with search and click-to-load |
| **Dashboard Analytics** | Error category distribution charts, success/error ratio, activity feed, concept frequency |
| **File Explorer** | Create, rename, and delete virtual .py files in the browser sidebar |
| **Language Switching** | Python, JavaScript, C, C++, Java — with JS running via Node.js if available |
| **Theme System** | Light, Dark, System, and Traditional modes via CSS custom properties |
| **Sound Toggle** | Persistent mute/unmute via localStorage, shown in navbar |
| **Bonus Pages** | Learn, Challenges, Progress, References, Settings |

---

## Architecture

```
code-sense/
├── backend/                Flask REST API
│   ├── app.py              Factory + blueprint registration
│   ├── routes/
│   │   ├── analyze.py      POST /api/analyze  (AST + ML)
│   │   ├── run.py          POST /api/run       (subprocess)
│   │   ├── history.py      GET/POST/DELETE /api/history
│   │   └── recommendation.py GET /api/recommendation/<category>
│   ├── ml/
│   │   ├── train.py        One-off model training script
│   │   ├── predict.py      Prediction helper (loads pickled model)
│   │   └── preprocessing.py  clean_text / combine_features
│   ├── recommendation/
│   │   ├── recommendations.json  Concept data for all 8 categories
│   │   └── concept_mapping.py    get_recommendation()
│   └── utils/
│       ├── code_parser.py  AST parse / name analysis / isolated run
│       └── error_extractor.py  Category normalisation + confidence clamp
├── frontend/               React + Vite SPA
│   └── src/
│       ├── components/     Monaco editor, panels, Navbar, History, etc.
│       ├── pages/          Analyzer, Home, Dashboard, About, ...
│       ├── services/api.js Fetch wrapper for all backend endpoints
│       └── styles.css      Single-file vanilla CSS design system
├── dataset/
│   └── error_dataset.csv   2,000 labelled Python error examples
├── notebooks/              Jupyter analysis notebooks
├── tests/                  pytest test suite
└── requirements.txt
```

---

## Dataset

**File:** `dataset/error_dataset.csv`  
**Records:** 2,000 Python error examples  
**Balance:** Perfectly balanced — 250 samples per category  

**Columns:**

| Column | Description |
|--------|-------------|
| `id` | Unique row identifier |
| `language` | Programming language (Python) |
| `code` | Python code snippet |
| `error_message` | Human-readable error message |
| `error_category` | Target class (8 categories) |
| `error_type` | Specific error sub-type |
| `concept` | Programming concept to learn |
| `difficulty` | `Beginner` or `Intermediate` |
| `expected_output` | What the code should produce |
| `actual_output` | What the code actually produces |
| `explanation` | Plain-English explanation of the error |
| `suggested_fix` | How to fix the error |
| `keywords` | Search keywords for the error |

---

## ML Pipeline

### Training

```bash
python backend/ml/train.py
```

Produces:
- `backend/ml/model.pkl` — trained LogisticRegression
- `backend/ml/vectorizer.pkl` — fitted TfidfVectorizer

### Feature Engineering

For each code sample, `combine_features()` concatenates:
```
code + error_message + error_type + concept + keywords
```

`clean_text()` then lowercases, strips special characters, and normalises whitespace.

### Model

```python
TfidfVectorizer(ngram_range=(1, 2), max_features=8000, sublinear_tf=True)
LogisticRegression(max_iter=1000, class_weight='balanced', solver='lbfgs')
```

### Prediction

At runtime, `predict_error_category(text)` returns `(category, confidence)` where:
- `category` is one of the 8 error classes
- `confidence` is the max softmax probability, clamped to `[0.55, 0.99]`

The analyze route uses both the static parser result and the ML prediction, preferring the deterministic AST result for syntax/indentation errors and the ML output for ambiguous runtime cases.

---

## API Reference

All endpoints are prefixed with `/api`.

### `POST /api/analyze`

Analyze Python code for errors.

**Request body:**
```json
{ "code": "print(undefined_var)", "filename": "main.py", "language": "python" }
```

**Response (error):**
```json
{
  "success": true,
  "has_error": true,
  "error_category": "Name Error",
  "error_type": "Undefined Name",
  "error_message": "name 'undefined_var' is not defined",
  "line": 1,
  "confidence": 0.83,
  "explanation": "A variable, function, or name is used before it was defined.",
  "suggested_fix": "Verify the spelling and ensure the variable is assigned before use.",
  "concept": "Variables, Scope, and Naming",
  "recommendation": { "concept": "...", "why": "...", "topics": [...], "example": "...", "practice": "..." },
  "complexity": { "time": "O(1)", "space": "O(1)" },
  "status": "Needs Revision"
}
```

**Response (clean):**
```json
{
  "success": true,
  "has_error": false,
  "status": "Correct",
  "complexity": { "time": "O(n)", "space": "O(1)" },
  "functions": ["main"],
  "variables": ["total", "count"],
  "improvements": [],
  "learn_next": [{ "topic": "...", "explanation": "...", "difficulty": "..." }]
}
```

---

### `POST /api/run`

Execute Python code safely in an isolated subprocess.

**Request body:**
```json
{ "code": "print('Hello, CodeSense!')", "filename": "main.py" }
```

**Response (success):**
```json
{ "success": true, "has_error": false, "output": "Hello, CodeSense!\n", "status": "Correct" }
```

**Response (error):**
```json
{
  "success": false,
  "has_error": true,
  "output": "",
  "error": "Traceback...\nZeroDivisionError: division by zero",
  "error_category": "Runtime Error",
  "line": 2,
  "confidence": 0.88,
  "recommendation": { ... },
  "status": "Needs Revision"
}
```

---

### `GET /api/history`

Returns the last 100 analysis/run entries ordered by most recent.

```json
{
  "success": true,
  "history": [
    {
      "id": 42,
      "code": "...",
      "has_error": true,
      "error_category": "Index Error",
      "concept": "Python Lists and Indexing",
      "filename": "main.py",
      "status": "Needs Revision",
      "action_type": "analysis",
      "created_at": "2026-09-09 15:22:01"
    }
  ]
}
```

### `POST /api/history`

Save a history entry manually.

### `DELETE /api/history/<id>`

Delete a specific history entry by ID.

### `DELETE /api/history`

Clear all history entries.

---

### `GET /api/recommendation/<category>`

Get the concept recommendation for a given error category.

**Example:** `GET /api/recommendation/Name Error`

```json
{
  "success": true,
  "recommendation": {
    "concept": "Variables, Scope, and Naming",
    "difficulty": "Beginner",
    "why": "A name error means Python saw a variable, function, or module name before it knew what that name referred to.",
    "topics": ["Variable assignment", "Spelling names consistently", "Function scope", "Import names"],
    "example": "score = 10\nprint(score)",
    "practice": "Create three variables, print them, then rename one safely everywhere it is used."
  }
}
```

### `GET /api/health`

Health check endpoint. Returns `{ "success": true }`.

---

## Frontend

The frontend is a React 18 + Vite SPA. Key pages:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home.jsx` | Hero + workflow + features |
| `/analyzer` | `Analyzer.jsx` | The main IDE view |
| `/dashboard` | `Dashboard.jsx` | Analytics charts + history feed |
| `/about` | `About.jsx` | Architecture + tech stack |
| `/history` | `HistoryPage.jsx` | Full history table |
| `/learn` | `Learn.jsx` | Python concept curriculum |
| `/challenges` | `Challenges.jsx` | Coding exercises |
| `/progress` | `Progress.jsx` | Learning progress tracker |
| `/settings` | `Settings.jsx` | Theme + sound preferences |

Key components:

| Component | Purpose |
|-----------|---------|
| `VSCodeEditor.jsx` | Monaco Editor wrapper with error squiggles, gutter markers, snippets |
| `CodeEditor.jsx` | Canonical entry point — delegates to VSCodeEditor |
| `ErrorResult.jsx` | Error type / line / category / confidence bar / explanation |
| `Recommendation.jsx` | Concept title / difficulty / ✓ topics / example / practice / CTA |
| `History.jsx` | Clickable history timeline with search |
| `BottomPanel.jsx` | Problems / Output / Terminal / Recommendation tabs |
| `RightAssistantPanel.jsx` | Suggestions / Analysis / Improvements / Learn Next tabs |
| `FileExplorer.jsx` | Virtual file tree with create / rename / delete |
| `Navbar.jsx` | Sticky header with primary nav + More dropdown + sound toggle |
| `Toast.jsx` | Auto-dismissing notifications |

---

## Installation

### Prerequisites

- Python 3.10+ (tested on 3.14)
- Node.js 18+ and npm
- Git

### Backend

```bash
cd code-sense
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### Train the ML model

```bash
python backend/ml/train.py
```

This creates `backend/ml/model.pkl` and `backend/ml/vectorizer.pkl`. Only needs to be run once (or after dataset changes).

### Frontend

```bash
cd frontend
npm install
```

---

## Running the Application

### 1. Start the backend

```bash
python backend/app.py
```

API runs at `http://127.0.0.1:5000`

### 2. Start the frontend (separate terminal)

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173`

The Vite dev server proxies all `/api` requests to `http://127.0.0.1:5000` automatically.

### Quick start (PowerShell — two windows)

```powershell
# Window 1
python backend/app.py

# Window 2
cd frontend; npm run dev
```

---

## Running Tests

```bash
python -m pytest tests/ -v --tb=short
```

**Test suite covers:**
- Health endpoint
- Analyze: syntax, name, type, index errors; clean code; recommendation fields; complexity
- Run: success, runtime error, timeout, empty code, multiline output
- History: GET, POST, DELETE single entry, DELETE all, 404 on missing
- Recommendation: all 8 categories, unknown category fallback
- ML model: all 8 category predictions, confidence bounds, empty input, very long input
- Preprocessing: `clean_text` (lowercase, special chars, whitespace, None), `combine_features` (full rows, missing keys)

---

## Jupyter Notebooks

The `notebooks/` directory contains three analysis notebooks. Run from the project root with Jupyter installed (`pip install jupyter matplotlib`):

```bash
jupyter notebook notebooks/
```

| Notebook | Description |
|----------|-------------|
| `01_dataset_exploration.ipynb` | EDA: category/difficulty distributions, concept mappings, code length stats, keyword frequency |
| `02_model_training_evaluation.ipynb` | Full ML pipeline: training, 5-fold CV, confusion matrix, top TF-IDF features, confidence calibration |
| `03_error_pattern_analysis.ipynb` | Error type distributions, concept coverage, Python token heatmap, recommendation alignment |

---

## Project Structure

```
code-sense/
├── backend/
│   ├── app.py
│   ├── codesense.db              (auto-created SQLite database)
│   ├── ml/
│   │   ├── model.pkl             (auto-created by train.py)
│   │   ├── vectorizer.pkl        (auto-created by train.py)
│   │   ├── predict.py
│   │   ├── preprocessing.py
│   │   └── train.py
│   ├── recommendation/
│   │   ├── concept_mapping.py
│   │   └── recommendations.json
│   ├── routes/
│   │   ├── analyze.py
│   │   ├── history.py
│   │   ├── recommendation.py
│   │   └── run.py
│   └── utils/
│       ├── code_parser.py
│       └── error_extractor.py
├── dataset/
│   └── error_dataset.csv
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── BottomPanel.jsx
│       │   ├── CodeEditor.jsx
│       │   ├── ErrorResult.jsx
│       │   ├── FileExplorer.jsx
│       │   ├── History.jsx
│       │   ├── Navbar.jsx
│       │   ├── Recommendation.jsx
│       │   ├── RightAssistantPanel.jsx
│       │   ├── Toast.jsx
│       │   └── VSCodeEditor.jsx
│       ├── pages/
│       │   ├── About.jsx
│       │   ├── Analyzer.jsx
│       │   ├── Challenges.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Home.jsx
│       │   ├── HistoryPage.jsx
│       │   ├── Learn.jsx
│       │   ├── Progress.jsx
│       │   ├── References.jsx
│       │   └── Settings.jsx
│       └── services/
│           └── api.js
├── notebooks/
│   ├── 01_dataset_exploration.ipynb
│   ├── 02_model_training_evaluation.ipynb
│   └── 03_error_pattern_analysis.ipynb
├── tests/
│   ├── test_api.py
│   ├── test_model.py
│   └── test_preprocessing.py
├── .gitignore
├── pytest.ini
├── README.md
└── requirements.txt
```

---

## Error Categories

CodeSense classifies Python errors into 8 categories, all present in the dataset:

| Category | Example Exception | Concept Recommended |
|----------|------------------|---------------------|
| **Syntax Error** | `SyntaxError` | Python Syntax and Statement Structure |
| **Name Error** | `NameError`, `UnboundLocalError` | Variables, Scope, and Naming |
| **Type Error** | `TypeError` | Python Data Types and Operations |
| **Runtime Error** | `ZeroDivisionError`, `ValueError`, `AttributeError` | Runtime Flow and Exception Handling |
| **Indentation Error** | `IndentationError`, `TabError` | Python Indentation and Code Blocks |
| **Import Error** | `ImportError`, `ModuleNotFoundError` | Modules, Imports, and Packages |
| **Index Error** | `IndexError` | Python Lists and Indexing |
| **Logical Error** | `AssertionError` | Program Logic and Conditions |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, React Router v6 |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Styling | Vanilla CSS with custom properties |
| Icons | Lucide React |
| Backend | Flask 3.0, Flask-CORS |
| ML | scikit-learn 1.5 (TF-IDF + Logistic Regression) |
| Database | SQLite via Python `sqlite3` |
| Testing | pytest 8 |
| Analysis | pandas, numpy, matplotlib |
| Runtime | Python 3.14, Node.js 18+ |