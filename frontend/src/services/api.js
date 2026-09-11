const BASE_URL = "https://code-sense-c4lh.onrender.com/api";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to the CodeSense backend server. Please try again later."
      );
    }
    throw error;
  }
}

export async function checkHealth() {
  return request("/health");
}

export async function analyzeCode(code, filename = "main.py", language = "python") {
  return request("/analyze", {
    method: "POST",
    body: JSON.stringify({ code, filename, language }),
  });
}

export async function runCode(code, filename = "main.py", language = "python") {
  return request("/run", {
    method: "POST",
    body: JSON.stringify({ code, filename, language }),
  });
}

export async function getHistory() {
  return request("/history");
}

export async function saveHistory(code, result, filename = "main.py") {
  return request("/history", {
    method: "POST",
    body: JSON.stringify({ code, result, filename }),
  });
}

export async function getRecommendation(category) {
  const encoded = encodeURIComponent(category);
  return request(`/recommendation/${encoded}`);
}
