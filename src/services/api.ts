import type {
  AuthResponse,
  Scheme,
  MyScheme,
  Agent,
  ApplicationRequirements,
  ApplicationSubmission,
  VerifyOutcome,
  User,
} from '../types/api';
import {
  MOCK_SCHEMES,
  MOCK_MY_SCHEMES,
  MOCK_AGENTS,
  MOCK_REQUIREMENTS,
  MOCK_VERIFY_OUTCOME,
} from '../mocks/data';

const AUTH_URL  = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const USE_MOCK  = import.meta.env.VITE_USE_MOCK_API === 'true';

const delay = (ms = 650) => new Promise(r => setTimeout(r, ms));

// ─── Raw fetch helper (auth server only) ─────────────────────────────────────

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('tg-token');
  const res = await fetch(`${AUTH_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  const body = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? 'Request failed');
  return body as T;
}

// ─── Auth — always hits real server ──────────────────────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  return authRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signUpWithEmail(name: string, email: string, password: string): Promise<AuthResponse> {
  return authRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function updateProfile(
  data: { name?: string; email?: string; currentPassword?: string; newPassword?: string },
): Promise<AuthResponse> {
  return authRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  await authRequest('/auth/logout', { method: 'POST' }).catch(() => {});
}

// ─── Schemes ─────────────────────────────────────────────────────────────────

export async function fetchSchemes(query?: string): Promise<Scheme[]> {
  if (USE_MOCK) {
    await delay();
    if (!query) return MOCK_SCHEMES;
    const q = query.toLowerCase();
    return MOCK_SCHEMES.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q)),
    );
  }
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return authRequest(`/schemes${qs}`);
}

export async function fetchSchemeById(id: string): Promise<Scheme> {
  if (USE_MOCK) {
    await delay(400);
    const s = MOCK_SCHEMES.find(s => s.id === id);
    if (!s) throw new Error('Scheme not found');
    return s;
  }
  return authRequest(`/schemes/${id}`);
}

// ─── My Schemes ───────────────────────────────────────────────────────────────

export async function fetchMySchemes(): Promise<MyScheme[]> {
  if (USE_MOCK) { await delay(); return MOCK_MY_SCHEMES; }
  return authRequest('/my-schemes');
}

// ─── Application ──────────────────────────────────────────────────────────────

export async function fetchRequirements(schemeId: string): Promise<ApplicationRequirements> {
  if (USE_MOCK) { await delay(); return { ...MOCK_REQUIREMENTS, schemeId }; }
  return authRequest(`/schemes/${schemeId}/requirements`);
}

export async function submitApplication(data: ApplicationSubmission): Promise<{ applicationId: string }> {
  if (USE_MOCK) {
    await delay(1400);
    return { applicationId: `TG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}` };
  }
  const form = new FormData();
  Object.entries(data.formData).forEach(([k, v]) => form.append(k, v as string | Blob));
  return authRequest(`/schemes/${data.schemeId}/apply`, { method: 'POST', body: form, headers: {} });
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export async function fetchVerifyOutcome(applicationId: string): Promise<VerifyOutcome> {
  if (USE_MOCK) { await delay(1600); return { ...MOCK_VERIFY_OUTCOME, applicationId }; }
  return authRequest(`/applications/${applicationId}/verify`);
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
  if (USE_MOCK) { await delay(); return MOCK_AGENTS; }
  return authRequest('/agents');
}

// ─── Unused export kept for type safety ──────────────────────────────────────
export type { User };
