const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || "http://localhost:8080");

export class ApiClientError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = {
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();
  const payload = rawText ? tryParseJson(rawText) : null;

  if (!response.ok) {
    throw new ApiClientError(extractErrorMessage(payload), response.status, payload);
  }

  return payload;
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractErrorMessage(payload) {
  if (!payload) {
    return "Nao foi possivel concluir a requisicao.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload.fieldErrors) && payload.fieldErrors.length) {
    return payload.fieldErrors.map((error) => `${error.field}: ${error.message}`).join(" | ");
  }

  return payload.message || "Nao foi possivel concluir a requisicao.";
}

function normalizeApiUrl(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
