import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app.js';

/**
 * Local Node dev/server entry (pnpm dev / pnpm start). On Vercel the same file
 * is a valid zero-config Hono entry (default export detected by the preset);
 * the listener is only started outside Vercel so a function import never spins
 * up a server.
 */
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3001);
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`[api] listening on http://localhost:${info.port}`);
  });
}

export default app;