export interface Quote {
  ticker: string;
  exchange: 'NSE' | 'BSE';
  /** Latest traded price. */
  price: number;
  /** Prior session's close, for the day-change figure. */
  previousClose: number | null;
  /** When the provider says this price was current -- not when we fetched it. */
  asOf: Date;
}

export interface QuoteFailure {
  ticker: string;
  reason: string;
}

/**
 * A batch fetch always reports both halves. One delisted or misspelled ticker
 * must never cost us the other forty-nine, so failures are data, not exceptions.
 */
export interface QuoteBatch {
  quotes: Quote[];
  failures: QuoteFailure[];
}

export interface PriceProvider {
  readonly name: string;
  fetchQuotes(tickers: { ticker: string; exchange: 'NSE' | 'BSE' }[]): Promise<QuoteBatch>;
}
