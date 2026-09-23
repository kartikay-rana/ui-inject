'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPreviewHtml, login, PremiumRequiredError } from '../lib/api';

const TOKEN_KEY = 'techinject_token';

export function PreviewPanel({ slug, accessLevel }: { slug: string; accessLevel: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'needsLogin' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (token: string | undefined) => {
    setStatus('loading');
    try {
      const result = await getPreviewHtml(slug, token);
      setHtml(result.html);
      setHash(result.contentHash);
      setStatus('ready');
    } catch (e) {
      if (e instanceof PremiumRequiredError) {
        setStatus('needsLogin');
        setMessage('This component is premium. Sign in to preview it.');
      } else {
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'preview failed');
      }
    }
  }, [slug]);

  useEffect(() => {
    if (accessLevel === 'free') {
      void load(undefined);
    } else {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) ?? undefined : undefined;
      if (token) void load(token);
      else {
        setStatus('needsLogin');
        setMessage('This component is premium. Sign in to preview it.');
      }
    }
  }, [load, accessLevel]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const token = await login(email, password);
      window.localStorage.setItem(TOKEN_KEY, token);
      await load(token);
    } catch {
      setMessage('Invalid credentials, or your account lacks premium access.');
      setStatus('needsLogin');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    window.localStorage.removeItem(TOKEN_KEY);
    setStatus('needsLogin');
    setMessage('This component is premium. Sign in to preview it.');
  }

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        background: '#0d0d0d',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem',
          color: '#9aa0ab',
        }}
      >
        <span>PREVIEW {accessLevel === 'premium' ? '• premium' : ''}</span>
        <span className="flex items-center gap-2">
          {accessLevel === 'premium' && status === 'ready' && (
            <button onClick={signOut} style={{ fontSize: '0.7rem', color: '#9aa0ab', background: 'none', border: 'none', cursor: 'pointer' }}>
              sign out
            </button>
          )}
          {hash && <span style={{ fontFamily: 'ui-monospace, monospace' }}>{hash.slice(0, 12)}</span>}
        </span>
      </div>

      {status === 'loading' && (
        <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>Compiling preview…</div>
      )}

      {status === 'ready' && html && (
        <iframe
          title={`${slug} preview`}
          sandbox="allow-scripts"
          srcDoc={html}
          style={{ width: '100%', height: 460, border: 0, display: 'block', background: '#0d0d0d' }}
        />
      )}

      {status !== 'ready' && (
        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: '#c9ced8' }}>{message}</p>
          {status === 'needsLogin' && (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 320, margin: '0 auto' }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="username"
                style={{ padding: '0.55rem 0.7rem', borderRadius: 6, background: '#1b1b1b', border: '1px solid var(--border)', color: 'inherit' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                autoComplete="current-password"
                style={{ padding: '0.55rem 0.7rem', borderRadius: 6, background: '#1b1b1b', border: '1px solid var(--border)', color: 'inherit' }}
              />
              <button
                type="submit"
                disabled={busy}
                style={{
                  padding: '0.55rem 0.7rem',
                  borderRadius: 6,
                  border: 0,
                  background: 'var(--primary, #4124fb)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
              <small style={{ color: '#6b7280' }}>
                premium access is granted to the account by an administrator
              </small>
            </form>
          )}
        </div>
      )}
    </div>
  );
}