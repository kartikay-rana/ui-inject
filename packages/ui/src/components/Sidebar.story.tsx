import { Sidebar, type SidebarGroup } from './Sidebar.js';

export interface ExampleProps {}

const icon = (d: string, view = '0 0 14 14') => (
  <svg viewBox={view} width="14" height="14" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
  </svg>
);

const groups: SidebarGroup[] = [
  {
    id: 'primary',
    eyebrow: 'Primary',
    items: [
      { id: 'companies', label: 'Companies', icon: icon('M6.417 6.417h-2.8M2.917 1.75h6.166A1.167 1.167 0 0 1 10.25 2.917v6.166A1.167 1.167 0 0 1 9.083 10.25H2.917A1.167 1.167 0 0 1 1.75 9.083V2.917A1.167 1.167 0 0 1 2.917 1.75Z'), count: 241 },
      { id: 'deals', label: 'Deals Board', icon: icon('M9.333 2.333c.543.217.935.737.935 1.341l.012 7.126a1.35 1.35 0 0 1-1.35 1.341c-.372 0-.71-.137-.973-.362M4.667 2.333h4.666M4.667 2.333h4.666') },
      { id: 'forecast', label: 'Forecast', icon: icon('M1.75 6.417v5.833m7-9.917V12.25m-3.5-1.5.233-9.417M9.917 12.25h2.333', '0 0 12 12'), count: 9 },
    ],
  },
  {
    id: 'pipeline',
    eyebrow: 'Pipelines',
    items: [
      { id: 'na', label: 'North America', dotColor: '#FFDB4B' },
      { id: 'ea', label: 'EMEA Enterprise', dotColor: '#FE4A8E' },
      { id: 'ap', label: 'APAC Expansion', dotColor: '#9668FE' },
    ],
  },
];

/** Premium · Layout · 254px grouped rail with count chips, dots, active pill and footer. */
export default function Example({}: ExampleProps) {
  return (
    <div style={{ height: 360, border: '1px solid var(--sidebar-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Sidebar
        groups={groups}
        activeId="companies"
        header={
          <div className="ti-sidebar__header">
            <span className="ti-avatar ti-avatar--lg" style={{ background: '#2a2a2a' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeWidth="1.5" />
                <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
            <div>
              <div className="ti-sidebar__title">Sales CRM</div>
              <div className="ti-sidebar__caption">Company pipeline</div>
            </div>
          </div>
        }
      />
    </div>
  );
}