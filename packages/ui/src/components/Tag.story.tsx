import { Tag } from './Tag.js';

export interface ExampleProps {}

/** Free · Content · The 10-colour tag system used across Segment & Stage cells. */
export default function Example({}: ExampleProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16, alignItems: 'center' }}>
      <Tag color="green">Expansion</Tag>
      <Tag color="blue">Enterprise</Tag>
      <Tag color="purple">Upsell</Tag>
      <Tag color="red">Strategic</Tag>
      <Tag color="amber">Co-Sell</Tag>
      <Tag color="orange">Pilot</Tag>
      <Tag color="teal">New Logo</Tag>
      <Tag color="yellow">SMB</Tag>
      <Tag color="neutral">Renewal</Tag>
      <Tag color="neutral" pill>
        +2
      </Tag>
    </div>
  );
}