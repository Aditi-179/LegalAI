const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "legalai_token";
const USER_KEY = "legalai_user";

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string };
type DraftPayload = {
  draft_type: string;
  title: string;
  parties: string;
  facts: string;
  relief_sought: string;
  extra_instructions: string;
};

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function storeToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function storeSession(token: string, user: { name: string; email?: string }) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { name: string; email?: string };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getToken();
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function registerUser(payload: RegisterPayload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload) {
  return request<{ access_token: string; user: { name: string; email?: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function queryAssistant(question: string) {
  return request<{ answer: string; contexts: string[] }>("/query", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export async function fetchMapping(code: string) {
  return request<{
    ipc_section: string;
    bns_section: string;
    title: string;
    summary: string;
    notes: string;
    source: string;
  }>(`/map?code=${encodeURIComponent(code)}`);
}

export async function explainDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ filename: string; explanation: string; highlights: string[] }>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function createDraft(payload: DraftPayload) {
  return request<{ content: string }>("/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchHistory() {
  const data = await request<{ items: { kind: string; title: string; summary: string; created_at: string }[] }>(
    "/history",
  );
  return data.items;
}
