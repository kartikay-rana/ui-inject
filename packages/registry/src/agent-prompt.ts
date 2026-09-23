import type { ComponentBundle } from './types.js';

/**
 * Agent prompt builder (single source of truth — API endpoint and tests share
 * it). The prompt never embeds credentials; premium consumers pass a token via
 * the TECH_INJECT_TOKEN environment variable.
 */
export function buildAgentPrompt(
  component: Pick<ComponentBundle, 'name' | 'slug' | 'version' | 'accessLevel' | 'dependencies' | 'usage'>,
  opts: { registryUrl: string; installCommand: string }
): string {
  const premiumNote =
    component.accessLevel === 'premium'
      ? 'This is a PREMIUM component. Authenticate first by running the installer with a ' +
        'session token available in the TECH_INJECT_TOKEN environment variable. Do NOT paste or ' +
        'hardcode any credential into code or prompts.'
      : 'This component is free and requires no authentication.';

  return [
    `Add the "${component.name}" (${component.slug} v${component.version}) component to the current React + TypeScript project, preserving the Tech Inject theme exactly.`,
    '',
    'Steps:',
    `1. Run: ${opts.installCommand}`,
    `2. Install the declared dependencies the installer reports (it lists them in techinject.json; typically: ${component.dependencies.join(', ')}).`,
    '3. Import the component from the files the installer created and render it using the provided example story so you can verify it visually.',
    '4. Preserve the theme: keep the token variables (background #161616, foreground #f9fbff, primary #4124fb, border #232323, radius 0.5rem) and the raised-button elevation recipe unchanged. Do not introduce new colours.',
    '5. Do not modify, delete, or override the installed theme file and do not rename component files.',
    '6. Verify: run the project type-check and build successfully, render the preview in a browser, and confirm hover, focus-visible ring, disabled, and selected states behave.',
    '7. If a compile error appears, fix it inside your project only and keep the component source unchanged; report any component defect back.',
    '',
    'Usage documentation:',
    component.usage,
    '',
    premiumNote,
    `Registry: ${opts.registryUrl}`,
  ].join('\n');
}