# answers.md — Tech Inject Design Library

Written answers to the seven questions in Assignment Section 10. Answers are 2–4
sentences each and reference the actual implementation, tests and screenshots.
Where a safeguard is not yet implemented it is explicitly labelled *future* —
nothing is invented or presented as verified when it was not.

---

## 1. Reference analysis

I loaded the Sales CRM reference
(https://sales-crm-kargulstudio.vercel.app/) and walked it top-to-bottom,
grouping recurring visual patterns before deciding boundaries: pill-shaped
controls with a raised inset ring became `Button`, labelled chips condensed into
one `Tag` with ten colour variants, the selection cell became `Checkbox`
(reusing the yellow `--check-fill` fill), and so on. Tokens (colour, radius,
elevation, motion) were lifted verbatim into `packages/theme/src/theme.css`
and a
`packages/theme/test/tokens.test.ts` pins them (`--background:#161616`,
`--primary:#4124fb`, `--border:#232323`, `--radius:0.5rem`) so recreation cannot
drift (side-by-side: `docs-screenshots/reference-vs-recreation.png`).

One boundary I consciously chose: `Button` is one component with `raised |
primary | ghost` variants plus `size`, `loading`, and icon props
(`packages/ui/src/registry.ts:34`) rather than separate components, because the
reference reuses the same base geometry and only swaps surface colour/shadow
recipes — splitting them would have duplicated styles and imports. I verified
the recreation against the reference at matching sizes
(`docs-screenshots/reference-crm.png` vs
`docs-screenshots/catalogue-component-button.png`) and by comparing computed
styles off the live preview DOM (fonts, radii, border colours) against the
pinned tokens.
## 2. Architecture and clean code

I chose a TurboRepo pnpm workspace because the reference demanded four
independently runnable surfaces (API, catalogue, admin, CLI) sharing one source
of truth: `packages/theme` (tokens), `packages/registry` (validation + agent
prompt), `packages/db` (schema/seed/security), `packages/ui` (the actual
components). Separation is strict — presentation (`catalogue`), publishing
(`admin`), storage/API (`api` + `db`) and installation (`cli`) never reach into
each other's internals; e.g. `/api/v1/admin/components` only accepts bundles
validated by `packages/registry` (`apps/api/src/app.ts:205`).

One practical DRY decision: the bundle schema (file allow-list, size caps,
`auditImports()` import audit) and the agent-prompt builder live in
`packages/registry` and are imported by the API, the CLI and the tests
(`validation.test.ts`, `app.ts:16`, `agent-prompt.ts`) — there is exactly one
copy of each contract. An abstraction/feature I avoided under KISS/YAGNI: a
server-side execution service or general code editor for uploads — admin uploads
a constrained JSON bundle and previews are compiled, never executed, on the
backend, which is far simpler and matches the "no general-purpose online
code-execution platform" scope.

## 3. Publishing consistency

There is a single record of truth: one Postgres row per component stores the
whole `bundle` (files + metadata) plus a `contentHash`
(`apps/api/src/app.ts:210-222`), and every consumer path — live preview, copied
source, the `npx` install command, and the agent prompt — reads that same row
through `getComponent()` (`app.ts:74-148`). No hardcoded catalogue copy exists;
the UI library registry is only used by the seed
(`packages/db/src/seed.ts:38`), so code shown, previewed and installed can never
diverge.

Because `PUT /admin/components/:slug` writes the bundle atomically and only
`POST /publish` flips `status` to `published` (`app.ts:228-280`), a failed
update leaves the previously validated bundle intact — the row is only replaced
after `readBundle()` (zod shape + import audit) passes. Unpublishing flips
status back to `draft`; every public endpoint
filters on `status` — `listPublished()` in `store.ts:37-40` and a `published`
check in each route (`app.ts:76-78,84-86,…`) — so the component disappears from
listings, direct routes and new installation/source requests, while files a
consumer already copied remain theirs (documented limitation).

## 4. Security

The three attack surfaces are preview compilation, admin APIs and installation.
Uploaded code is validated before storage — zod schema + `auditImports()` static
scan reject executable extensions, undeclared imports and `@tech-inject`
internals (`registry/src/schemas.ts:101-153`) — and it is *never executed* in
the backend or admin context: `compilePreview()` bundles it with esbuild and
serves HTML that the catalogue mounts in an opaque-origin sandboxed iframe
(`<iframe srcdoc sandbox="allow-scripts">`, no `allow-same-origin`), so the story
cannot see catalogue cookies or storage (`apps/api/src/preview.ts:29-34`,
`apps/catalogue/.../PreviewPanel.tsx`). Admin endpoints require a bearer session
whose role is resolved server-side and re-checked every request
(`app.ts:181-187`, `auth.ts:51-81`); the admin secret exists only in env
(`env.ts`), and session tokens are stored hashed (sha-256) with a 30-day TTL.

Installation is confined: `safeJoin()` rejects absolute, backslash and `..`
paths and the resolved file must stay under the component directory
(`packages/cli/src/paths.ts:9-30`, `paths.test.ts`), existing installs refuse to
overwrite without `--force` (`componentDir`, `paths.ts:33-46`), and the bundle
is written with `techinject.json` as a manifest. Tests cover all of these
(`registry/test/validation.test.ts`, `cli/test/paths.test.ts`, plus the 12 API
integration tests). Remaining limitations — *future* — are: the preview iframe
still has network egress (no CSP frame-src/connect-src policy today, so a
malicious story could fetch an external URL as an unauthenticated request), and
revocation cannot remove code that was already copied or installed.

## 5. AI ownership

The most important generation error I caught was an unsafe path rule: the AI
suggested a regex `^[a-zA-Z0-9._-]+$` for bundle file paths, which rejected the
library's own nested keys like `components/button/Button.tsx`. I challenged it,
widened the policy to allow `/` while still rejecting `..`, absolute paths and
empty segments, and proved it with regression tests
(`schemas.ts:23,92-99`, `validation.test.ts` "rejects unsafe file paths");
running the tests after every schema change is what surfaced this class.

I also verified the two consumer-facing claims rather than trusting the
generated output: the install command (a proposal of `--force`-overwrite
semantics with no per-file safety) I replaced with explicit
reject-unless-`--force` path handling and tested via `paths.test.ts`; and the
agent prompt / copy-paste code were proven not just inside the catalogue but in
throwaway consumer projects — `packages/cli/scripts/verify.js` installs a free
and two premium components into a temp project through the real CLI and
esbuild-compiles every installed `.tsx`, which is exactly how the double-nested
`components/<slug>/…` path bug in the installer was found and fixed.

## 6. Production ownership

What convinced me the project was ready: the green acceptance gate
(`pnpm check` = `build` (7 tasks) → `typecheck` (8 tasks) → 32 tests → CLI
`verify OK`), live smoke tests over the running API/catalogue/admin (12 seeded
components return, free/premium logins work, premium gating returns 403,
previews render, admin lists components), the consumer-build harness above, and
curl checks against all three served apps (`docs-screenshots/*`). Deployment to
real hosting is the one externally-blocked step (I need the account/host
details) and is tracked as a flagged hand-off item — per the assignment I will
not present local-only as deployed.

If a newly-published component breaks after release I would inspect, in order:
the API error log and the `audit_events` row for that publish/update, the
preview build failure from esbuild, and `componentBundleSchema`/`auditImports`
rejection on the stored bundle; the fast restore is admin → unpublish (instantly
removes the component from every public surface, `app.ts:272-280`) while I
re-upload a fixed bundle on a draft, validate, and re-publish — the previous
published state is intact because publishes are atomic status flips. Without
losing data: production data lives in Neon, snapshots/point-in-time restore are
available and bundles are immutable JSON blobs, so I can `restore_snapshot` or
re-request the previous bundle; I would communicate to the team a short status:
what component + version broke, that it is unavailable/unpublished, the estimate
to fix, and the re-publish commit when ready.

## 7. Premium access

Access is modelled as three independent axes and enforced separately: a
customer row carries `isPremium` (granted/revoked only by admin via
`POST /admin/customers/:id/premium`, `app.ts:287-297`), a component row carries
`status` (draft/published) and `accessLevel` (free/premium), and admin is a
distinct session kind — so premium does not imply admin, and publication does
not imply access (`auth.ts:60-86`). Every protected request calls
`resolveSession()` fresh and `isPremiumSession()` re-reads the customer row from
the DB (`auth.ts:51-86`), which is what makes revocation effective immediately:
a revoked customer still signed in fails preview, source, agent-prompt and
installation with 403 on the very next call.

Blocking is enforced on the server for every path, not hidden in UI: preview
(`app.ts:81-91`), source (`93-107`), agent-prompt (`109-123`) and install
(`125-148`) all gate on a live premium session, the CLI surfaces the 403 as
"requires premium access — set TECH_INJECT_TOKEN"
(`packages/cli/src/install.ts:27-29`), the agent prompt tells agents to use the
environment token rather than embedding one (`agent-prompt.ts:12-17`), and the
12-test API suite plus `verify.js` exercise signed-out, free-signed-in,
premium-signed-in and revoked flows. Revocation cannot undo what a customer
already copied or installed — that is inherent to distributed files; the README
documents it, the admin UI offers no illusion of "uninstall", and I track it as
an accepted limitation rather than a fixable bug.

---

### Demo evidence (screenshots)

See `docs-screenshots/` for the reference capture, catalogue free/premium
states, admin publish flow, premium lock/deny messages, and CLI install output;
each file names the step it shows.