import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  SplitTrigger,
} from './Dropdown.js';

export interface ExampleProps {}

const ROW: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16, alignItems: 'center' };

/** Premium · Overlay · Split dropdown pills (Sort by / Filter) with open chevron flip. */
export default function Example({}: ExampleProps) {
  return (
    <div style={ROW}>
      <DropdownMenu>
        <SplitTrigger label="Sort by · Pipeline Value" aria-label="sort by pipeline value" />
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Deal count</DropdownMenuItem>
          <DropdownMenuItem>Pipeline Value</DropdownMenuItem>
          <DropdownMenuItem>Win Probability</DropdownMenuItem>
          <DropdownMenuItem>Last Activity</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <SplitTrigger label="Stage · Any" aria-label="filter by stage" />
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Discovery</DropdownMenuItem>
          <DropdownMenuItem>Proposal</DropdownMenuItem>
          <DropdownMenuItem>Negotiation</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Won</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}