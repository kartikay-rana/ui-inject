import { Checkbox } from './Checkbox.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 28, padding: 16, alignItems: 'center' };

/** Free · Form · Checkbox with checked/indeterminate/disabled states (yellow fill). */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      <Checkbox label="Select all" defaultChecked />
      <Checkbox label="Indeterminate" checked="indeterminate" />
      <Checkbox label="Unchecked" />
      <Checkbox label="Disabled" disabled />
      <Checkbox aria-label="icon only" defaultChecked />
    </div>
  );
}