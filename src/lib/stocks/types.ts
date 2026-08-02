/**
 * The shape a stock search result takes in the UI. Deliberately narrow: it is
 * what `StockSearch` needs to render a row and hand back a selection.
 */
export interface StockSummary {
  ticker: string;
  company: string;
  /** NSE or BSE. Part of a position's identity -- the same ticker can list on both. */
  exchange: 'NSE' | 'BSE';
  sector: string;
  /** Latest known price, or null when we have never successfully fetched one. */
  lastPrice?: number | null;
}
