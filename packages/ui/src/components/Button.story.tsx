import { Button } from './Button.js';

export interface ExampleProps {}

const Plus = () => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
    <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
  </svg>
);

/** Free · Action · Buttons in all variants, sizes, states with realistic labels. */
export default function Example({}: ExampleProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 16, alignItems: 'center' }}>
      <Button variant="primary" leadingIcon={<Plus />}>
        New Company
      </Button>
      <Button variant="raised">Export</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="raised" size="sm">
        Save
      </Button>
      <Button variant="raised" loading>
        Publishing
      </Button>
      <Button variant="raised" disabled>
        Disabled
      </Button>
    </div>
  );
}