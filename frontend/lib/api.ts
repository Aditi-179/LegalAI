const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
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
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload) {
  return request<{ access_token: string; user: { name: string; email?: string } }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Versioned query endpoint (requires authentication or falls back to demo user)
 */
export async function queryAssistant(question: string, history: any[] = [], contextText?: string) {
  return request<{ answer: string; contexts: string[] }>("/api/v1/query", {
    method: "POST",
    body: JSON.stringify({ 
      question, 
      chat_history: history,
      context_text: contextText 
    }),
  });
}

export async function* queryAssistantStream(question: string, history: any[] = [], contextText?: string) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/query/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ 
      question, 
      chat_history: history,
      context_text: contextText 
    }),
  });

  if (!response.ok) {
    throw new Error("Stream request failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

/**
 * Root chat endpoint (simpler, unauthenticated direct access)
 */
export async function chatWithAI(query: string, history: any[] = []) {
  const data = await request<{ answer: string; citations: any[] }>("/chat", {
    method: "POST",
    body: JSON.stringify({ query, chat_history: history }),
  });
  
  // Map citations to the 'contexts' format expected by the frontend
  return {
    answer: data.answer,
    contexts: data.citations.map(c => `${c.act_name} Sec ${c.section}: ${c.title}\n${c.content}`)
  };
}

export async function fetchMapping(code: string) {
  return request<{
    ipc_section: string;
    bns_section: string;
    title: string;
    summary: string;
    notes: string;
    source: string;
  }>(`/api/v1/map?code=${encodeURIComponent(code)}`);
}

export async function explainDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ filename: string; explanation: string; highlights: string[] }>("/api/v1/upload", {
    method: "POST",
    body: formData,
  });
}

export async function generateDraft(payload: Record<string, any>) {
  return request<{ content: string }>("/api/v1/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface Scheme {
  scheme_name: str;
  short_description: str;
  eligibility: str;
  benefits: str;
  official_link: str;
}

export async function searchSchemes(query: string) {
  return request<{ search_query: string; schemes: Scheme[] }>(`/api/v1/schemes/search?q=${encodeURIComponent(query)}`);
}

export async function fetchHistory() {
  const data = await request<{ items: { kind: string; title: string; summary: string; created_at: string }[] }>(
    "/api/v1/history",
  );
  return data.items;
}
