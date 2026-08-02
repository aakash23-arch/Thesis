'use client';

import * as React from 'react';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/format';
import type { StockSummary } from '@/lib/stocks/types';

const DEBOUNCE_MS = 180;

/**
 * The search itself lives behind an API route, not an import: it queries
 * Postgres and so cannot run in the browser.
 */
async function fetchMatches(query: string, signal: AbortSignal): Promise<StockSummary[]> {
  const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) return [];
  const body = (await response.json()) as { results?: StockSummary[] };
  return body.results ?? [];
}

export interface StockSearchProps {
  onSelect: (stock: StockSummary) => void;
  /** Shown in the field once a stock has been chosen. */
  value?: StockSummary | null;
  placeholder?: string;
  id?: string;
  'aria-describedby'?: string;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Ticker/company autocomplete over `searchStocks`. Implements the ARIA combobox
 * pattern: the input keeps focus throughout and the active option is pointed at
 * with aria-activedescendant, so arrow keys move a visible highlight without
 * moving focus.
 */
export function StockSearch({
  onSelect,
  value,
  placeholder = 'Search by ticker or company...',
  id,
  'aria-describedby': describedBy,
  error = false,
  autoFocus = false,
  className,
}: StockSearchProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const listboxId = `${generatedId}-listbox`;

  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  // What the last completed search was for, and what it returned. Keeping the
  // query alongside the results lets "is a search in flight" be derived rather
  // than tracked as a third piece of state that can disagree with the other two.
  const [settled, setSettled] = React.useState<{ query: string; items: StockSummary[] }>({
    query: '',
    items: [],
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  // Guards against a slow earlier request overwriting a newer one's results.
  const requestRef = React.useRef(0);

  const trimmed = query.trim();
  // An empty box shows nothing; otherwise keep the previous results on screen
  // while the next search runs, so the list does not flicker between keystrokes.
  const results = trimmed === '' ? [] : settled.items;
  const pending = trimmed !== '' && settled.query !== trimmed;
  const safeActiveIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

  React.useEffect(() => {
    // No setState in the effect body -- only inside the debounced callback,
    // which is a genuine external-event boundary.
    if (trimmed === '') return;

    const requestId = ++requestRef.current;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const found = await fetchMatches(trimmed, controller.signal);
        if (requestRef.current !== requestId) return;
        setSettled({ query: trimmed, items: found });
        setActiveIndex(0);
      } catch {
        // Aborted or offline. Leave the previous results on screen rather than
        // blanking the list under the user's cursor.
        if (requestRef.current === requestId) setSettled({ query: trimmed, items: [] });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // Close when focus or a click lands outside the whole widget.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const select = (stock: StockSummary) => {
    onSelect(stock);
    // Clearing the query empties `results` by derivation.
    setQuery('');
    setOpen(false);
  };

  const showList = open && results.length > 0;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!showList) {
      // Arrow down with a query but a closed list re-opens it.
      if (event.key === 'ArrowDown' && results.length > 0) {
        setOpen(true);
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((safeActiveIndex + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((safeActiveIndex - 1 + results.length) % results.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(results.length - 1);
        break;
      case 'Enter': {
        const active = results[safeActiveIndex];
        if (active) {
          event.preventDefault();
          select(active);
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-card border border-border bg-surface px-3 transition-colors duration-instrument focus-within:ring-2 focus-within:ring-border-focus',
          error && 'border-signal-broken focus-within:ring-signal-broken',
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden />
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listboxId}-${safeActiveIndex}` : undefined}
          aria-describedby={describedBy}
          aria-invalid={error || undefined}
          autoFocus={autoFocus}
          placeholder={value ? `${value.ticker} — ${value.company}` : placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full min-w-0 bg-transparent text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
        />
        {pending && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-tertiary" aria-hidden />
        )}
      </div>

      {/* Announced out of band so screen readers hear the count without the
          listbox stealing focus. */}
      <span aria-live="polite" className="sr-only">
        {showList ? `${results.length} matches` : ''}
      </span>

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Matching stocks"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-card border border-border-strong bg-surface py-1"
        >
          {results.map((stock, index) => (
            <li
              key={`${stock.exchange}:${stock.ticker}`}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === safeActiveIndex}
              data-ticker={stock.ticker}
              // Pointer down rather than click: click fires after blur, which
              // would already have closed the list.
              onPointerDown={(event) => {
                event.preventDefault();
                select(stock);
              }}
              onPointerEnter={() => setActiveIndex(index)}
              className={cn(
                'flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2',
                index === safeActiveIndex && 'bg-recessed',
              )}
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="font-mono text-data-small text-ink-primary">{stock.ticker}</span>
                <span className="truncate text-body text-ink-secondary">{stock.company}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-3">
                <span className="hidden text-caption uppercase tracking-[0.04em] text-ink-tertiary sm:inline">
                  {stock.sector}
                </span>
                {/* No price is shown as an em dash rather than a zero -- an
                    absent number must not read as a real one. */}
                <span className="w-20 text-right font-mono text-data-small tabular-nums text-ink-primary">
                  {stock.lastPrice == null ? '—' : formatINR(stock.lastPrice)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
