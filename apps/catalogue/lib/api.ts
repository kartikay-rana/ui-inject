const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export function apiBase(): string {
  return API;
}

export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  accessLevel: 'free' | 'premium';
  status: string;
  publishedAt: string | null;
}

export interface SourceResponse {
  component: { slug: string; name: string; version: string; accessLevel: string; dependencies: string[] };
  files: Record<string, string>;
  usage: string;
  contentHash: string;
}

export async function listComponents(): Promise<ComponentMeta[]> {
  const res = await fetch(`${API}/api/v1/components`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  const data = (await res.json()) as { items: ComponentMeta[] };
  return data.items;
}

export async function getComponent(slug: string): Promise<ComponentMeta> {
  const res = await fetch(`${API}/api/v1/components/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`component ${slug} failed: ${res.status}`);
  const data = (await res.json()) as { item: ComponentMeta };
  return data.item;
}

export async function getPreviewHtml(slug: string, bearer?: string): Promise<{ html: string; contentHash: string }> {
  const res = await fetch(`${API}/api/v1/components/${slug}/preview`, {
    cache: 'no-store',
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  });
  if (res.status === 403) throw new PremiumRequiredError();
  if (!res.ok) throw new Error(`preview ${slug} failed: ${res.status}`);
  return (await res.json()) as { html: string; contentHash: string };
}

export async function getSource(slug: string, bearer?: string): Promise<SourceResponse> {
  const res = await fetch(`${API}/api/v1/components/${slug}/source`, {
    cache: 'no-store',
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  });
  if (res.status === 403) throw new PremiumRequiredError();
  if (!res.ok) throw new Error(`source ${slug} failed: ${res.status}`);
  return (await res.json()) as SourceResponse;
}

export async function getAgentPrompt(slug: string, bearer?: string): Promise<string> {
  const res = await fetch(`${API}/api/v1/components/${slug}/agent-prompt`, {
    cache: 'no-store',
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  });
  if (res.status === 403) throw new PremiumRequiredError();
  if (!res.ok) throw new Error(`prompt ${slug} failed: ${res.status}`);
  return res.text();
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('invalid credentials');
  const data = (await res.json()) as { token: string };
  return data.token;
}

export class PremiumRequiredError extends Error {
  constructor() {
    super('premium required');
    this.name = 'PremiumRequiredError';
  }
}

export function apiUrl(path: string): string {
  return `${API}${path}`;
}