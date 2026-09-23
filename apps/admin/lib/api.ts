const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export interface AdminComponent {
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  accessLevel: string;
  status: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminCustomer {
  id: string;
  email: string;
  name?: string | null;
  isPremium: boolean;
  createdAt?: string | null;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  detail?: Record<string, unknown> | null;
  createdAt?: string | null;
}

async function call<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export const api = {
  login: (username: string, password: string) =>
    fetch(`${API}/api/v1/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then((r) => {
      if (!r.ok) throw new Error('invalid admin credentials');
      return r.json() as Promise<{ token: string; user: { username: string; role: string } }>;
    }),

  listComponents: (token: string) => call<{ items: AdminComponent[] }>('/api/v1/admin/components', token),
  publish: (token: string, slug: string) => call<{ ok: boolean }>(`/api/v1/admin/components/${slug}/publish`, token, { method: 'POST' }),
  unpublish: (token: string, slug: string) => call<{ ok: boolean }>(`/api/v1/admin/components/${slug}/unpublish`, token, { method: 'POST' }),
  validate: (token: string, payload: unknown) => call<{ ok: boolean; errors: string[] }>('/api/v1/admin/components/validate', token, { method: 'POST', body: JSON.stringify(payload) }),
  create: (token: string, payload: unknown) => call<{ item: AdminComponent }>('/api/v1/admin/components', token, { method: 'POST', body: JSON.stringify(payload) }),

  listCustomers: (token: string) => call<{ items: AdminCustomer[] }>('/api/v1/admin/customers', token),
  setPremium: (token: string, id: string, premium: boolean) =>
    call<{ ok: boolean }>(`/api/v1/admin/customers/${id}/premium`, token, { method: 'POST', body: JSON.stringify({ premium }) }),

  listAudit: (token: string) => call<{ items: AuditEvent[] }>('/api/v1/admin/audit', token),
};
// admin session token is stored in window.localStorage under 'techinject_admin_token'