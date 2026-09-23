import { Avatar } from './Avatar.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 14, padding: 16, alignItems: 'center' };

const IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="%234124fb"/><text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="16" fill="white">AK</text></svg>';

/** Free · Content · Avatar chip with initials / image fallbacks and live status dot. */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      <Avatar name="Jensen Ackles" />
      <Avatar name="Alice Kim" status />
      <Avatar name="Bob Lin" src={IMAGE} />
      <Avatar name="M M" size="lg" status />
      <Avatar src={IMAGE} size="lg" />
    </div>
  );
}