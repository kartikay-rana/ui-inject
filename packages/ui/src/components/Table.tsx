import type { ReactNode } from 'react';
import { cn } from './cn.js';
import { Checkbox } from './Checkbox.js';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  /** CSS grid track, e.g. `max-content` or `minmax(0, 1fr)` */
  track?: string;
  numeric?: boolean;
  muted?: boolean;
  render: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowId: (row: T) => string;
  /** when provided, renders a checkbox selection column */
  selection?: {
    selected: string[];
    onChange: (next: string[]) => void;
  };
  activeId?: string;
  onRowActivate?: (id: string) => void;
  /** CSS grid tracks override (defaults to each column's own track) */
  className?: string;
}

/** Data table: grid layout, tabular numerals, hover + selected row states. */
export function Table<T>({ columns, rows, rowId, selection, activeId, onRowActivate, className }: TableProps<T>) {
  const tracks = selection ? ['max-content', ...columns.map((c) => c.track ?? 'max-content')] : columns.map((c) => c.track ?? 'max-content');
  const allSelected = selection ? rows.length > 0 && rows.every((r) => selection.selected.includes(rowId(r))) : false;
  const someSelected = selection ? rows.some((r) => selection.selected.includes(rowId(r))) && !allSelected : false;

  return (
    <div className={cn('ti-table', className)} role="table" style={{ gridTemplateColumns: tracks.join(' ') }}>
      <div className="ti-table__header" role="row">
        {selection ? (
          <div className="ti-table__cell" role="columnheader">
            <Checkbox
              aria-label="select all rows"
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(next) => {
                if (!selection) return;
                selection.onChange(next === false ? [] : rows.map(rowId));
              }}
            />
          </div>
        ) : null}
        {columns.map((c) => (
          <div key={c.key} className={cn('ti-table__cell', c.numeric && 'ti-table__cell--num')} role="columnheader">
            {c.header}
          </div>
        ))}
      </div>

      {rows.map((row) => {
        const id = rowId(row);
        const selected = selection?.selected.includes(id) ?? false;
        return (
          <div
            key={id}
            role="row"
            className={cn('ti-table__row', activeId === id && 'ti-table__row--active')}
            onClick={() => onRowActivate?.(id)}
          >
            {selection ? (
              <div className="ti-table__cell" role="cell">
                <Checkbox
                  aria-label={`select row ${id}`}
                  checked={selected}
                  onCheckedChange={(next) => {
                    if (!selection) return;
                    selection.onChange(next ? [...selection.selected, id] : selection.selected.filter((x) => x !== id));
                  }}
                />
              </div>
            ) : null}
            {columns.map((c) => (
              <div key={c.key} className={cn('ti-table__cell', c.numeric && 'ti-table__cell--num', c.muted && 'ti-table__cell--muted')} role="cell">
                {c.render(row)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}