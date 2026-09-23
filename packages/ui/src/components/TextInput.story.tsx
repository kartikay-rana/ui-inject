import { TextInput, SearchButton } from './TextInput.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 340, padding: 16 };

/** Free · Form · Text input states + the pill search affordance with ⌘K hint. */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      <TextInput placeholder="Search companies…" aria-label="search" />
      <TextInput defaultValue="Acme Corp" aria-label="company name" />
      <TextInput placeholder="Disabled field" disabled aria-label="disabled" />
      <SearchButton>Search</SearchButton>
    </div>
  );
}