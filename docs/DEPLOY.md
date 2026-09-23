# DEPLOY.md — Deployment & hand-off checklist

**Status: BLOCKED on external access.** Everything below is a step-through
checklist verified to work locally. It becomes actionable the moment the
reviewer provides a hosting account and a Git remote (and, for the CLI, an
`NPM_TOKEN`). Per the assignment, the submission is flagged not-as-deployed
until these run against real URLs.

---

## 1. Repository

1. `git init` + first commit (root `.gitignore` already excludes `node_modules`,
   `.env*` real files, `.next`, `dist`, `drizzle/`, coverage).
   **Verify before push:** `git ls-files | grep -i '\.env$'` must be empty, and
   `docs-screenshots/` must contain no secrets.
2. Create the public remote, push, tag the deployed commit (`git tag v1.0.0`).
3. Add repository URL to `README.md` Links table.

## 2. Database (Neon — already provisioned for local work)

1. Create a Neon project. `DATABASE_URL` for both `packages/db/.env` and
   `apps/api/.env`.
2. `pnpm db:push` (always `--force`; plain `push` prompts interactively and
   hangs in CI) then `pnpm db:seed`. Seed consumers
   (`demo@techinject.dev`, `premium@techinject.dev`) use an overridable default
   fixture password (`packages/db/src/fixtures.ts`). For a public deployment
   set `SEED_FIXTURE_PASSWORD` before seeding and **share all review/admin
   credentials through the interview channel only** — never in the repo, README
   or frontend bundle (Assignment §9).
3. Persistence verification: publish a component, restart, confirm it still
   lists and previews.

## 3. API — one Vercel Function (Hono zero-config)

All three tiers deploy on Vercel (per PLAN §11); Neon stays the external DB.

1. Create a Vercel project from the same monorepo, Settings → **Root
   Directory: `apps/api`**. Vercel's Hono framework preset auto-detects the
   entry via the **default export in `src/app.ts`** (`export default app`)
   — no `vercel.json` needed (remember to delete the old `functions`/`rewrites`
   config if you copied it before).
2. **Build Command: `pnpm build:vercel-api`**
   (root script = `pnpm --filter @tech-inject/api... build`) — this is
   **required**: `dist/` is gitignored, so Vercel's fresh clone has no built
   output for the workspace packages (`@tech-inject/db`, `registry`, `theme`);
   the recursive filter builds the API **and its workspace deps** in dependency
   order. Without it you get `FUNCTION_INVOCATION_FAILED` / missing-module at
   runtime.
3. Env vars (set in the Vercel dashboard, never committed): `DATABASE_URL`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `API_BASE_URL=https://<api-host>`.
   `app.onError()` returns JSON with the message (instead of a generic Vercel
   500), so a missing/invalid `DATABASE_URL` shows up in the HTTP body + logs.
4. Serverless notes: preview compiles run esbuild under `os.tmpdir()` and
   resolve bare package imports back into the deployed `node_modules` via an
   esbuild plugin (`apps/api/src/preview.ts`); static keep-imports of
   react/react-dom/radix ensure Vercel's function tracer ships those packages
   into the bundle. Cold preview calls compile once — fine at this scale.
   Local proxy test: `pnpm --filter @tech-inject/api test` includes
   `test/vercel.test.ts` (function serves list + enforcement + premium preview
   compile).

Verification after deploy:

```bash
curl -s https://<api-host>/api/v1/components | jq '.items | length'   # >= 12
curl -s -o /dev/null -w '%{http_code}\n' https://<api-host>/api/v1/components/table/preview   # 403 signed out
curl -s -o /dev/null -w '%{http_code}\n' https://<api-host>/api/v1/admin/components           # 401 signed out
# premium Bearer token: table preview → 200 with compiled HTML; admin login returns a token
```

## 4. Catalogue + Admin (Vercel)

1. Create two Vercel projects (third one = API above) from the same monorepo;
   frameworks Next.js; Root Directory `apps/catalogue` / `apps/admin`; build
   `pnpm build`, output `.next`.
2. Env: `NEXT_PUBLIC_API_URL=https://<api-host>` (catalogue).
   Admin needs no secrets (it never holds admin credentials; it only stores the
   admin session token in `localStorage` after `/admin/login`).
3. Deploy, then walk Section-8 of the assignment on the deployed URLs:
   admin upload → preview → publish → discover → preview/code/install/agent.
   Upload one additional reference-derived component not in the repo (e.g. a
   "Lead" avatar-stack) to prove runtime upload protection.

## 5. CLI (npm publish — `NPM_TOKEN` required)

1. **Prep before publish (not yet done):** `packages/cli/package.json` currently
   depends on `@tech-inject/registry: workspace:*`, which npm resolves from the
   registry, not the workspace. Publish readiness = bundle the pure
   `registry` helpers (zod + audit + agent-prompt) into the CLI `dist` via
   esbuild (`--bundle`, no external since deps are pure JS), drop the
   `workspace:*` dep, add `prepublishOnly: pnpm build`, and confirm
   `npm pack` lists only `dist/`.
2. `npm login` → `pnpm --filter @tech-inject/techinject-cli publish` (or
   `ci:publish` with provenance enabled in a GitHub Action).
3. **Verify on a stranger's machine** (no candidate-local files, no localhost):
   ```bash
   npm init -y && npm i react react-dom @radix-ui/react-checkbox
   npx @tech-inject/techinject-cli add button -r https://<api-host>
   TECH_INJECT_TOKEN=<session-token> npx @tech-inject/techinject-cli add table -r https://<api-host>
   # then build/render in that consumer
   ```

## 6. Docs to update after deploy

- `README.md` Links table (catalogue/admin/api/repo URLs) and the deployed-flow
  screenshot set (replace/augment `docs-screenshots/` with deployed captures).
- Record time spent and known gaps (already in `answers.md` + README "Known
  gaps").
- Share admin + free + premium test credentials in the interview channel only.
- `answers.md` §6 — change "local, blocked" wording to "deployed & verified" and
  paste real deployed check output.

## 7. Release / recovery quick-reference (also in README)

- Broken component → admin → unpublish (atomic status flip, instant public
  removal) → fix draft → validate → republish.
- DB damage → Neon snapshot / point-in-time restore; bundles are immutable JSON
  blobs; `pnpm db:seed` to repopulate the 12-starter set.
- API down → check host logs for the failing request, confirm
  `DATABASE_URL`/`ADMIN_*` env, redeploy last-good commit, verify the 4 curl
  checks above.

## Open items before the interview

- [ ] Hosting account + Git remote provided → run Sections 2–5.
- [ ] `NPM_TOKEN` provided → CLI publish prep (bundling fix) + publish.
- [ ] Install `eslint typescript-eslint eslint-config-prettier` if CI lint is
      demanded (`eslint.config.mjs` references them; builds already pass + typecheck).
- [ ] Optional: pin preview CSP (`frame-src`/`connect-src`) for stricter iframe
      isolation (documented future hardening in `answers.md` §4).