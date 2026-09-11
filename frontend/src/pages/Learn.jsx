import { useState } from "react";
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Code2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CONCEPTS_DATA = [
  {
    id: "syntax",
    category: "Syntax Error",
    title: "Python Syntax & Statement Grammar",
    tagline: "Mastering colons, brackets, quotes, and structural grammar.",
    explanation:
      "Python relies on strict syntax rules so the interpreter can understand your statements. Common syntax errors happen when colons are omitted after if/for/def, brackets or parentheses aren't closed, or quotation marks don't match.",
    example: `# Valid Python statement syntax
age = 18

if age >= 18:
    print("Welcome! You are eligible.")
else:
    print("Underage access only.")`,
    commonMistakes: [
      "Forgetting the colon ':' at the end of if, else, for, while, or def lines",
      "Mismatched quotation marks (e.g. 'hello\")",
      "Unclosed parentheses or square brackets (e.g. print('test' or [1, 2)",
    ],
    practice:
      "Write a function called is_positive(num) that checks if a number is greater than 0, prints 'Positive' or 'Not positive', and uses proper colons.",
    starterCode: `def is_positive(num):
    if num > 0:
        print("Positive")
    else:
        print("Not positive")

is_positive(10)
is_positive(-3)
`,
  },
  {
    id: "name",
    category: "Name Error",
    title: "Variables, Scope & Identifiers",
    tagline: "Defining variables before using them and managing scope.",
    explanation:
      "A NameError occurs when Python encounters a variable, function, or module name that has not yet been declared or assigned in the current scope. Always initialize your variables before reading them.",
    example: `# Assign the variable before referencing it
total_score = 100
multiplier = 2

final_result = total_score * multiplier
print("Final result:", final_result)`,
    commonMistakes: [
      "Typos in variable names (e.g. declaring total_score but printing total_scor)",
      "Using a variable inside a function that was only defined locally elsewhere",
      "Calling a function before its def block has been executed",
    ],
    practice:
      "Initialize two variables, item_price and tax_rate, and print the calculated total including tax.",
    starterCode: `item_price = 45.0
tax_rate = 0.08

total = item_price + (item_price * tax_rate)
print(f"Total payable: \${total:.2f}")
`,
  },
  {
    id: "type",
    category: "Type Error",
    title: "Python Data Types & Conversions",
    tagline: "Working with strings, integers, floats, and explicit type casting.",
    explanation:
      "A TypeError occurs when an operation is performed on incompatible data types, such as concatenating a string with an integer directly. Use functions like str(), int(), and float() to cast types safely.",
    example: `# Convert integer to string before concatenating
user_name = "Alex"
user_age = 21

# Safe concatenation with str() or f-strings
message = f"Hello {user_name}, you are {user_age} years old."
print(message)`,
    commonMistakes: [
      'Trying to do "Score: " + score instead of f"Score: {score}" or "Score: " + str(score)',
      'Calling len() on an integer or float instead of a list, string, or collection',
      "Performing arithmetic operations with string input from input() without converting via int()",
    ],
    practice:
      "Take a number stored as a string (e.g. '150'), convert it to an integer, add 50 to it, and print the result.",
    starterCode: `price_str = "150"
price_num = int(price_str)
discounted = price_num + 50
print("Calculated:", discounted)
`,
  },
  {
    id: "runtime",
    category: "Runtime Error",
    title: "Exception Handling & ZeroDivisionError",
    tagline: "Preventing crashes with input validation and try/except blocks.",
    explanation:
      "Runtime errors occur while the program is actively executing with real inputs. For example, dividing by zero or converting non-numeric text to an integer will raise an exception. Use try/except to handle exceptions gracefully.",
    example: `# Safe division with exception handling
def safe_divide(numerator, denominator):
    try:
        return numerator / denominator
    except ZeroDivisionError:
        print("Warning: Cannot divide by zero!")
        return None

print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
    commonMistakes: [
      "Dividing by zero when an input or counter hits 0",
      "Assuming user input is always valid numbers without checking",
      "Catching overly broad exceptions without logging the cause",
    ],
    practice:
      "Create a function safe_int_convert(val) that attempts to convert a string to an integer, returning None if ValueError is raised.",
    starterCode: `def safe_int_convert(val):
    try:
        return int(val)
    except ValueError:
        print(f"Cannot convert '{val}' to integer")
        return None

print(safe_int_convert("42"))
print(safe_int_convert("not_a_number"))
`,
  },
  {
    id: "indentation",
    category: "Indentation Error",
    title: "Indentation & Code Block Hierarchy",
    tagline: "Structuring functions, loops, and conditional blocks with 4 spaces.",
    explanation:
      "Unlike languages that use curly braces {}, Python uses whitespace indentation to define code blocks. Every statement inside an if, for, while, or function must be indented consistently with 4 spaces.",
    example: `# Clean 4-space indentation hierarchy
def check_grades(scores):
    for score in scores:
        if score >= 90:
            print(f"{score}: Grade A")
        elif score >= 80:
            print(f"{score}: Grade B")
        else:
            print(f"{score}: Keep practicing")

check_grades([95, 82, 67])`,
    commonMistakes: [
      "Mixing tabs and spaces across the same file",
      "Forgetting to indent the statement immediately following a colon",
      "Unindenting a block too early or with uneven spacing (e.g. 3 spaces instead of 4)",
    ],
    practice:
      "Write a nested loop that prints a 3x3 grid of asterisks with consistent 4-space indentation.",
    starterCode: `for row in range(3):
    line = ""
    for col in range(3):
        line += "* "
    print(line)
`,
  },
  {
    id: "import",
    category: "Import Error",
    title: "Modules, Packages & Imports",
    tagline: "Importing standard library modules and external packages.",
    explanation:
      "An ImportError or ModuleNotFoundError happens when Python cannot locate the requested module or an attribute inside it. Ensure the module is installed in your Python environment and spelled accurately.",
    example: `# Importing from Python standard library
import math
import random

radius = 5
area = math.pi * (radius ** 2)
print(f"Area of circle: {area:.2f}")

lucky_number = random.randint(1, 100)
print(f"Lucky number: {lucky_number}")`,
    commonMistakes: [
      "Spelling errors in module names (e.g. import mathe instead of import math)",
      "Naming a local script the same name as a built-in module (e.g. naming your file math.py)",
      "Attempting to import a package before installing it with pip",
    ],
    practice:
      "Import the datetime module and print today's current year, month, and day.",
    starterCode: `from datetime import datetime

today = datetime.now()
print("Year:", today.year)
print("Month:", today.month)
print("Day:", today.day)
`,
  },
  {
    id: "index",
    category: "Index Error",
    title: "Python Lists & Index Boundaries",
    tagline: "Mastering zero-based indexing, negative indexes, and len() safely.",
    explanation:
      "An IndexError occurs when you attempt to retrieve an item from a list or string at an index that doesn't exist. Python indexes start at 0 and end at len(list) - 1. Always check bounds or use safe iteration.",
    example: `# Safe list indexing
colors = ["red", "green", "blue"]

# Positive indexing: 0, 1, 2
print("First color:", colors[0])

# Negative indexing: -1 is the last item
print("Last color:", colors[-1])

# Check boundaries using len()
requested_index = 2
if 0 <= requested_index < len(colors):
    print("Safe item:", colors[requested_index])`,
    commonMistakes: [
      "Accessing list[len(list)] instead of list[len(list) - 1]",
      "Accessing elements from an empty list [] without verifying length",
      "Using an arbitrary index without boundary checks",
    ],
    practice:
      "Create a list of 4 cities. Safely retrieve the 2nd city and the last city without causing an IndexError.",
    starterCode: `cities = ["Tokyo", "London", "New York", "Paris"]

# Safe access
if len(cities) >= 2:
    print("Second city:", cities[1])
print("Last city:", cities[-1])
`,
  },
  {
    id: "logical",
    category: "Logical Error",
    title: "Program Logic & Boolean Operators",
    tagline: "Verifying relational expressions, truth tables, and boundary edge cases.",
    explanation:
      "Logical errors don't cause the program to crash, but they produce incorrect outputs. They usually stem from inverted comparison operators (< instead of >), off-by-one boundary conditions, or flawed boolean logic.",
    example: `# Validating logic with test assertions
def calculate_discount(price, is_member):
    # Bug prevention: 20% discount if member, 5% otherwise
    if is_member:
        return price * 0.80
    return price * 0.95

# Test logic
assert calculate_discount(100, True) == 80.0
assert calculate_discount(100, False) == 95.0
print("All logic tests passed!")`,
    commonMistakes: [
      "Using assignment '=' inside conditions instead of comparison '=='",
      "Confusing 'and' with 'or' in multiple conditions",
      "Off-by-one errors (e.g. using < instead of <= when including the boundary value)",
    ],
    practice:
      "Write a function is_leap_year(year) that accurately checks leap year rules (divisible by 4 and not 100, or divisible by 400).",
    starterCode: `def is_leap_year(year):
    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

print("2024 leap?", is_leap_year(2024))
print("1900 leap?", is_leap_year(1900))
print("2000 leap?", is_leap_year(2000))
`,
  },
];

export default function Learn({ onSelectCode }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const categories = ["All", ...CONCEPTS_DATA.map((c) => c.category)];

  const filteredConcepts = CONCEPTS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function handlePractice(starterCode) {
    if (onSelectCode) {
      onSelectCode(starterCode);
    } else {
      sessionStorage.setItem("codesense_code", starterCode);
    }
    navigate("/analyzer");
  }

  return (
    <section className="page-section learn-page-container">
      <div className="section-heading">
        <BookOpen size={28} className="text-primary" />
        <div>
          <p className="eyebrow">Curriculum &amp; Concepts</p>
          <h1>Python Programming Concepts</h1>
        </div>
      </div>

      <p className="section-subtext">
        Explore core Python concepts, understand why specific errors occur, study clean examples, and practice directly in the CodeSense IDE.
      </p>

      {/* Search and Category Filters */}
      <div className="learn-filter-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts, errors, or topics..."
          />
        </div>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Concepts Grid */}
      <div className="concepts-grid">
        {filteredConcepts.map((item) => (
          <article key={item.id} className="concept-card">
            <div className="concept-card-header">
              <span className="concept-category-badge">{item.category}</span>
              <h2 className="concept-title">{item.title}</h2>
              <p className="concept-tagline">{item.tagline}</p>
            </div>

            <div className="concept-card-body">
              <p className="concept-explanation">{item.explanation}</p>

              <div className="concept-example-box">
                <span className="example-label">
                  <Code2 size={13} /> Clean Code Example
                </span>
                <pre className="concept-pre">
                  <code>{item.example}</code>
                </pre>
              </div>

              <div className="concept-mistakes-box">
                <span className="mistakes-label">
                  <AlertTriangle size={13} /> Common Beginner Pitfalls
                </span>
                <ul className="mistakes-list">
                  {item.commonMistakes.map((mistake, i) => (
                    <li key={i}>• {mistake}</li>
                  ))}
                </ul>
              </div>

              <div className="concept-practice-box">
                <span className="practice-label">
                  <Sparkles size={13} /> Practice Challenge
                </span>
                <p className="practice-desc">{item.practice}</p>
              </div>
            </div>

            <div className="concept-card-footer">
              <button
                className="primary-button practice-in-ide-btn"
                onClick={() => handlePractice(item.starterCode)}
                title="Load exercise into CodeSense IDE"
              >
                <span>Practice in IDE</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
