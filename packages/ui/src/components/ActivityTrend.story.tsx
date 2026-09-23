import { ActivityTrend } from './ActivityTrend.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', gap: 18, padding: 16, alignItems: 'center' };

/** Premium · Data display · 14-bar activity trend micro-chart. */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      <ActivityTrend values={[1, 3, 6, 2, 4, 5, 2, 1, 6, 4, 3, 5, 2, 1]} />
      <ActivityTrend values={[6, 1, 2, 5, 3, 1, 4, 2, 6, 3, 2, 5, 1, 4]} />
      <ActivityTrend values={[2, 2, 1, 1, 2, 3, 1, 2, 1, 2, 2, 3, 1, 2]} />
    </div>
  );
}