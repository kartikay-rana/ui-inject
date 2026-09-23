# Tech Inject — Design Theme Library — Build Plan

Review this before any code is written. Every item maps to a requirement in the assignment PDF.

## 0. Goal

A TurboRepo monorepo containing a reusable React+TS component library themed on the **Sales CRM reference** (`sales-crm-kargulstudio.vercel.app`), surfaced through:
1. **Public catalogue** (UX modeled on Astryx catalogues) — browse free/premium components, live previews, copy code, `npx` install, AI-agent prompt.
2. **Admin dashboard** — create/validate/publish drafts, label free/premium, grant/revoke premium access.
3. **Shared backend API** — single enforcement point for premium access.
4. **npx installer CLI** — installs components into a clean consumer project from the deployed API.

Deliverables: public Git repo, deployed catalogue URL, deployed admin URL, `answers.md` (7 questions), README w/ screenshots + checks. Timebox ≤ 8h.

## 1. Verified references

- **Sales CRM** (theme): accessible. Full token set extracted (colors, Geist font, radii, spacing, button elevation recipe, 10-variant tag system, focus/hover/selected/disabled states, inline stroke icons). Exact values captured and saved.
- **Astryx** (`astryx.atmeta.com`, `/components`): accessible. Catalogue UX: searchable component nav, categories, per-component pages, previews, install/get-started docs.

We are NOT rebuilding the CRM app or Astryx's CSS — only the CRM *theme* tokens/components, and the Astryx *catalogue experience*.

## 2. Monorepo layout (pnpm + TurboRepo)

```
tech-inject/
├─ pnpm-workspace.yaml, turbo.json, package.json (scripts: dev/build/lint/typecheck/test)
├─ apps/
│  ├─ catalogue/   Next.js 14+ App Router, Astryx-style docs site (deploy: Vercel)
│  ├─ admin/       Next.js App Router admin dashboard (deploy: Vercel)
│  └─ api/         Hono (Node) backend — ONLY holder of premium logic (deploy: Vercel serverless or Render)
├─ packages/
│  ├─ theme/       CRM tokens (CSS vars) + Geist font + Tailwind preset + theme.css injector
│  ├─ ui/          Reusable component library (strict TS, Radix primitives, cva) — consumed by both apps
│  ├─ registry/    zod schemas + shared types + validation rules (upload bundle, slug, deps, paths)
│  ├─ db/          Drizzle schema + client (Neon Postgres) + seed script
│  └─ cli/         @<scope>/techinject-cli — npx installer + consumer-verify script
├─ tests/          e2e + consumer-build proofs (drive via scripts in turbo)
└─ docs-screenshots/  reference-vs-recreation captures (stable baseline at start)
```

Why: `packages/ui` is the actual reusable library deliverable; `packages/registry` gives the API + frontend the *same* validation/DRY; the API owns enforcement so revocation is impossible to bypass in the frontend. One consistent published version comes from one DB record (preview/source/install/prompt all read the same row).

## 3. Data model (Neon Postgres via Drizzle)

- `customers`: id, email (unique), name, password_hash, is_premium, created_at
- `sessions`: id, customer_id, token_hash, expires_at  (server-issued httpOnly cookie for web + token for CLI/agent)
- `components`: id, slug (unique), name, description, category, version, access_level (free|premium), status (draft|published), props_doc, usage_doc, dependencies (json), bundle (json: files map + preview story/sample), thumbnail_key, created_at, updated_at, published_at
- `audit_events`: id, actor, action, component_id, at  (publish/unpublish/grant/revoke trail)

Seeded (credentials given privately in the submission form, never in repo):
- Customers: `free@techinject.dev` (is_premium=false), `premium@techinject.dev` (is_premium=true)
- Admin: from env vars `ADMIN_USERNAME` / `ADMIN_PASSWORD` only — server-verified, no frontend exposure.

## 4. API surface (Hono, `/api/v1`)

Catalogue (public → all require server-side premium check on every request, incl. direct URLs):
- `GET /components` (published only; premium rows return metadata+thumbnail, never source)
- `GET /components/:slug` (published metadata; drafts 404 for non-admins)
- `GET /components/:slug/preview` (free: bundle; premium: 403 unless active premium session)
- `GET /components/:slug/source` (copy-code payload — premium gated)
- `GET /components/:slug/install` (installer manifest — premium gated)
- `GET /components/:slug/agent-prompt` (agent instructions text — premium gated)
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

Admin (all authenticated with env-verified admin session):
- `POST /admin/login` · `GET /admin/components` (incl. drafts) · `POST /admin/components` (create draft)
- `PUT /admin/components/:slug` (edit) · `POST /admin/components/:slug/publish` · `POST /admin/components/:slug/unpublish`
- `POST /admin/components/validate` (validate bundle, no save — powers admin preview)
- `GET /admin/customers` · `POST /admin/customers/:id/premium` (grant/revoke)
- `GET /admin/audit`

Unpublish → removes from `GET /components`, direct detail routes, new install/source/prompt requests. Files already installed/copied are not revoked (documented limitation).

## 5. Upload bundle format (constrained JSON)

```json
{
  "slug": "win-probability-meter", "name": "Win Probability Meter",
  "category": "data-display", "description": "...", "version": "1.0.0",
  "accessLevel": "premium", "dependencies": ["react"],
  "props": "…ts/markdown…", "usage": "…docs…",
  "files": { "WinProbabilityMeter.tsx": "…typed source…", "Example.tsx": "…story+sample…", "theme.css": "…optional…" },
  "preview": { "story": "Example.tsx", "sample": { … } }
}
```

Validation (server-side mandatory, shared via `packages/registry`):
- Required fields; slug `^[a-z0-9-]{1,64}$`; unique.
- File count ≤ 12, total ≤ 1 MB; extensions only `.tsx|.ts|.css|.json|.md`; no `..`, no absolute paths.
- Imports restricted to `react` + declared dependencies; no `@tech-inject/*` catalogue-internal imports (keeps consumer installs catalogue-free). Allowed-deps allowlist.
- Bundle validated with esbuild parse before any publish.

Preview isolation (honest): **no code executes on the backend.** The API esbuild-compiles the uploaded story to a JS IIFE + CSS; the catalogue renders it inside an iframe via `srcdoc` with `sandbox="allow-scripts"` and **no** `allow-same-origin`, no cookies/credentials reachable, isolated lifecycle. Documented as real sandboxing with known limits.

## 6. Premium access model (separate concerns)

- Component publication = `status` on the component row.
- Premium gating = `access_level` (component) AND `customers.is_premium` (account) checked **on every protected request** in the API middleware — never cached in the browser bundle.
- Admin permissions = env-verified admin session only. Customers can never self-grant premium or touch admin (`POST /admin/*` rejects year-round).
- Premium source lives only in Postgres; never in public bundles, public storage, or the Git repo. Locked previews show a static thumbnail + sign-in/upgrade message.
- Installer/agent for premium: owner supplies a session token via `TECH_INJECT_TOKEN` env / `--token` flag. Copied prompts/commands never embed credentials.
- Revocation blocks subsequent requests even while signed in (server reads live row each time). Cannot delete already-copied/installed code — documented.

## 7. Installer CLI (`@<scope>/techinject-cli`)

- `npx @<scope>/techinject-cli@latest add <slug> [--registry <url>] [--token …|--token-env TECH_INJECT_TOKEN] [--dir <consumer-dir>]`
- Resolves manifest from API; writes only the bundle files + a `techinject.json` record.
- Safety: all paths resolved & confined to the target dir (reject `..`, absolute, symlink escapes); refuses silent overwrite (requires `--force`); **never** runs component-supplied shell commands; then prints `npm i <deps>` instructions.
- Published to npm with the user's NPM_TOKEN (they've confirmed they'll provide it).

## 8. Component inventory (map to reference)

Implemented (prioritized by reuse + fidelity, from extracted CRM theme):
Button, IconButton, Badge/Tag (10 variants), Checkbox (+indeterminate), TextInput, Search button (⌘K affordance), Avatar (+status dot), DropdownMenu/SplitDropdownPill, Tabs, Table (checkbox col, tabular-nums, hover/selected), Sidebar (grouped nav, count chips, active state, footer buttons), WinProbabilityMeter (17-segment LED), ActivityTrend (bar chart), StatusChip.

Deferred (documented, with reasoning): resizable sidebar width handle, full Kanban board, notifications popover, toast system. README will map implemented → reference screenshots and explain why (max observable-reuse per token; these add object-specific chrome, not shared tokens).

## 9. Tests & evidence (mirrors §8 of the PDF)

- **Unit (vitest):** bundle/slug/path/deps validation; installer path-confine + overwrite rules; theme-token parity snapshot vs captured reference.
- **Integration (vitest + Neon test branch):** admin writes without creds → 401; draft privacy (drafts 404 publicly); invalid upload rejected; publish flow; prefix metadata/source consistency; free/premium direct-URL enforcement incl. **revocation** and customer **self-grant attempt** via API.
- **Consumer proof (script):** in temp clean Next.js app (1) copy/paste code from `source` endpoint, (2) `npx cli add`, (3) run copied agent prompt in an AI agent — each builds + renders with no catalogue imports, missing theme files. Results recorded into README + answers.md.
- **E2E if time allows (Playwright):** keyboard navigation, narrow-screen layout, interaction states on deployed site.

## 10. Safety checks run (quality gates, run in CI + `turbo run check`)

`format` (prettier) · `lint` (eslint) · `typecheck` (tsc, `strict: true`; no `any`) · `test`. Commands + actual pass/fail recorded in README — failures never suppressed.

## 11. Deployment checklist (user completes — no hosting account yet)

Design: **Vercel** for catalogue + admin (Next.js) and the API (Hono `@hono/vercel-adapter`, one serverless function); **Neon** for Postgres (I create/provision the DB now via the connected Neon tooling). If Vercel unavailable, equivalent steps for Render/Railway (api + static).

1. Create free **Vercel** account → Dashboard → Import existing repo/git or upload.
2. Add env vars (values recorded secret-free in README, real values shared privately):
   - `DATABASE_URL` (Neon), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `API_BASE_URL`.
3. Deploy `apps/api`, then `apps/catalogue` + `apps/admin` (set their `API_BASE_URL`).
4. Verify https endpoints, run the consumer/CLI proof against the live URL.
5. Push local repo → public GitHub (I'll prepare all commits; you create repo + push, or supply a token). Recorded deployed commit in README.

## 12. Delivery artifacts

- `answers.md` — all 7 questions, each 2–4 sentences, matching real implementation with code/test/screenshot refs; implemented vs. future improve clearly separated; no invented results.
- `README.md` — links, local setup/build/check commands, env-var names (secret-free example), reference/recreation screenshots, actual test+deploy results, time spent, known gaps, recovery plan, premium setup/grant/revoke instructions, AI tool + one verified/corrected suggestion with evidence.
- Screenshots captured at start (baseline) and end (comparison) from `docs-screenshots/`.

## 13. Execution phases (≤8h from go-ahead)

1. Scaffold monorepo + Neon DB + theme/registry + seed + baseline screenshot (0:30)
2. `packages/ui` components with states/keyboard fidelity (1:30)
3. `apps/api` full surface + enforcement + tests (1:00)
4. `apps/catalogue` docs experience + integration options + premium gating (1:30)
5. `apps/admin` publish + access management (0:30)
6. `packages/cli` + clean-consumer verification (1:00)
7. Tests/checks matrix pass (1:00)
8. Deploy, screenshots, README, answers.md, live end-to-end demo runs (1:00)

Risk flags: hosting account creation is on you; flag early if you can't get one — the core flows must still be reported honestly.