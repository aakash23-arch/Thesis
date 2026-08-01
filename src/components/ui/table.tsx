'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Pins the header while the body scrolls -- long position lists. */
  stickyHeader?: boolean;
  /** Caps the scroll container's height; pair with stickyHeader. */
  maxHeight?: string;
}

const StickyHeaderContext = React.createContext(false);

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, stickyHeader = false, maxHeight, ...props }, ref) => (
    <StickyHeaderContext.Provider value={stickyHeader}>
      <div
        className={cn('w-full overflow-auto', stickyHeader && 'relative')}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table
          ref={ref}
          className={cn('w-full caption-bottom border-collapse text-body', className)}
          {...props}
        />
      </div>
    </StickyHeaderContext.Provider>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const sticky = React.useContext(StickyHeaderContext);
  return (
    <thead
      ref={ref}
      className={cn(
        'border-b border-border-strong',
        sticky && 'sticky top-0 z-10 bg-surface',
        className,
      )}
      {...props}
    />
  );
});
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <tbody ref={ref} className={cn(className)} {...props} />);
TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Row responds to pointer -- use for rows that navigate to a detail page. */
  interactive?: boolean;
  /** Marks the row as the current selection. */
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, interactive = false, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? 'selected' : undefined}
      aria-selected={selected || undefined}
      className={cn(
        // Spec: alternating #FFFFFF / #FAFBFC, 48px rows, thin bottom borders only.
        'h-12 border-b border-border odd:bg-surface even:bg-page',
        interactive &&
          'focus-ring cursor-pointer transition-colors duration-instrument hover:bg-recessed',
        selected && 'bg-accent-light odd:bg-accent-light even:bg-accent-light',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Renders a sort affordance and wires aria-sort. Supply onSort to handle clicks. */
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  /** Right-aligns the header to sit over a numeric column. */
  numeric?: boolean;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      sortable = false,
      sortDirection = null,
      onSort,
      numeric = false,
      children,
      ...props
    },
    ref,
  ) => {
    const SortIcon =
      sortDirection === 'asc' ? ChevronUp : sortDirection === 'desc' ? ChevronDown : ChevronsUpDown;

    return (
      <th
        ref={ref}
        scope="col"
        aria-sort={
          !sortable
            ? undefined
            : sortDirection === 'asc'
              ? 'ascending'
              : sortDirection === 'desc'
                ? 'descending'
                : 'none'
        }
        className={cn(
          'h-10 px-4 text-caption font-medium uppercase tracking-[0.04em] text-ink-secondary',
          numeric ? 'text-right' : 'text-left',
          className,
        )}
        {...props}
      >
        {sortable ? (
          <button
            type="button"
            onClick={onSort}
            className={cn(
              'focus-ring -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase tracking-[0.04em] transition-colors duration-instrument hover:text-ink-primary',
              numeric && 'flex-row-reverse',
            )}
          >
            {children}
            <SortIcon
              className={cn('h-3 w-3 shrink-0', sortDirection === null && 'text-ink-tertiary')}
              aria-hidden
            />
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, numeric = false, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-4 text-ink-primary',
        numeric && 'text-right font-mono tabular-nums',
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

export interface TableEmptyProps {
  /** Must match the table's column count so the cell spans the full width. */
  colSpan: number;
  children: React.ReactNode;
}

/** Full-width row for the no-data case. Pass an <EmptyState /> as children. */
function TableEmpty({ colSpan, children }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12">
        {children}
      </td>
    </tr>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty };
