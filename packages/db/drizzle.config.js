import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    schema: './src/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL ?? 'postgresql://noop:noop@localhost:5432/noop',
    },
    strict: true,
    verbose: true,
});
//# sourceMappingURL=drizzle.config.js.map