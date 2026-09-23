import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ComponentBundle } from '@tech-inject/registry';

/**
 * Library registry — the single list of components the seed publishes. Each
 * definition maps a slug to its source files (component + css + story + shared
 * support files) that ship to consumers, plus the metadata shown in the
 * catalogue. The API/catalogue never keep their own copy of this: the seed
 * writes these bundles into Postgres and everything reads from there.
 */

export interface UiComponentDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  accessLevel: 'free' | 'premium';
  version: string;
  dependencies: string[];
  propsDoc: string;
  usageDoc: string;
  /** primary component file name (without extension) */
  file: string;
  /** extra shared support files resolved from src root, keyed by installed path */
  supportFiles?: Record<string, string>;
}

const SRC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

export const componentDefinitions: UiComponentDefinition[] = [
  {
    slug: 'button',
    name: 'Button',
    description:
      'Primary call-to-action and toolbar buttons. Raised, primary and ghost variants mirror the Sales CRM elevated-button recipe with the outer 1px ring and inset top highlight.',
    category: 'action',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: [],
    file: 'Button',
    propsDoc:
      '`variant?: raised | primary | ghost` (default raised); `size?: sm | md`; `loading?: boolean` renders a spinner; `leadingIcon / trailingIcon?: ReactNode`; extends native button attributes incl. `disabled`.',
    usageDoc:
      '```tsx\nimport { Button } from "./tech-inject/button/Button";\n\n<Button variant="primary">New Company</Button>\n<Button loading>Publishing</Button>\n<Button disabled>Disabled</Button>\n```\nImport `./tech-inject/index.css` once in your app root to load the theme and this component\'s styles.',
  },
  {
    slug: 'tag',
    name: 'Tag',
    description:
      'Small labelled pill in ten palette variants (green, blue, purple, moss, red, orange, amber, teal, yellow, neutral) used for Segment & Stage cells and status labels.',
    category: 'content',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: [],
    file: 'Tag',
    propsDoc:
      '`color?: neutral | green | blue | purple | moss | red | orange | amber | teal | yellow`; `pill?: boolean` renders the compact `+2`-style overflow chip; extends span attributes.',
    usageDoc:
      '```tsx\nimport { Tag } from "./tech-inject/tag/Tag";\n\n<Tag color="green">Expansion</Tag>\n<Tag color="neutral" pill>+2</Tag>\n```',
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description:
      'Three-state checkbox with the reference yellow checked/indeterminate fill, sized to the table selection column, with keyboard and focus-visible support.',
    category: 'form',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: ['@radix-ui/react-checkbox'],
    file: 'Checkbox',
    propsDoc:
      'Wraps Radix Checkbox: `checked?: boolean | "indeterminate"`, `onCheckedChange?: (checked: boolean | "indeterminate") => void`, `defaultChecked`, `disabled`, `label?: string` renders an accessible label, `aria-label` for icon-only usage.',
    usageDoc:
      '```tsx\nimport { Checkbox } from "./tech-inject/checkbox/Checkbox";\n\n<Checkbox label="Select all" checked="indeterminate" />\n<Checkbox label="Draft" defaultChecked />\n```',
  },
  {
    slug: 'text-input',
    name: 'Text Input',
    description:
      'Pill-shaped text field plus the ⌘K search affordance used in the top bar. Includes placeholder, disabled and focus-ring states.',
    category: 'form',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: [],
    file: 'TextInput',
    propsDoc:
      '`TextInput` extends `input` attributes (`placeholder`, `disabled`, `defaultValue`, `ref`). `SearchButton` takes `hint?: ReactNode` (default `⌘K`) and renders a pressable search pill.',
    usageDoc:
      '```tsx\nimport { TextInput, SearchButton } from "./tech-inject/text-input/TextInput";\n\n<TextInput placeholder="Search companies…" />\n<SearchButton>Search</SearchButton>\n```',
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    description:
      'Framed circular profile chip with initials fallback, optional image source, live-status dot and two sizes.',
    category: 'content',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: [],
    file: 'Avatar',
    propsDoc:
      '`name?: string` drives initials; `src?: string` renders an image; `status?: boolean` draws the teal live dot; `size?: sm | lg`; `initials?: boolean` toggles the letter fallback.',
    usageDoc:
      '```tsx\nimport { Avatar } from "./tech-inject/avatar/Avatar";\n\n<Avatar name="Jensen Ackles" />\n<Avatar name="Alice Kim" src="/alice.png" status />\n```',
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    description:
      'Underline navigation tabs (Companies / Deals / Forecast pattern) built on Radix Tabs with keyboard support and the weight-locked active underline.',
    category: 'navigation',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: ['@radix-ui/react-tabs'],
    file: 'Tabs',
    propsDoc:
      'Exports `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` mirroring Radix Tabs API: `defaultValue`, `value/onValueChange`, `disabled` on triggers.',
    usageDoc:
      '```tsx\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from "./tech-inject/tabs/Tabs";\n\n<Tabs defaultValue="a">\n  <TabsList><TabsTrigger value="a">Companies</TabsTrigger></TabsList>\n  <TabsContent value="a">…</TabsContent>\n</Tabs>\n```',
  },
  {
    slug: 'status-chip',
    name: 'Status Chip',
    description:
      'Header status pill with a live (teal) or danger (red) dot, as used for the "Active" pipeline state.',
    category: 'feedback',
    accessLevel: 'free',
    version: '1.0.0',
    dependencies: [],
    file: 'StatusChip',
    propsDoc: '`state?: active | danger`; child is the chip text; extends span attributes.',
    usageDoc:
      '```tsx\nimport { StatusChip } from "./tech-inject/status-chip/StatusChip";\n\n<StatusChip>Active</StatusChip>\n<StatusChip state="danger">Slipping</StatusChip>\n```',
  },
  {
    slug: 'win-probability-meter',
    name: 'Win Probability Meter',
    description:
      '17-segment LED meter that colours a pipeline likelihood from red (low) through amber to green (high) with a track for the remainder. A premium component.',
    category: 'data-display',
    accessLevel: 'premium',
    version: '1.0.0',
    dependencies: [],
    file: 'WinProbabilityMeter',
    propsDoc:
      '`value?: number` 0–100 probability; lit segments = round(17 × value ÷ 100); `className?`. Accessible as a `role="meter"`.',
    usageDoc:
      '```tsx\nimport { WinProbabilityMeter } from "./tech-inject/win-probability-meter/WinProbabilityMeter";\n\n<WinProbabilityMeter value={82} />\n```',
  },
  {
    slug: 'activity-trend',
    name: 'Activity Trend',
    description:
      'Compact 14-bar micro-chart of account activity in bright/dim green, mirroring the reference Last-Activity trend column. A premium component.',
    category: 'data-display',
    accessLevel: 'premium',
    version: '1.0.0',
    dependencies: [],
    file: 'ActivityTrend',
    propsDoc:
      '`values?: number[]` (first 14 used, 1–6 range); bar heights are derived in pixels so no framework CSS is required.',
    usageDoc:
      '```tsx\nimport { ActivityTrend } from "./tech-inject/activity-trend/ActivityTrend";\n\n<ActivityTrend values={[1,3,6,2,4,5,2,1,6,4,3,5,2,1]} />\n```',
  },
  {
    slug: 'dropdown-menu',
    name: 'Dropdown Menu',
    description:
      'Split dropdown pill (label | divider | rotating chevron) plus menu content, items and separators, built on Radix DropdownMenu. Premium.',
    category: 'overlay',
    accessLevel: 'premium',
    version: '1.0.0',
    dependencies: ['@radix-ui/react-dropdown-menu'],
    file: 'Dropdown',
    supportFiles: { 'Icons.tsx': 'components/Icons.tsx' },
    propsDoc:
      '`SplitTrigger` accepts `label`, `aria-label` and native button props; `DropdownMenuContent` accepts `align`, `sideOffset`. `DropdownMenuItem` supports disabled + danger styling via `data-danger` or `aria-disabled`.',
    usageDoc:
      '```tsx\nimport { DropdownMenu, DropdownMenuContent, DropdownMenuItem, SplitTrigger } from "./tech-inject/dropdown-menu/Dropdown";\n\n<DropdownMenu>\n  <SplitTrigger label="Stage · Any" />\n  <DropdownMenuContent>\n    <DropdownMenuItem>Discovery</DropdownMenuItem>\n    <DropdownMenuItem>Won</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>\n```',
  },
  {
    slug: 'table',
    name: 'Table',
    description:
      'Typed selectable grid table with tabular numerals, hover and active row states, and an optional checkbox selection column. Premium.',
    category: 'data-display',
    accessLevel: 'premium',
    version: '1.0.0',
    dependencies: ['@radix-ui/react-checkbox'],
    file: 'Table',
    supportFiles: {
      'Checkbox.tsx': 'components/Checkbox.tsx',
      'Checkbox.css': 'styles/Checkbox.css',
    },
    propsDoc:
      '`columns: TableColumn<T>[]` (key, header, optional `track` grid size, `numeric`, `render`); `rows: T[]`; `rowId: (r)=>string`; optional `selection: { selected: string[]; onChange }`; `activeId`, `onRowActivate`.',
    usageDoc:
      '```tsx\nimport { Table, type TableColumn } from "./tech-inject/table/Table";\n\n<Table columns={columns} rows={rows} rowId={r => r.id} selection={{selected, onChange:setSelected}} />\n```',
  },
  {
    slug: 'sidebar',
    name: 'Sidebar',
    description:
      '254px grouped navigation rail with eyebrow headings, count chips, pipeline-colour dots, active pill and footer actions. Premium.',
    category: 'layout',
    accessLevel: 'premium',
    version: '1.0.0',
    dependencies: [],
    file: 'Sidebar',
    propsDoc:
      '`groups: SidebarGroup[]` (id, eyebrow, items); `SidebarItem { id, label, icon?, count?, dotColor?, href? }`; `activeId`, `onSelect`, `header?`, `footer?` render slots.',
    usageDoc:
      '```tsx\nimport { Sidebar, type SidebarGroup } from "./tech-inject/sidebar/Sidebar";\n\n<Sidebar groups={groups} activeId="companies" />\n```',
  },
];

function readFile(rel: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, rel), 'utf8');
}

export function buildBundle(def: UiComponentDefinition): ComponentBundle {
  const files: Record<string, string> = {
    [`components/${def.slug}/${def.file}.tsx`]: readFile(`components/${def.file}.tsx`),
    [`components/${def.slug}/${def.file}.css`]: readFile(`styles/${def.file}.css`),
    [`components/${def.slug}/${def.file}.story.tsx`]: readFile(`components/${def.file}.story.tsx`),
    [`components/${def.slug}/cn.ts`]: readFile('components/cn.ts'),
  };
  for (const [installed, src] of Object.entries(def.supportFiles ?? {})) {
    files[`components/${def.slug}/${installed}`] = readFile(src);
  }
  return {
    slug: def.slug,
    name: def.name,
    description: def.description,
    category: def.category,
    version: def.version,
    accessLevel: def.accessLevel,
    dependencies: def.dependencies,
    props: def.propsDoc,
    usage: def.usageDoc,
    files,
    preview: { story: `components/${def.slug}/${def.file}.story.tsx`, sample: {} },
  };
}