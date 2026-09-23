# UI Inject — Design Theme Library

A reusable, documented and dependable component system built from the **Sales CRM**
visual reference. Developers browse and install free/premium components through a
polished public **catalogue**; an administrator maintains the library through a
separate **admin dashboard**; premium access is enforced by the **API** for every
preview, source, install and agent-prompt request, including direct URLs and the
**CLI**.

Monorepo: Turborepo + pnpm + TypeScript strict.

```
apps/catalogue   Next.js 15 (React 19) — public developer product
apps/admin       Next.js 15 — component publishing + premium-access management
apps/api         Hono — REST API, validation, preview compilation, auth, gating
packages/ui      the actual components + registry + stories + seed source
packages/theme   design tokens (single source of truth)
packages/registry  zod schemas, import audit, agent-prompt builder
packages/db      Drizzle schema + seed + scrypt/hash security helpers
packages/cli     ui-injector — npx installer
```

## Links

> **Deployment status — FLAGGED, not completed.** The assignment requires real
> hosting (not my laptop) and no hosting/GitHub account has been provided yet.
> The full project is verified end-to-end locally and the exact deploy steps,
> env vars and verification commands are in `docs/DEPLOY.md`. URLs below are
> placeholders to be filled the moment a host is available.

| Surface | URL (live) |
|---|---|
| Catalogue | `https://api-5eps.vercel.app` |
| Admin | `https://ui-inject-admin.vercel.app` |
| API | `https://api-git-main-kartikay-ranas-projects.vercel.app` (one `hono/vercel` function in `apps/api`) |
| Repo | `https://github.com/kartikay-rana/ui-inject` |

## Component inventory

Identified directly from the reference (see `docs-screenshots/reference-crm.png`).
12 reusable components published, 7 free + 5 premium. One component implicitly
mapped to several reference instances (Button, Tag, Sidebar reuse across rows).

| Component | Access | Category | Reference mapping |
|---|---|---|---|
| Button | free | action | toolbar + primary raised CTA + header buttons |
| Tag | free | content | Segment/Stage cells + overflow `+2` pill (10 palette variants) |
| Checkbox | free | form | table selection column (shared with Table) |
| Text Input | free | form | top-bar search field + ⌘K affordance |
| Avatar | free | content | table/profile circular chips + live dot |
| Tabs | free | navigation | Companies / Deals / Forecast underline tabs |
| Status Chip | free | feedback | "Active"/"Slipping" header pill w/ dot |
| Win Probability Meter | premium | data-display | pipeline likelihood LED segments |
| Activity Trend | premium | data-display | last-activity micro bar chart |
| Dropdown Menu | premium | overlay | Stage filter split pill + menu |
| Table | premium | data-display | selectable account grid (typed columns) |
| Sidebar | premium | layout | 254px grouped navigation rail |

Prioritisation: the reference's most-repeated, most-branded primitives first
(buttons, chips, checks, inputs, avatar, tabs, status) free and fast to adopt;
then the recognisably CRM-specific composites (meter, trend, table, dropdown,
sidebar) as premium. Omitted by design (YAGNI, and "recreate the theme, not the
business features"): full page scaffolding, charts library, auth/team screens.

## Screenshots

| File | Shows |
|---|---|
| `docs-screenshots/reference-crm.png` | reference site captured at start of work |
| `docs-screenshots/reference-vs-recreation.png` | reference vs catalogue side-by-side |
| `docs-screenshots/catalogue-home.png` | catalogue landing, searchable list |
| `docs-screenshots/catalogue-component-button.png` | component page: preview + code/install/agent tabs |
| `docs-screenshots/catalogue-premium-locked.png` | premium Table locked + sign-in for signed-out visitor |
| `docs-screenshots/catalogue-premium-unlocked.png` | premium Table preview for a premium customer |
| `docs-screenshots/catalogue-get-started.png` | get-started page |
| `docs-screenshots/admin-dashboard.png` | admin dashboard (components/customers/audit/publish) |

## Local setup

```bash
pnpm install            # pnpm 11.23.0, Node >= 20 (built with 24)
cp packages/db/.env.example packages/db/.env    # fill DATABASE_URL (Neon)
cp apps/api/.env.example apps/api/.env          # DATABASE_URL + admin creds
pnpm db:push            # drizzle-kit push --force, applies schema
pnpm db:seed            # 12 components + free & premium customers
pnpm dev                # turbo: API :3001, catalogue :3010, admin :3011
```

Run the four surfaces individually:

```bash
pnpm --filter @tech-inject/api dev            # API on :3001
pnpm --filter @tech-inject/catalogue dev      # catalogue on :3010
pnpm --filter @tech-inject/admin dev          # admin on :3011
pnpm --filter ui-injector build
```

## Quality gate (actual results)

```bash
pnpm check   # = pnpm build && pnpm typecheck && pnpm test && cli verify
```

| Step | Result |
|---|---|
| `turbo run build` | 7/7 tasks successful (8 packages) — Next 15.5.25 admin build "Compiled successfully in 2.2s" |
| `turbo run typecheck` | 8/8 tasks successful |
| `turbo run test` | 36/36 — registry 13 · cli 5 · theme 2 · **api 16 (12 integration vs real Neon DB + 4 `hono/vercel` serverless-entry)** |
| `node scripts/verify.js` | **verify OK** — installs button + table + sidebar into a temp consumer via the real CLI, esbuild-compiles all 7 installed `.tsx` (deps externalized) |

> The `cli verify` stage is an end-to-end consumer harness and expects the API
> to be running locally with a seeded DB (`pnpm dev`, `TECH_INJECT_REGISTRY_URL`
> defaults to `http://localhost:3001`).

API integration tests live at `apps/api/test/api.test.ts` (free/premium gating,
source/preview/install/prompt, admin auth); path-confinement at
`packages/cli/test/paths.test.ts`; bundle validation + import audit at
`packages/registry/test/validation.test.ts`; token parity at
`packages/theme/test/tokens.test.ts`.

## Environment variables (secret-free example)

| Var | Where | Example |
|---|---|---|
| `DATABASE_URL` | db + api `.env` | `postgresql://user:pass@host/neondb?sslmode=require` |
| `ADMIN_USERNAME` | api `.env` | `admin` |
| `ADMIN_PASSWORD` | api `.env` | long random string (never in frontend/Git) |
| `API_BASE_URL` | api `.env` | `https://api.your-domain.com` (used in agent prompt + install manifest) |
| `NEXT_PUBLIC_API_URL` | catalogue build | `https://api.your-domain.com` |
| `TECH_INJECT_REGISTRY_URL` | CLI / agent | `https://api.your-domain.com` |
| `TECH_INJECT_TOKEN` | CLI / agent | your session token (never committed) |

`.env*` real files are gitignored; only `.env.example` placeholders are tracked.

## Premium access (setup + usage)

Seed accounts for review (free `demo@techinject.dev` + premium
`premium@techinject.dev`, plus the single admin) are **created by
`pnpm db:seed`**; their credentials are shared **only through the interview
channel / `docs/DEPLOY.md` hand-off**, never here, in frontend code or in Git —
per Assignment Section 9. `pnpm db:seed` prints the seeded email addresses; the
default demo password can be overridden with `SEED_FIXTURE_PASSWORD` before
seeding and then distributed privately.

Grant/revoke: admin → Customers tab → toggle `isPremium` (writes
`POST /api/v1/admin/customers/:id/premium`, audited). Blocking is server-side and
re-checked on **every** request (`apps/api/src/auth.ts:51` reads the customer row
live), so a revoked customer still signed in is denied on the next premium call
— previews, direct URLs, source, install and agent prompt alike.

Authenticated installer/agent usage:

```bash
# consumer with a premium account's session token
TECH_INJECT_TOKEN=<session-token> npx ui-injector add table -r https://api.your-domain.com
# or free (no token)
npx ui-injector add button -r https://api.your-domain.com
```

Consumer requirements (React + TypeScript):

- Install the components' peer dependency: `npm i react react-dom` (+ `@types/react`).
- The installer writes into `src/components/`. It also writes `src/components/package.json` (`{"type":"module"}`) plus the shared `theme.css`, so the installed files stay ESM and self-contained even inside a CommonJS project.
- ESM assumed for the *importing* file, which is the norm in React apps (Vite/Next). If `tsconfig.json` uses `verbatimModuleSyntax` and your root `package.json` has no `"type": "module"`, the CLI prints an exact fix at install time; the one-line change is `"type": "module"`.

The agent prompt (`GET /api/v1/components/:slug/agent-prompt`) tells the agent to
use the token via the `TECH_INJECT_TOKEN` environment variable and never embeds a
credential (`packages/registry/src/agent-prompt.ts`).

Access-control test results: `apps/api/test/api.test.ts` — signed-out premium
preview → 403; free-signed-in premium source → 403; premium → 200; invalid
credentials → 401; admin without session → 401 (12/12 pass). The serverless
entry is covered separately by `apps/api/test/vercel.test.ts` (4/4: list 200,
admin 401, premium preview 403 signed out, premium preview compiles to HTML
through the Vercel handler).

## AI usage

- **Tool:** an AI coding CLI (opencode) used for planning, generation, debugging
  and verification across the whole build. Code was reviewed, not blindly
  accepted — the most valuable AI outputs were the ones it got *wrong* enough to
  force a check.
- **Representative prompt** (planning): *"Design a monorepo plan for a reusable
  design-theme component library with a public catalogue, an admin publishing
  dashboard, a Hono API, persistent Postgres, per-request premium enforcement,
  and a consumer CLI installer. Respect the principles: validation before
  storage, no execution of uploaded code server-side, safe confined installs,
  typed contracts"*.
- **Verified/corrected suggestion #1 (paths):** AI proposed
  `^[a-zA-Z0-9._-]+$` for bundle file paths, which silently rejected the
  library's own nested `components/<slug>/…` keys. I widened the policy to allow
  `/` while still rejecting `..`, absolute and empty segments, and pinned it with
  `packages/registry/test/validation.test.ts` ("rejects unsafe file paths") +
  `isSafeRelativePath` in `schemas.ts:92`.
- **Verified/corrected suggestion #2 (installer):** AI's initial install just
  wrote bundle keys verbatim, producing a double-nested
  `src/components/table/components/table/Table.tsx`. Proved by the consumer
  harness, fixed by stripping the `components/<slug>/` prefix
  (`packages/cli/src/install.ts:59-63`) — and `scripts/verify.js` now compiles
  the installed files to catch regressions.
- **Verified/corrected suggestion #3 (dependency builds):** pnpm refused to run
  esbuild's postinstall ("ignored build scripts"); the config-only fix
  (`onlyBuiltDependencies: [esbuild]`) still left the lockfile flagging them
  until `pnpm approve-builds --all`, which I confirmed and documented in
  `pnpm-workspace.yaml` + checkout note.

## Release checks + recovery plan

Release checks: `pnpm check` (above); live smoke suite against the deployed URLs
(`/api/v1/components` 200, preview compile, admin login, catalogue/admin pages
200); persistence check = create/publish a component, restart the API, confirm it
still lists and previews (data lives in Neon, not memory).

Recovery for a broken newly-published component: **1)** inspect API logs + the
`audit_events` row for the publish/update; **2)** admin → publish tab → unpublish
(instantly removes it from every public surface, `apps/api/src/app.ts:272` —
atomic status flip, no data loss); **3)** fix the bundle on a draft, validate
via `/admin/components/validate`, re-publish; **4)** if the DB itself is at
fault, restore from Neon snapshot/point-in-time (bundles are immutable JSON
blobs) and re-run `pnpm db:seed` if needed. Communicate: which component+version,
that it is unavailable, ETA, and the re-publish commit.

## Known gaps / limitations (documented honestly)

1. **Deployment is the one blocked deliverable** — needs a hosting account and
   GitHub repo (flagged in the submission; not presented as deployed). The API
   is Vercel-ready: zero-config Hono entry (`export default app` in
   `src/app.ts`) + `pnpm build:vercel-api` (builds the workspace deps whose
   `dist/` is gitignored) — verified by `apps/api/test/vercel.test.ts`, but the
   function's esbuild-in-lambda path still needs a live deploy smoke test.
2. Preview iframe is an opaque-origin sandbox (`sandbox="allow-scripts"`, no
   `allow-same-origin`, no workspace node_modules, no catalogue cookies), but
   scripts still run and can make unauthenticated external requests — no CSP
   `frame-src`/`connect-src` yet (future hardening).
3. Revocation blocks future retrieval but **cannot remove code already copied or
   installed** — inherent to distributed files, documented in the admin UI.
4. `eslint` / `typescript-eslint` / `prettier-plugin-tailwindcss` are
   referenced by `eslint.config.mjs` but not installed; Next builds print the
   "ESLint must be installed" warning and still compile + typecheck. Install via
   `pnpm -w add -D eslint typescript-eslint eslint-config-prettier` before CI
   linting.
5. One configured administrator (per scope); no signup, payments, or multi-framework.

## Documents

- `answers.md` — the seven Section-10 written answers with code/test references.
- `docs/DEPLOY.md` — deployment + hand-off checklist with verification steps.
- `docs-screenshots/` — reference capture and recreation evidence.
- `Tech Inject Assignment_ Design Theme Library.pdf` — the assignment.
