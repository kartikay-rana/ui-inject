import { WinProbabilityMeter } from './WinProbabilityMeter.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 300, padding: 16 };

const data = [
  { p: 15, label: '15%' },
  { p: 38, label: '38%' },
  { p: 60, label: '60%' },
  { p: 82, label: '82%' },
  { p: 96, label: '96%' },
];

/** Premium · Data display · 17-segment LED win-probability meter. */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <WinProbabilityMeter value={d.p} />
          <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}