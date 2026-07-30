import { firebaseAuth } from "./firebase";

// Default goes through the Next.js rewrite proxy (/backend -> FastAPI) so the
// browser only talks to the app's own origin. Set NEXT_PUBLIC_API_BASE_URL to
// hit a deployed backend directly instead. A localhost value is ignored in
// favor of the proxy — the user's browser can't reach the sandbox's localhost,
// and locally the proxy reaches the same server anyway.
const _rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL =
  _rawBase && !_rawBase.includes("localhost") && !_rawBase.includes("127.0.0.1")
    ? _rawBase
    : "/backend";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function authHeaders(): Promise<HeadersInit> {
  // firebaseAuth is null when the Firebase env vars aren't set yet.
  const token = await firebaseAuth?.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }
  // 204 / empty body endpoints (rare here, but safe to guard)
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

/** GET/POST JSON helpers — every route on the backend requires auth except /health. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: await authHeaders() });
  return handle<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handle<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return handle<T>(res);
}

/** Multipart upload — used for POST /items/upload, kept separate from apiPost
 * since it must NOT set a JSON Content-Type (the browser sets the multipart
 * boundary itself). */
export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: formData,
  });
  return handle<T>(res);
}

// ---------------------------------------------------------------------------
// Typed shapes mirroring backend/schemas.py — keep these two files in sync.
// ---------------------------------------------------------------------------
export interface Entity {
  type: string;
  value: string;
}

export interface Item {
  id: string;
  original_filename: string;
  original_mime_type: string;
  category: string;
  title: string;
  organization?: string | null;
  date?: string | null;
  description: string;
  skills: string[];
  tags: string[];
  entities: Entity[];
  file_url: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  total_items: number;
  by_category: Record<string, number>;
  top_skills: [string, number][];
  by_year: Record<string, number>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: { id: string; title: string; category: string }[];
}

// Career intelligence — mirrors backend/schemas.py
export interface SkillGapItem {
  skill: string;
  status: "have" | "partial" | "missing" | string;
  note: string;
}

export interface RoadmapStep {
  order: number;
  title: string;
  description: string;
  resource: string;
}

export interface CareerAnalysis {
  readiness_score: number;
  readiness_summary: string;
  strengths: string[];
  skill_gaps: SkillGapItem[];
  roadmap: RoadmapStep[];
  suggested_roles: string[];
}

export interface InterviewQuestion {
  question: string;
  category: string;
  hint: string;
}

export interface InterviewPrep {
  questions: InterviewQuestion[];
  tips: string[];
}

export interface RadarAxis {
  axis: string;
  score: number;
}

export interface ProfileStrength {
  overall: number;
  summary: string;
  radar: RadarAxis[];
  quick_wins: string[];
}

// ---------------------------------------------------------------------------
// Endpoint calls
// ---------------------------------------------------------------------------
export const api = {
  getCategories: () => apiGet<string[]>("/items/categories"),
  listItems: (category?: string) =>
    apiGet<Item[]>(`/items${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getItem: (id: string) => apiGet<Item>(`/items/${id}`),
  getTimeline: () => apiGet<Item[]>("/items/timeline"),
  getRelationships: (id: string) => apiGet<(Item & { shared_skills: string[] })[]>(`/items/${id}/relationships`),
  deleteItem: (id: string) => apiDelete<{ deleted: string }>(`/items/${id}`),
  uploadItem: (file: File) => apiUpload<Item>("/items/upload", file),

  search: (q: string, topK = 10) =>
    apiGet<(Item & { relevance: number })[]>(`/search?q=${encodeURIComponent(q)}&top_k=${topK}`),
  chat: (question: string, history: ChatMessage[]) =>
    apiPost<ChatResponse>("/chat", { question, history }),

  generateBio: () => apiPost<{ bio: string }>("/generate/bio"),
  generateResume: () => apiPost<{ full_summary: string; sections: { heading: string; bullets: string[] }[] }>(
    "/generate/resume"
  ),
  generatePortfolio: () =>
    apiPost<{ title: string; tagline: string; sections: { heading: string; content: string }[] }>(
      "/generate/portfolio"
    ),

  analyticsSummary: () => apiGet<AnalyticsSummary>("/analytics/summary"),

  careerAnalysis: (targetRole: string) =>
    apiPost<CareerAnalysis>("/career/analysis", { target_role: targetRole }),
  interviewPrep: (targetRole: string) =>
    apiPost<InterviewPrep>("/career/interview", { target_role: targetRole }),
  profileStrength: () => apiPost<ProfileStrength>("/career/strength"),
};
