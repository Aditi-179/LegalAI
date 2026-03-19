const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type Citation = {
  act_name: string;
  section: string;
  title: string;
  content: string;
  score: number;
};

export type ChatResponse = {
  query: string;
  answer: string;
  citations: Citation[];
};

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

type LoginResponse = { access_token: string; user: { name: string; email?: string } };
type MappingResponse = {
  ipc_section: string;
  bns_section: string;
  title: string;
  summary: string;
  notes: string;
  source: string;
};
type UploadResponse = { filename: string; explanation: string; highlights: string[] };
type DraftResponse = { content: string };
type HistoryItem = { kind: string; title: string; summary: string; created_at: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
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

export async function queryAssistant(query: string, topK = 4) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ query, top_k: topK }),
  });
}

function unsupported(feature: string): never {
  throw new Error(`${feature} is not available in the current backend. Use the chat assistant flow instead.`);
}

export function storeToken(token: string) {
  void token;
}

export function storeSession(token: string, user: { name: string; email?: string }) {
  void token;
  void user;
}

export function getStoredUser() {
  return null;
}

export function clearSession() {}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  void payload;
  unsupported("Registration");
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  void payload;
  unsupported("Login");
}

export async function fetchMapping(code: string): Promise<MappingResponse> {
  void code;
  unsupported("IPC/BNS mapping");
}

export async function explainDocument(file: File): Promise<UploadResponse> {
  void file;
  unsupported("Document explanation");
}

export async function createDraft(payload: DraftPayload): Promise<DraftResponse> {
  void payload;
  unsupported("Draft generation");
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  unsupported("History");
}
