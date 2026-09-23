import * as React from 'react';
import { Table, type TableColumn } from './Table.js';

export interface ExampleProps {}

interface Company {
  id: string;
  name: string;
  stage: string;
  owner: string;
  deals: number;
  value: number;
}

const tagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 22,
  padding: '0 8px',
  borderRadius: 999,
  border: '1px solid var(--tag-green-border)',
  background: 'var(--tag-green-bg)',
  color: 'var(--tag-green-text)',
  fontSize: 14,
  lineHeight: 1,
};

const rows: Company[] = [
  { id: 'c1', name: 'Nova Systems', stage: 'Expansion', owner: 'Sara Quinn', deals: 6, value: 530111 },
  { id: 'c2', name: 'Helix Medical', stage: 'Enterprise', owner: 'Dev Patel', deals: 3, value: 241000 },
  { id: 'c3', name: 'Summit Foods', stage: 'Pilot', owner: 'Rui Tanaka', deals: 9, value: 8995 },
  { id: 'c4', name: 'Orbit Freight', stage: 'SMB', owner: 'Lena Oko', deals: 2, value: 42100 },
];

const columns: TableColumn<Company>[] = [
  { key: 'name', header: 'Company', track: 'minmax(160px, 1fr)', render: (r) => r.name },
  { key: 'stage', header: 'Segment & Stage', track: 'max-content', render: (r) => <span style={tagStyle}>{r.stage}</span> },
  { key: 'owner', header: 'Account Owner', track: 'max-content', render: (r) => r.owner },
  { key: 'deals', header: 'Open Deals', track: 'max-content', numeric: true, render: (r) => r.deals },
  {
    key: 'value',
    header: 'Pipeline Value',
    track: 'max-content',
    numeric: true,
    render: (r) => (
      <>
        <span style={{ color: 'var(--muted-foreground)' }}>$</span>
        {r.value.toLocaleString()}
      </>
    ),
  },
];

/** Premium · Data · Selectable grid table with hover / active row states. */
export default function Example({}: ExampleProps) {
  const [selected, setSelected] = React.useState<string[]>(['c2']);
  const [active, setActive] = React.useState<string | undefined>('c1');
  return (
    <div style={{ padding: 8 }}>
      <Table
        columns={columns}
        rows={rows}
        rowId={(r) => r.id}
        selection={{ selected, onChange: setSelected }}
        activeId={active}
        onRowActivate={setActive}
      />
    </div>
  );
}