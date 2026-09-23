import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;

/** Get the shared Drizzle client. DATABASE_URL must be set (see .env.example). */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set — configure it in the environment before booting.');
    }
    client = drizzle(neon(url), { schema });
  }
  return client;
}