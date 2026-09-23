import { StatusChip } from './StatusChip.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', gap: 12, padding: 16, alignItems: 'center' };

/** Free · Feedback · Header status chips with live / danger dots. */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      <StatusChip>Active</StatusChip>
      <StatusChip state="danger">Slipping</StatusChip>
    </div>
  );
}