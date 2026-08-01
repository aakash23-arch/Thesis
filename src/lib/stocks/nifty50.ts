import type { StockSummary } from './types';

/**
 * Nifty 50 constituents, used as the stock universe until Session 3 stands up
 * the BSE/NSE ingestion pipeline and seeds `stocks` in Postgres.
 *
 * This is reference data for search and autocomplete only -- no prices, no
 * weights, nothing that goes stale in a way that could mislead. Index
 * membership changes a couple of times a year; being slightly behind costs a
 * missing autocomplete entry, not a wrong number on screen.
 */
export const NIFTY_50: readonly StockSummary[] = [
  { ticker: 'ADANIENT', company: 'Adani Enterprises', exchange: 'NSE', sector: 'Conglomerate' },
  { ticker: 'ADANIPORTS', company: 'Adani Ports & SEZ', exchange: 'NSE', sector: 'Infrastructure' },
  { ticker: 'APOLLOHOSP', company: 'Apollo Hospitals', exchange: 'NSE', sector: 'Healthcare' },
  { ticker: 'ASIANPAINT', company: 'Asian Paints', exchange: 'NSE', sector: 'Consumer Goods' },
  { ticker: 'AXISBANK', company: 'Axis Bank', exchange: 'NSE', sector: 'Banking' },
  { ticker: 'BAJAJ-AUTO', company: 'Bajaj Auto', exchange: 'NSE', sector: 'Auto' },
  { ticker: 'BAJAJFINSV', company: 'Bajaj Finserv', exchange: 'NSE', sector: 'Financial Services' },
  { ticker: 'BAJFINANCE', company: 'Bajaj Finance', exchange: 'NSE', sector: 'Financial Services' },
  { ticker: 'BEL', company: 'Bharat Electronics', exchange: 'NSE', sector: 'Defence' },
  { ticker: 'BHARTIARTL', company: 'Bharti Airtel', exchange: 'NSE', sector: 'Telecom' },
  { ticker: 'BPCL', company: 'Bharat Petroleum', exchange: 'NSE', sector: 'Energy' },
  { ticker: 'BRITANNIA', company: 'Britannia Industries', exchange: 'NSE', sector: 'FMCG' },
  { ticker: 'CIPLA', company: 'Cipla', exchange: 'NSE', sector: 'Pharma' },
  { ticker: 'COALINDIA', company: 'Coal India', exchange: 'NSE', sector: 'Mining' },
  { ticker: 'DIVISLAB', company: "Divi's Laboratories", exchange: 'NSE', sector: 'Pharma' },
  { ticker: 'DRREDDY', company: "Dr. Reddy's Laboratories", exchange: 'NSE', sector: 'Pharma' },
  { ticker: 'EICHERMOT', company: 'Eicher Motors', exchange: 'NSE', sector: 'Auto' },
  { ticker: 'GRASIM', company: 'Grasim Industries', exchange: 'NSE', sector: 'Cement' },
  { ticker: 'HCLTECH', company: 'HCL Technologies', exchange: 'NSE', sector: 'IT Services' },
  { ticker: 'HDFCBANK', company: 'HDFC Bank', exchange: 'NSE', sector: 'Banking' },
  { ticker: 'HDFCLIFE', company: 'HDFC Life Insurance', exchange: 'NSE', sector: 'Insurance' },
  { ticker: 'HEROMOTOCO', company: 'Hero MotoCorp', exchange: 'NSE', sector: 'Auto' },
  { ticker: 'HINDALCO', company: 'Hindalco Industries', exchange: 'NSE', sector: 'Metals' },
  { ticker: 'HINDUNILVR', company: 'Hindustan Unilever', exchange: 'NSE', sector: 'FMCG' },
  { ticker: 'ICICIBANK', company: 'ICICI Bank', exchange: 'NSE', sector: 'Banking' },
  { ticker: 'INDUSINDBK', company: 'IndusInd Bank', exchange: 'NSE', sector: 'Banking' },
  { ticker: 'INFY', company: 'Infosys', exchange: 'NSE', sector: 'IT Services' },
  { ticker: 'ITC', company: 'ITC', exchange: 'NSE', sector: 'FMCG' },
  {
    ticker: 'JIOFIN',
    company: 'Jio Financial Services',
    exchange: 'NSE',
    sector: 'Financial Services',
  },
  { ticker: 'JSWSTEEL', company: 'JSW Steel', exchange: 'NSE', sector: 'Metals' },
  { ticker: 'KOTAKBANK', company: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking' },
  { ticker: 'LT', company: 'Larsen & Toubro', exchange: 'NSE', sector: 'Infrastructure' },
  { ticker: 'M&M', company: 'Mahindra & Mahindra', exchange: 'NSE', sector: 'Auto' },
  { ticker: 'MARUTI', company: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Auto' },
  { ticker: 'NESTLEIND', company: 'Nestle India', exchange: 'NSE', sector: 'FMCG' },
  { ticker: 'NTPC', company: 'NTPC', exchange: 'NSE', sector: 'Power' },
  { ticker: 'ONGC', company: 'Oil & Natural Gas Corporation', exchange: 'NSE', sector: 'Energy' },
  { ticker: 'POWERGRID', company: 'Power Grid Corporation', exchange: 'NSE', sector: 'Power' },
  { ticker: 'RELIANCE', company: 'Reliance Industries', exchange: 'NSE', sector: 'Energy' },
  { ticker: 'SBILIFE', company: 'SBI Life Insurance', exchange: 'NSE', sector: 'Insurance' },
  { ticker: 'SBIN', company: 'State Bank of India', exchange: 'NSE', sector: 'Banking' },
  {
    ticker: 'SHRIRAMFIN',
    company: 'Shriram Finance',
    exchange: 'NSE',
    sector: 'Financial Services',
  },
  { ticker: 'SUNPHARMA', company: 'Sun Pharmaceutical', exchange: 'NSE', sector: 'Pharma' },
  { ticker: 'TATACONSUM', company: 'Tata Consumer Products', exchange: 'NSE', sector: 'FMCG' },
  { ticker: 'TATAMOTORS', company: 'Tata Motors', exchange: 'NSE', sector: 'Auto' },
  { ticker: 'TATASTEEL', company: 'Tata Steel', exchange: 'NSE', sector: 'Metals' },
  { ticker: 'TCS', company: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT Services' },
  { ticker: 'TECHM', company: 'Tech Mahindra', exchange: 'NSE', sector: 'IT Services' },
  { ticker: 'TITAN', company: 'Titan Company', exchange: 'NSE', sector: 'Consumer Goods' },
  { ticker: 'TRENT', company: 'Trent', exchange: 'NSE', sector: 'Retail' },
  { ticker: 'ULTRACEMCO', company: 'UltraTech Cement', exchange: 'NSE', sector: 'Cement' },
  { ticker: 'WIPRO', company: 'Wipro', exchange: 'NSE', sector: 'IT Services' },
];
