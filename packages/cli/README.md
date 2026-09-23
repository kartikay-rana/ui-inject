# @kartikay-rana/techinject-cli

Install **Tech Inject** UI components into your React + TypeScript project with
one command. Components are fetched live from the Tech Inject registry and
written into your own `src/components/` folder — you own the code, no bundler
plugins, no runtime dependency.

Every component mirrors a cell of a real Sales CRM interface and ships as
self-contained, copy-able source: TSX render, CSS, a `cn` class-name helper and
a `*.story.tsx` local story.

## Install

No install needed — run it straight with `npx`:

```bash
npx @kartikay-rana/techinject-cli add button
```

or install it as a dev dependency:

```bash
pnpm add -D @kartikay-rana/techinject-cli
```

## Usage

```bash
techinject-cli add <slug> [--force] [--registry=<url>]
techinject-cli list
techinject-cli --help
```

### `add <slug>`

Downloads and writes a component into `src/components/<slug>/`:

```bash
npx @kartikay-rana/techinject-cli add button
npx @kartikay-rana/techinject-cli add tag
```

Each install writes:

- `Button.tsx` / `Button.css` / `cn.ts` / `Button.story.tsx`
- `techinject.json` — a manifest tracking installed components and their
  declared dependencies

If the component declares peer dependencies (e.g. `@radix-ui/react-checkbox`),
the CLI prints the exact `pnpm add` command to run.

Flags:

| Flag             | Meaning                                            |
| ---------------- | -------------------------------------------------- |
| `--force`        | Overwrite the target folder if it already exists   |
| `--registry=<u>` | Point at a different registry (default: the live Tech Inject API) |

### `list`

Print the catalogue with access level:

```bash
npx @kartikay-rana/techinject-cli list
```

### Premium components

Free components install out of the box. Premium ones (e.g. `sidebar`, `table`)
need an access token from a premium Tech Inject account:

```bash
TECH_INJECT_TOKEN=<session-token> npx @kartikay-rana/techinject-cli add table
```

## Environment

| Variable                     | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `TECH_INJECT_TOKEN`          | Session/bearer token for premium access  |
| `TECH_INJECT_REGISTRY_URL`   | Override the default registry base URL   |

The default registry is the public Tech Inject API; override it with
`--registry=` or `TECH_INJECT_REGISTRY_URL` when pointing at a staging or
self-hosted registry.

## Requirements

- A `package.json` in the working directory (the CLI targets a React +
  TypeScript project root)
- Node.js 18+ (uses the global `fetch`)

## License

MIT