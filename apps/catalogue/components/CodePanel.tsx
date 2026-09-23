'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAgentPrompt, getSource, login, PremiumRequiredError, type SourceResponse } from '../lib/api';

const TOKEN_KEY = 'techinject_token';
const FILE_LABELS: Record<string, string> = { tsx: 'TSX', css: 'CSS', ts: 'TS' };

export function CodePanel({ slug, accessLevel }: { slug: string; accessLevel: string }) {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [source, setSource] = useState<SourceResponse | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [modal, setModal] = useState<'code' | 'prompt'>('code');
  const [activeFile, setActiveFile] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'needsLogin' | 'ready' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(
    async (bearer?: string) => {
      setStatus('loading');
      try {
        const [src, pr] = await Promise.all([getSource(slug, bearer), getAgentPrompt(slug, bearer)]);
        setSource(src);
        setPrompt(pr);
        setActiveFile(Object.keys(src.files)[0] ?? '');
        setStatus('ready');
      } catch (e) {
        if (e instanceof PremiumRequiredError) {
          setStatus('needsLogin');
        } else {
          setStatus('error');
        }
      }
    },
    [slug]
  );

  useEffect(() => {
    if (accessLevel === 'free') {
      void load(undefined);
      setToken(undefined);
    } else if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(TOKEN_KEY) ?? undefined;
      setToken(stored);
      if (stored) void load(stored);
      else setStatus('needsLogin');
    }
  }, [load, accessLevel]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const t = await login(email, password);
      window.localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      await load(t);
    } catch {
      setStatus('needsLogin');
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string, label: string) {
    if (navigator.clipboard) await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    if (!copied) {
      // prepare feedback anchor
      setActiveFile(label);
    }
  }

  const fileEntries = source ? Object.entries(source.files).sort(([a], [b]) => a.localeCompare(b)) : [];
  const activeContent = source && activeFile ? source.files[activeFile] ?? '' : '';

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden', background: '#0d0d0d' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.9rem',
        }}
      >
        <button
          onClick={() => setModal('code')}
          style={{
            background: modal === 'code' ? 'rgba(255,255,255,0.08)' : 'none',
            border: 0,
            color: 'inherit',
            padding: '0.35rem 0.7rem',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Source code
        </button>
        <button
          onClick={() => setModal('prompt')}
          style={{
            background: modal === 'prompt' ? 'rgba(255,255,255,0.08)' : 'none',
            border: 0,
            color: 'inherit',
            padding: '0.35rem 0.7rem',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Agent prompt
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' }}>
          {source?.component.dependencies.length ? `deps: ${source.component.dependencies.join(', ')}` : ''}
        </span>
      </div>

      {status === 'loading' && <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>Loading…</div>}

      {status === 'needsLogin' && (
        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: '#c9ced8' }}>Sign in to access source code and the agent prompt.</p>
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
              style={{ padding: '0.55rem', borderRadius: 6, border: 0, background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <small style={{ color: '#6b7280' }}>premium access is granted to the account by an administrator</small>
          </form>
        </div>
      )}

      {status === 'ready' && modal === 'code' && fileEntries.length > 0 && (
        <div style={{ display: 'flex', minHeight: 320 }}>
          <div style={{ borderRight: '1px solid var(--border)', minWidth: 190 }}>
            {fileEntries.map(([file]) => {
              const label = file.split('/').pop() ?? file;
              return (
                <button
                  key={file}
                  onClick={() => setActiveFile(file)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.8rem',
                    background: file === activeFile ? 'rgba(255,255,255,0.08)' : 'none',
                    border: 0,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'inherit',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.4rem 0.8rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'ui-monospace, monospace' }}>{activeFile}</span>
              <button
                onClick={() => void copy(activeContent, activeFile)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 5, border: '1px solid var(--border)', background: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '0.8rem', overflow: 'auto', fontSize: '0.78rem', lineHeight: 1.5 }}>{activeContent}</pre>
          </div>
        </div>
      )}

      {status === 'ready' && modal === 'prompt' && (
        <div style={{ padding: '1rem', maxHeight: 360, overflow: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{prompt}</pre>
        </div>
      )}
    </div>
  );
}