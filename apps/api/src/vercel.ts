import 'dotenv/config';
import { handle } from 'hono/vercel';
import { app } from './app.js';

/**
 * Vercel serverless entry — one function for the whole API.
 * Deployed project root: apps/api (rootDirectory). Rewrites in vercel.json map
 * /api/* onto this handler; hono sees the full request URL (/api/v1/...).
 * The local Node server (index.ts) is untouched and used for dev/tests.
 */
export default handle(app);