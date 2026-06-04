import axios from 'axios'

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'
const BASE_URL = 'https://www.alphavantage.co/query'

// Types
export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  volume: number
  marketCap?: number
  pe?: number
  eps?: number
  week52High?: number
  week52Low?: number
  avgVolume?: number
  dividend?: number
  dividendYield?: number
  sector?: string
  industry?: string
  exchange?: string
  country?: string
}

export interface CandlestickData {
  timestamp: string
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  rsi: number[]
  macd: { macd: number; signal: number; histogram: number }[]
  sma20: number[]
  sma50: number[]
  ema12: number[]
  ema26: number[]
  bollingerBands: { upper: number; middle: number; lower: number }[]
}

export interface NewsArticle {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  summary: string
  image?: string
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  tickers?: string[]
}

export interface CompanyProfile {
  symbol: string
  name: string
  description: string
  exchange: string
  sector: string
  industry: string
  marketCap: number
  pe: number
  eps: number
  week52High: number
  week52Low: number
  avgVolume: number
  dividend: number
  dividendYield: number
  employees?: number
  headquarters?: string
  website?: string
  founded?: string
  ceo?: string
}

export interface PortfolioHolding {
  symbol: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
  totalValue: number
  totalGain: number
  gainPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface Portfolio {
  holdings: PortfolioHolding[]
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercent: number
  dayChange: number
  dayChangePercent: number
}

// 100+ US Stocks
const usStocks: Record<string, Omit<StockQuote, 'price' | 'change' | 'changePercent' | 'high' | 'low' | 'open' | 'previousClose' | 'volume'>> = {
  // Technology
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', marketCap: 2840e9, pe: 28.5, eps: 6.27, sector: 'Technology', industry: 'Consumer Electronics', exchange: 'NASDAQ', country: 'US' },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corporation', marketCap: 2810e9, pe: 34.2, eps: 11.07, sector: 'Technology', industry: 'Software', exchange: 'NASDAQ', country: 'US' },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', marketCap: 1780e9, pe: 24.8, eps: 5.71, sector: 'Technology', industry: 'Internet Services', exchange: 'NASDAQ', country: 'US' },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', marketCap: 1850e9, pe: 62.5, eps: 2.85, sector: 'Technology', industry: 'E-Commerce', exchange: 'NASDAQ', country: 'US' },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corporation', marketCap: 2160e9, pe: 65.3, eps: 13.41, sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', country: 'US' },
  META: { symbol: 'META', name: 'Meta Platforms Inc.', marketCap: 1300e9, pe: 29.4, eps: 17.21, sector: 'Technology', industry: 'Social Media', exchange: 'NASDAQ', country: 'US' },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', marketCap: 789e9, pe: 72.1, eps: 3.45, sector: 'Technology', industry: 'Electric Vehicles', exchange: 'NASDAQ', country: 'US' },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices', marketCap: 245e9, pe: 48.2, eps: 3.12, sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', country: 'US' },
  INTC: { symbol: 'INTC', name: 'Intel Corporation', marketCap: 175e9, pe: 18.5, eps: 2.24, sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', country: 'US' },
  CRM: { symbol: 'CRM', name: 'Salesforce Inc.', marketCap: 285e9, pe: 42.1, eps: 6.89, sector: 'Technology', industry: 'Cloud Software', exchange: 'NYSE', country: 'US' },
  ORCL: { symbol: 'ORCL', name: 'Oracle Corporation', marketCap: 320e9, pe: 35.8, eps: 3.24, sector: 'Technology', industry: 'Enterprise Software', exchange: 'NYSE', country: 'US' },
  CSCO: { symbol: 'CSCO', name: 'Cisco Systems Inc.', marketCap: 195e9, pe: 15.2, eps: 3.18, sector: 'Technology', industry: 'Networking', exchange: 'NASDAQ', country: 'US' },
  ADBE: { symbol: 'ADBE', name: 'Adobe Inc.', marketCap: 245e9, pe: 45.3, eps: 12.08, sector: 'Technology', industry: 'Software', exchange: 'NASDAQ', country: 'US' },
  IBM: { symbol: 'IBM', name: 'IBM Corporation', marketCap: 155e9, pe: 21.4, eps: 7.89, sector: 'Technology', industry: 'IT Services', exchange: 'NYSE', country: 'US' },
  QCOM: { symbol: 'QCOM', name: 'Qualcomm Inc.', marketCap: 175e9, pe: 22.8, eps: 6.92, sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', country: 'US' },
  AVGO: { symbol: 'AVGO', name: 'Broadcom Inc.', marketCap: 420e9, pe: 35.2, eps: 24.35, sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', country: 'US' },
  TXN: { symbol: 'TXN', name: 'Texas Instruments', marketCap: 165e9, pe: 24.5, eps: 7.32, sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', country: 'US' },
  NOW: { symbol: 'NOW', name: 'ServiceNow Inc.', marketCap: 145e9, pe: 85.2, eps: 8.24, sector: 'Technology', industry: 'Cloud Software', exchange: 'NYSE', country: 'US' },
  SNOW: { symbol: 'SNOW', name: 'Snowflake Inc.', marketCap: 58e9, pe: -42.1, eps: -0.85, sector: 'Technology', industry: 'Cloud Data', exchange: 'NYSE', country: 'US' },
  PLTR: { symbol: 'PLTR', name: 'Palantir Technologies', marketCap: 45e9, pe: 185.2, eps: 0.11, sector: 'Technology', industry: 'Data Analytics', exchange: 'NYSE', country: 'US' },
  
  // Finance
  JPM: { symbol: 'JPM', name: 'JPMorgan Chase & Co.', marketCap: 567e9, pe: 11.2, eps: 17.45, sector: 'Finance', industry: 'Banking', exchange: 'NYSE', country: 'US' },
  BAC: { symbol: 'BAC', name: 'Bank of America Corp.', marketCap: 285e9, pe: 10.8, eps: 3.24, sector: 'Finance', industry: 'Banking', exchange: 'NYSE', country: 'US' },
  WFC: { symbol: 'WFC', name: 'Wells Fargo & Co.', marketCap: 195e9, pe: 11.5, eps: 4.65, sector: 'Finance', industry: 'Banking', exchange: 'NYSE', country: 'US' },
  GS: { symbol: 'GS', name: 'Goldman Sachs Group', marketCap: 135e9, pe: 14.2, eps: 28.45, sector: 'Finance', industry: 'Investment Banking', exchange: 'NYSE', country: 'US' },
  MS: { symbol: 'MS', name: 'Morgan Stanley', marketCap: 155e9, pe: 15.8, eps: 5.82, sector: 'Finance', industry: 'Investment Banking', exchange: 'NYSE', country: 'US' },
  V: { symbol: 'V', name: 'Visa Inc.', marketCap: 578e9, pe: 31.2, eps: 8.97, sector: 'Finance', industry: 'Payments', exchange: 'NYSE', country: 'US' },
  MA: { symbol: 'MA', name: 'Mastercard Inc.', marketCap: 425e9, pe: 35.8, eps: 12.65, sector: 'Finance', industry: 'Payments', exchange: 'NYSE', country: 'US' },
  PYPL: { symbol: 'PYPL', name: 'PayPal Holdings Inc.', marketCap: 72e9, pe: 18.5, eps: 3.65, sector: 'Finance', industry: 'Digital Payments', exchange: 'NASDAQ', country: 'US' },
  AXP: { symbol: 'AXP', name: 'American Express Co.', marketCap: 165e9, pe: 18.2, eps: 12.24, sector: 'Finance', industry: 'Credit Services', exchange: 'NYSE', country: 'US' },
  BLK: { symbol: 'BLK', name: 'BlackRock Inc.', marketCap: 115e9, pe: 21.5, eps: 36.72, sector: 'Finance', industry: 'Asset Management', exchange: 'NYSE', country: 'US' },
  
  // Healthcare
  JNJ: { symbol: 'JNJ', name: 'Johnson & Johnson', marketCap: 385e9, pe: 15.8, eps: 10.12, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NYSE', country: 'US' },
  UNH: { symbol: 'UNH', name: 'UnitedHealth Group', marketCap: 485e9, pe: 22.4, eps: 23.45, sector: 'Healthcare', industry: 'Health Insurance', exchange: 'NYSE', country: 'US' },
  PFE: { symbol: 'PFE', name: 'Pfizer Inc.', marketCap: 155e9, pe: 12.5, eps: 2.18, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NYSE', country: 'US' },
  ABBV: { symbol: 'ABBV', name: 'AbbVie Inc.', marketCap: 285e9, pe: 14.2, eps: 11.42, sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NYSE', country: 'US' },
  MRK: { symbol: 'MRK', name: 'Merck & Co. Inc.', marketCap: 265e9, pe: 18.5, eps: 5.65, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NYSE', country: 'US' },
  LLY: { symbol: 'LLY', name: 'Eli Lilly and Co.', marketCap: 685e9, pe: 95.2, eps: 7.58, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NYSE', country: 'US' },
  TMO: { symbol: 'TMO', name: 'Thermo Fisher Scientific', marketCap: 195e9, pe: 28.5, eps: 17.85, sector: 'Healthcare', industry: 'Life Sciences', exchange: 'NYSE', country: 'US' },
  DHR: { symbol: 'DHR', name: 'Danaher Corporation', marketCap: 175e9, pe: 32.1, eps: 7.45, sector: 'Healthcare', industry: 'Medical Devices', exchange: 'NYSE', country: 'US' },
  BMY: { symbol: 'BMY', name: 'Bristol-Myers Squibb', marketCap: 98e9, pe: 8.5, eps: 5.72, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NYSE', country: 'US' },
  AMGN: { symbol: 'AMGN', name: 'Amgen Inc.', marketCap: 155e9, pe: 21.8, eps: 13.45, sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', country: 'US' },
  
  // Consumer
  WMT: { symbol: 'WMT', name: 'Walmart Inc.', marketCap: 445e9, pe: 28.5, eps: 5.8, sector: 'Consumer', industry: 'Retail', exchange: 'NYSE', country: 'US' },
  PG: { symbol: 'PG', name: 'Procter & Gamble Co.', marketCap: 385e9, pe: 25.2, eps: 6.45, sector: 'Consumer', industry: 'Consumer Goods', exchange: 'NYSE', country: 'US' },
  KO: { symbol: 'KO', name: 'Coca-Cola Company', marketCap: 265e9, pe: 24.8, eps: 2.48, sector: 'Consumer', industry: 'Beverages', exchange: 'NYSE', country: 'US' },
  PEP: { symbol: 'PEP', name: 'PepsiCo Inc.', marketCap: 235e9, pe: 26.5, eps: 6.42, sector: 'Consumer', industry: 'Beverages', exchange: 'NASDAQ', country: 'US' },
  COST: { symbol: 'COST', name: 'Costco Wholesale Corp.', marketCap: 315e9, pe: 48.2, eps: 14.75, sector: 'Consumer', industry: 'Retail', exchange: 'NASDAQ', country: 'US' },
  HD: { symbol: 'HD', name: 'Home Depot Inc.', marketCap: 345e9, pe: 22.8, eps: 15.24, sector: 'Consumer', industry: 'Home Improvement', exchange: 'NYSE', country: 'US' },
  NKE: { symbol: 'NKE', name: 'Nike Inc.', marketCap: 125e9, pe: 28.5, eps: 2.85, sector: 'Consumer', industry: 'Apparel', exchange: 'NYSE', country: 'US' },
  MCD: { symbol: 'MCD', name: "McDonald's Corporation", marketCap: 195e9, pe: 24.2, eps: 11.45, sector: 'Consumer', industry: 'Restaurants', exchange: 'NYSE', country: 'US' },
  SBUX: { symbol: 'SBUX', name: 'Starbucks Corporation', marketCap: 105e9, pe: 26.8, eps: 3.58, sector: 'Consumer', industry: 'Restaurants', exchange: 'NASDAQ', country: 'US' },
  DIS: { symbol: 'DIS', name: 'Walt Disney Company', marketCap: 175e9, pe: 42.5, eps: 2.24, sector: 'Consumer', industry: 'Entertainment', exchange: 'NYSE', country: 'US' },
  
  // Energy
  XOM: { symbol: 'XOM', name: 'Exxon Mobil Corporation', marketCap: 445e9, pe: 12.5, eps: 8.92, sector: 'Energy', industry: 'Oil & Gas', exchange: 'NYSE', country: 'US' },
  CVX: { symbol: 'CVX', name: 'Chevron Corporation', marketCap: 285e9, pe: 11.8, eps: 12.85, sector: 'Energy', industry: 'Oil & Gas', exchange: 'NYSE', country: 'US' },
  COP: { symbol: 'COP', name: 'ConocoPhillips', marketCap: 125e9, pe: 10.5, eps: 10.24, sector: 'Energy', industry: 'Oil & Gas', exchange: 'NYSE', country: 'US' },
  SLB: { symbol: 'SLB', name: 'Schlumberger Limited', marketCap: 72e9, pe: 15.2, eps: 3.35, sector: 'Energy', industry: 'Oil Services', exchange: 'NYSE', country: 'US' },
  EOG: { symbol: 'EOG', name: 'EOG Resources Inc.', marketCap: 72e9, pe: 9.8, eps: 12.65, sector: 'Energy', industry: 'Oil & Gas', exchange: 'NYSE', country: 'US' },
  
  // Industrial
  CAT: { symbol: 'CAT', name: 'Caterpillar Inc.', marketCap: 165e9, pe: 16.5, eps: 20.12, sector: 'Industrial', industry: 'Heavy Equipment', exchange: 'NYSE', country: 'US' },
  BA: { symbol: 'BA', name: 'Boeing Company', marketCap: 115e9, pe: -15.2, eps: -4.85, sector: 'Industrial', industry: 'Aerospace', exchange: 'NYSE', country: 'US' },
  GE: { symbol: 'GE', name: 'General Electric Co.', marketCap: 175e9, pe: 32.5, eps: 4.92, sector: 'Industrial', industry: 'Conglomerate', exchange: 'NYSE', country: 'US' },
  HON: { symbol: 'HON', name: 'Honeywell International', marketCap: 135e9, pe: 22.8, eps: 9.12, sector: 'Industrial', industry: 'Conglomerate', exchange: 'NASDAQ', country: 'US' },
  UPS: { symbol: 'UPS', name: 'United Parcel Service', marketCap: 115e9, pe: 18.5, eps: 7.42, sector: 'Industrial', industry: 'Logistics', exchange: 'NYSE', country: 'US' },
  RTX: { symbol: 'RTX', name: 'RTX Corporation', marketCap: 145e9, pe: 42.8, eps: 2.45, sector: 'Industrial', industry: 'Aerospace & Defense', exchange: 'NYSE', country: 'US' },
  LMT: { symbol: 'LMT', name: 'Lockheed Martin Corp.', marketCap: 115e9, pe: 16.8, eps: 27.85, sector: 'Industrial', industry: 'Defense', exchange: 'NYSE', country: 'US' },
  
  // Communications
  T: { symbol: 'T', name: 'AT&T Inc.', marketCap: 125e9, pe: 8.5, eps: 2.08, sector: 'Communications', industry: 'Telecom', exchange: 'NYSE', country: 'US' },
  VZ: { symbol: 'VZ', name: 'Verizon Communications', marketCap: 165e9, pe: 9.2, eps: 4.48, sector: 'Communications', industry: 'Telecom', exchange: 'NYSE', country: 'US' },
  NFLX: { symbol: 'NFLX', name: 'Netflix Inc.', marketCap: 265e9, pe: 42.5, eps: 14.85, sector: 'Communications', industry: 'Streaming', exchange: 'NASDAQ', country: 'US' },
  CMCSA: { symbol: 'CMCSA', name: 'Comcast Corporation', marketCap: 155e9, pe: 10.5, eps: 3.72, sector: 'Communications', industry: 'Cable', exchange: 'NASDAQ', country: 'US' },
  TMUS: { symbol: 'TMUS', name: 'T-Mobile US Inc.', marketCap: 195e9, pe: 22.8, eps: 7.45, sector: 'Communications', industry: 'Telecom', exchange: 'NASDAQ', country: 'US' },
}

// 50+ Indian Stocks (NSE)
const indianStocks: Record<string, Omit<StockQuote, 'price' | 'change' | 'changePercent' | 'high' | 'low' | 'open' | 'previousClose' | 'volume'>> = {
  'RELIANCE.NS': { symbol: 'RELIANCE.NS', name: 'Reliance Industries', marketCap: 19500e9, pe: 28.5, eps: 98.72, sector: 'Energy', industry: 'Oil & Gas', exchange: 'NSE', country: 'IN' },
  'TCS.NS': { symbol: 'TCS.NS', name: 'Tata Consultancy Services', marketCap: 14200e9, pe: 32.4, eps: 121.45, sector: 'Technology', industry: 'IT Services', exchange: 'NSE', country: 'IN' },
  'HDFCBANK.NS': { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', marketCap: 12500e9, pe: 21.8, eps: 78.92, sector: 'Finance', industry: 'Banking', exchange: 'NSE', country: 'IN' },
  'INFY.NS': { symbol: 'INFY.NS', name: 'Infosys Limited', marketCap: 7800e9, pe: 26.5, eps: 68.45, sector: 'Technology', industry: 'IT Services', exchange: 'NSE', country: 'IN' },
  'ICICIBANK.NS': { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', marketCap: 7200e9, pe: 18.9, eps: 55.78, sector: 'Finance', industry: 'Banking', exchange: 'NSE', country: 'IN' },
  'HINDUNILVR.NS': { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', marketCap: 6100e9, pe: 58.2, eps: 45.12, sector: 'Consumer', industry: 'FMCG', exchange: 'NSE', country: 'IN' },
  'SBIN.NS': { symbol: 'SBIN.NS', name: 'State Bank of India', marketCap: 5800e9, pe: 11.2, eps: 58.45, sector: 'Finance', industry: 'Banking', exchange: 'NSE', country: 'IN' },
  'BHARTIARTL.NS': { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', marketCap: 5200e9, pe: 85.4, eps: 10.28, sector: 'Communications', industry: 'Telecom', exchange: 'NSE', country: 'IN' },
  'ITC.NS': { symbol: 'ITC.NS', name: 'ITC Limited', marketCap: 5100e9, pe: 26.8, eps: 15.42, sector: 'Consumer', industry: 'Conglomerate', exchange: 'NSE', country: 'IN' },
  'KOTAKBANK.NS': { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', marketCap: 3800e9, pe: 22.4, eps: 85.65, sector: 'Finance', industry: 'Banking', exchange: 'NSE', country: 'IN' },
  'LT.NS': { symbol: 'LT.NS', name: 'Larsen & Toubro', marketCap: 4200e9, pe: 35.2, eps: 98.45, sector: 'Industrial', industry: 'Engineering', exchange: 'NSE', country: 'IN' },
  'AXISBANK.NS': { symbol: 'AXISBANK.NS', name: 'Axis Bank Limited', marketCap: 3200e9, pe: 14.8, eps: 72.85, sector: 'Finance', industry: 'Banking', exchange: 'NSE', country: 'IN' },
  'ASIANPAINT.NS': { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Limited', marketCap: 2800e9, pe: 62.5, eps: 47.25, sector: 'Industrial', industry: 'Paints', exchange: 'NSE', country: 'IN' },
  'MARUTI.NS': { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India', marketCap: 3500e9, pe: 32.8, eps: 342.15, sector: 'Consumer', industry: 'Automobiles', exchange: 'NSE', country: 'IN' },
  'TITAN.NS': { symbol: 'TITAN.NS', name: 'Titan Company Limited', marketCap: 2600e9, pe: 78.5, eps: 38.42, sector: 'Consumer', industry: 'Jewelry', exchange: 'NSE', country: 'IN' },
  'SUNPHARMA.NS': { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', marketCap: 3200e9, pe: 42.5, eps: 32.18, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NSE', country: 'IN' },
  'BAJFINANCE.NS': { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Limited', marketCap: 4800e9, pe: 38.2, eps: 205.45, sector: 'Finance', industry: 'NBFC', exchange: 'NSE', country: 'IN' },
  'WIPRO.NS': { symbol: 'WIPRO.NS', name: 'Wipro Limited', marketCap: 2400e9, pe: 22.8, eps: 20.45, sector: 'Technology', industry: 'IT Services', exchange: 'NSE', country: 'IN' },
  'HCLTECH.NS': { symbol: 'HCLTECH.NS', name: 'HCL Technologies', marketCap: 4100e9, pe: 24.5, eps: 62.18, sector: 'Technology', industry: 'IT Services', exchange: 'NSE', country: 'IN' },
  'TATAMOTORS.NS': { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', marketCap: 2800e9, pe: 18.5, eps: 42.75, sector: 'Consumer', industry: 'Automobiles', exchange: 'NSE', country: 'IN' },
  'TATASTEEL.NS': { symbol: 'TATASTEEL.NS', name: 'Tata Steel Limited', marketCap: 1800e9, pe: 8.5, eps: 18.42, sector: 'Industrial', industry: 'Steel', exchange: 'NSE', country: 'IN' },
  'POWERGRID.NS': { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation', marketCap: 2200e9, pe: 12.8, eps: 24.65, sector: 'Energy', industry: 'Utilities', exchange: 'NSE', country: 'IN' },
  'NTPC.NS': { symbol: 'NTPC.NS', name: 'NTPC Limited', marketCap: 3100e9, pe: 15.2, eps: 21.45, sector: 'Energy', industry: 'Power', exchange: 'NSE', country: 'IN' },
  'ONGC.NS': { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp', marketCap: 2400e9, pe: 8.2, eps: 32.78, sector: 'Energy', industry: 'Oil & Gas', exchange: 'NSE', country: 'IN' },
  'ULTRACEMCO.NS': { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', marketCap: 2600e9, pe: 42.5, eps: 215.45, sector: 'Industrial', industry: 'Cement', exchange: 'NSE', country: 'IN' },
  'TECHM.NS': { symbol: 'TECHM.NS', name: 'Tech Mahindra Limited', marketCap: 1500e9, pe: 28.5, eps: 58.42, sector: 'Technology', industry: 'IT Services', exchange: 'NSE', country: 'IN' },
  'DRREDDY.NS': { symbol: 'DRREDDY.NS', name: "Dr. Reddy's Laboratories", marketCap: 1200e9, pe: 22.8, eps: 312.45, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NSE', country: 'IN' },
  'CIPLA.NS': { symbol: 'CIPLA.NS', name: 'Cipla Limited', marketCap: 1100e9, pe: 28.5, eps: 48.72, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NSE', country: 'IN' },
  'ADANIGREEN.NS': { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy', marketCap: 2800e9, pe: 245.8, eps: 7.25, sector: 'Energy', industry: 'Renewable Energy', exchange: 'NSE', country: 'IN' },
  'ADANIPORTS.NS': { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ', marketCap: 2600e9, pe: 32.5, eps: 42.18, sector: 'Industrial', industry: 'Ports', exchange: 'NSE', country: 'IN' },
  'JSWSTEEL.NS': { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Limited', marketCap: 2100e9, pe: 18.2, eps: 48.65, sector: 'Industrial', industry: 'Steel', exchange: 'NSE', country: 'IN' },
  'INDUSINDBK.NS': { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Limited', marketCap: 1100e9, pe: 12.5, eps: 118.42, sector: 'Finance', industry: 'Banking', exchange: 'NSE', country: 'IN' },
  'DIVISLAB.NS': { symbol: 'DIVISLAB.NS', name: "Divi's Laboratories", marketCap: 950e9, pe: 38.5, eps: 92.45, sector: 'Healthcare', industry: 'Pharmaceuticals', exchange: 'NSE', country: 'IN' },
  'GRASIM.NS': { symbol: 'GRASIM.NS', name: 'Grasim Industries', marketCap: 1500e9, pe: 18.8, eps: 125.72, sector: 'Industrial', industry: 'Diversified', exchange: 'NSE', country: 'IN' },
  'BAJAJFINSV.NS': { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Limited', marketCap: 2400e9, pe: 42.5, eps: 38.45, sector: 'Finance', industry: 'Financial Services', exchange: 'NSE', country: 'IN' },
  'APOLLOHOSP.NS': { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals', marketCap: 850e9, pe: 85.2, eps: 72.18, sector: 'Healthcare', industry: 'Hospitals', exchange: 'NSE', country: 'IN' },
  'COALINDIA.NS': { symbol: 'COALINDIA.NS', name: 'Coal India Limited', marketCap: 2800e9, pe: 8.5, eps: 52.45, sector: 'Energy', industry: 'Mining', exchange: 'NSE', country: 'IN' },
  'EICHERMOT.NS': { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Limited', marketCap: 1200e9, pe: 32.8, eps: 142.65, sector: 'Consumer', industry: 'Automobiles', exchange: 'NSE', country: 'IN' },
  'BRITANNIA.NS': { symbol: 'BRITANNIA.NS', name: 'Britannia Industries', marketCap: 1150e9, pe: 58.2, eps: 85.42, sector: 'Consumer', industry: 'FMCG', exchange: 'NSE', country: 'IN' },
  'NESTLEIND.NS': { symbol: 'NESTLEIND.NS', name: 'Nestle India Limited', marketCap: 2200e9, pe: 72.5, eps: 315.28, sector: 'Consumer', industry: 'FMCG', exchange: 'NSE', country: 'IN' },
}

// Combine all stocks
const allStocksBase = { ...usStocks, ...indianStocks }

// Generate realistic stock prices
function generateStockPrice(baseData: typeof allStocksBase[string]): StockQuote {
  const isIndian = baseData.country === 'IN'
  const basePrice = isIndian 
    ? (baseData.marketCap || 1000e9) / (isIndian ? 100e9 : 10e9)
    : (baseData.marketCap || 100e9) / 10e9
  
  const volatility = 0.03
  const changePercent = (Math.random() - 0.5) * 2 * volatility * 100
  const previousClose = basePrice * (0.95 + Math.random() * 0.1)
  const change = previousClose * (changePercent / 100)
  const price = previousClose + change
  const dayRange = previousClose * 0.02
  
  return {
    ...baseData,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    previousClose: Number(previousClose.toFixed(2)),
    open: Number((previousClose + (Math.random() - 0.5) * dayRange).toFixed(2)),
    high: Number((price + Math.random() * dayRange).toFixed(2)),
    low: Number((price - Math.random() * dayRange).toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    week52High: Number((price * 1.25).toFixed(2)),
    week52Low: Number((price * 0.75).toFixed(2)),
    avgVolume: Math.floor(Math.random() * 30000000) + 5000000,
  }
}

// Cache for real API and mock fallback data
let stockCache: Record<string, { stock: StockQuote; source: 'api' | 'mock'; fetchedAt: number }> = {}
const REAL_DATA_CACHE_DURATION = 60000 // 1 minute for real API data
const MOCK_DATA_CACHE_DURATION = 5000 // 5 seconds for mock fallback
let pendingRequests: Record<string, Promise<StockQuote | null>> = {} // Deduplication

function generateMockStockCache(): Record<string, StockQuote> {
  const cache: Record<string, StockQuote> = {}
  for (const [symbol, data] of Object.entries(allStocksBase)) {
    cache[symbol] = generateStockPrice(data)
  }
  return cache
}

function getStockCache(): Record<string, StockQuote> {
  const cache: Record<string, StockQuote> = {}
  for (const [symbol, entry] of Object.entries(stockCache)) {
    if (entry?.stock) {
      cache[symbol] = entry.stock
    }
  }
  return cache
}

function isCacheExpired(symbol: string): boolean {
  const entry = stockCache[symbol]
  if (!entry) return true
  
  const duration = entry.source === 'api' ? REAL_DATA_CACHE_DURATION : MOCK_DATA_CACHE_DURATION
  return Date.now() - entry.fetchedAt > duration
}

// Generate candlestick data
export function generateCandlestickData(
  symbol: string,
  range: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'
): CandlestickData[] {
  const stock = getStockCache()[symbol.toUpperCase()] || getStockCache()['AAPL']
  const basePrice = stock.previousClose
  
  const rangeConfig: Record<string, { points: number; interval: number }> = {
    '1D': { points: 78, interval: 5 }, // 5-minute intervals
    '1W': { points: 35, interval: 60 * 4 }, // 4-hour intervals
    '1M': { points: 22, interval: 60 * 24 }, // Daily
    '3M': { points: 65, interval: 60 * 24 }, // Daily
    '6M': { points: 130, interval: 60 * 24 }, // Daily
    '1Y': { points: 252, interval: 60 * 24 }, // Daily
    '5Y': { points: 260, interval: 60 * 24 * 5 }, // Weekly
  }
  
  const config = rangeConfig[range] || rangeConfig['1M']
  const data: CandlestickData[] = []
  let currentPrice = basePrice * (0.85 + Math.random() * 0.1)
  const now = new Date()
  
  for (let i = config.points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * config.interval * 60 * 1000)
    const volatility = 0.015
    const trend = (Math.random() - 0.48) * volatility * currentPrice
    
    const open = currentPrice
    const close = currentPrice + trend
    const highExtra = Math.random() * volatility * currentPrice
    const lowExtra = Math.random() * volatility * currentPrice
    const high = Math.max(open, close) + highExtra
    const low = Math.min(open, close) - lowExtra
    
    data.push({
      timestamp: date.toISOString(),
      date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 5000000,
    })
    
    currentPrice = close
  }
  
  return data
}

// Calculate Technical Indicators
export function calculateTechnicalIndicators(data: CandlestickData[]): TechnicalIndicators {
  const closes = data.map(d => d.close)
  
  // RSI (14-period)
  const rsi = calculateRSI(closes, 14)
  
  // MACD (12, 26, 9)
  const macd = calculateMACD(closes, 12, 26, 9)
  
  // SMAs
  const sma20 = calculateSMA(closes, 20)
  const sma50 = calculateSMA(closes, 50)
  
  // EMAs
  const ema12 = calculateEMA(closes, 12)
  const ema26 = calculateEMA(closes, 26)
  
  // Bollinger Bands (20-period, 2 std dev)
  const bollingerBands = calculateBollingerBands(closes, 20, 2)
  
  return { rsi, macd, sma20, sma50, ema12, ema26, bollingerBands }
}

function calculateRSI(prices: number[], period: number): number[] {
  const rsi: number[] = []
  let gains: number[] = []
  let losses: number[] = []
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
    
    if (i >= period) {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      rsi.push(Number((100 - 100 / (1 + rs)).toFixed(2)))
    } else {
      rsi.push(50)
    }
  }
  
  return rsi
}

function calculateMACD(prices: number[], fast: number, slow: number, signal: number): { macd: number; signal: number; histogram: number }[] {
  const emaFast = calculateEMA(prices, fast)
  const emaSlow = calculateEMA(prices, slow)
  const macdLine = emaFast.map((val, i) => val - emaSlow[i])
  const signalLine = calculateEMA(macdLine, signal)
  
  return macdLine.map((macd, i) => ({
    macd: Number(macd.toFixed(2)),
    signal: Number(signalLine[i].toFixed(2)),
    histogram: Number((macd - signalLine[i]).toFixed(2)),
  }))
}

function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i])
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(Number((sum / period).toFixed(2)))
    }
  }
  return sma
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[i])
    } else {
      ema.push(Number(((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]).toFixed(2)))
    }
  }
  
  return ema
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number): { upper: number; middle: number; lower: number }[] {
  const bands: { upper: number; middle: number; lower: number }[] = []
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      bands.push({ upper: prices[i], middle: prices[i], lower: prices[i] })
    } else {
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = slice.reduce((a, b) => a + b, 0) / period
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
      const std = Math.sqrt(variance)
      
      bands.push({
        upper: Number((mean + stdDev * std).toFixed(2)),
        middle: Number(mean.toFixed(2)),
        lower: Number((mean - stdDev * std).toFixed(2)),
      })
    }
  }
  
  return bands
}

// API Functions
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  // Ensure cache is initialized
  ensureCacheInitialized()
  
  const upperSymbol = symbol.toUpperCase()
  
  // 1. Check if we have fresh cache
  if (stockCache[upperSymbol] && !isCacheExpired(upperSymbol)) {
    return stockCache[upperSymbol].stock
  }
  
  // 2. Prevent duplicate simultaneous requests for same symbol
  if (upperSymbol in pendingRequests) {
    return pendingRequests[upperSymbol]
  }
  
  // 3. Create request promise
  const request = (async () => {
    try {
      // Try real API first (if key is valid)
      if (API_KEY && API_KEY !== 'demo') {
        console.log(`[API] Fetching real data for ${upperSymbol}...`)
        
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: upperSymbol,
            apikey: API_KEY,
          },
          timeout: 10000,
        })

        const data = response.data['Global Quote']
        
        if (data && Object.keys(data).length > 0 && data['05. price']) {
          const realQuote: StockQuote = {
            symbol: data['01. symbol'] || upperSymbol,
            name: data['01. symbol'] || upperSymbol,
            price: parseFloat(data['05. price']) || 0,
            change: parseFloat(data['09. change']) || 0,
            changePercent: parseFloat(data['10. change percent']?.replace('%', '') || '0'),
            high: parseFloat(data['03. high']) || 0,
            low: parseFloat(data['04. low']) || 0,
            open: parseFloat(data['02. open']) || 0,
            previousClose: parseFloat(data['08. previous close']) || 0,
            volume: parseInt(data['06. volume']) || 0,
            exchange: 'API',
            country: 'US',
          }
          
          console.log(`[API] ✓ Got real data for ${upperSymbol}: $${realQuote.price}`)
          
          // Cache real data
          stockCache[upperSymbol] = { stock: realQuote, source: 'api', fetchedAt: Date.now() }
          delete pendingRequests[upperSymbol]
          return realQuote
        }
      }
      
      // 4. Fallback to mock data if API unavailable or failed
      console.log(`[Fallback] Using mock data for ${upperSymbol}`)
      const mockCache = generateMockStockCache()[upperSymbol]
      
      if (mockCache) {
        stockCache[upperSymbol] = { stock: mockCache, source: 'mock', fetchedAt: Date.now() }
        delete pendingRequests[upperSymbol]
        return mockCache
      }
      
      delete pendingRequests[upperSymbol]
      return null
    } catch (error) {
      console.warn(`[Error] Failed to fetch ${upperSymbol}:`, error instanceof Error ? error.message : error)
      
      // Try mock fallback
      const mockCache = generateMockStockCache()[upperSymbol]
      if (mockCache) {
        stockCache[upperSymbol] = { stock: mockCache, source: 'mock', fetchedAt: Date.now() }
      }
      
      delete pendingRequests[upperSymbol]
      return mockCache || null
    }
  })()
  
  pendingRequests[upperSymbol] = request
  return request
}

export async function getStockHistory(
  symbol: string,
  range: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' = '1M'
): Promise<CandlestickData[]> {
  return generateCandlestickData(symbol, range)
}

export async function getTopGainers(limit = 10): Promise<StockQuote[]> {
  // Ensure cache is initialized (for consistency)
  ensureCacheInitialized()
  
  const cacheKeys = Object.keys(stockCache)
  console.log('[getTopGainers] Cache has', cacheKeys.length, 'entries')
  
  const cache = Object.values(stockCache)
    .filter(entry => entry?.stock)
    .map(entry => entry.stock)
  
  console.log('[getTopGainers] Extracted', cache.length, 'stocks')
  
  const result = cache
    .filter(stock => stock.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit)
    
  console.log('[getTopGainers] Returning', result.length, 'gainers')
  return result
}

export async function getTopLosers(limit = 10): Promise<StockQuote[]> {
  const cache = Object.values(stockCache)
    .filter(entry => entry?.stock)
    .map(entry => entry.stock)
  
  return cache
    .filter(stock => stock.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit)
}

export async function getMostActive(limit = 10): Promise<StockQuote[]> {
  const cache = Object.values(stockCache)
    .filter(entry => entry?.stock)
    .map(entry => entry.stock)
  
  return cache
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit)
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  if (!query.trim()) return []
  
  const upperQuery = query.toUpperCase()
  const cache = getStockCache()
  
  return Object.values(cache)
    .filter(stock =>
      stock.symbol.toUpperCase().includes(upperQuery) ||
      stock.name.toUpperCase().includes(upperQuery) ||
      stock.sector?.toUpperCase().includes(upperQuery) ||
      stock.industry?.toUpperCase().includes(upperQuery)
    )
    .slice(0, 20)
}

export function getAllStocks(): StockQuote[] {
  // Ensure cache is initialized
  ensureCacheInitialized()
  
  // Extract stocks from cache using same pattern as getTopGainers()
  const stocks = Object.values(stockCache)
    .filter(entry => entry?.stock)
    .map(entry => entry.stock)
  
  console.log('[getAllStocks] Returning', stocks.length, 'stocks')
  
  // Trigger background fetches for real data (non-blocking)
  if (stocks.length > 0) {
    stocks.slice(0, 20).forEach(stock => {
      // Trigger async fetch without awaiting
      if (!(stock.symbol in pendingRequests)) {
        getStockQuote(stock.symbol).catch(err => {
          // Silently fail - mock data will remain
        })
      }
    })
  }
  
  return stocks
}

export function getUSStocks(): StockQuote[] {
  const cache = getStockCache()
  return Object.values(cache).filter(s => s.country === 'US')
}

export function getIndianStocks(): StockQuote[] {
  const cache = getStockCache()
  return Object.values(cache).filter(s => s.country === 'IN')
}

export function getStocksByMarket(market: 'US' | 'IN' | 'ALL'): StockQuote[] {
  if (market === 'ALL') return getAllStocks()
  if (market === 'US') return getUSStocks()
  return getIndianStocks()
}

export function getStocksBySector(sector: string): StockQuote[] {
  const cache = getStockCache()
  return Object.values(cache).filter(s => 
    s.sector?.toLowerCase() === sector.toLowerCase()
  )
}

// Company Profile
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  const stock = await getStockQuote(symbol)
  if (!stock) return null
  
  return {
    symbol: stock.symbol,
    name: stock.name,
    description: `${stock.name} is a leading company in the ${stock.industry || 'industry'} sector. The company operates in the ${stock.sector || 'market'} industry and is traded on ${stock.exchange || 'major exchanges'}.`,
    exchange: stock.exchange || 'NYSE',
    sector: stock.sector || 'Technology',
    industry: stock.industry || 'Software',
    marketCap: stock.marketCap || 0,
    pe: stock.pe || 0,
    eps: stock.eps || 0,
    week52High: stock.week52High || stock.price * 1.2,
    week52Low: stock.week52Low || stock.price * 0.8,
    avgVolume: stock.avgVolume || stock.volume,
    dividend: stock.dividend || 0,
    dividendYield: stock.dividendYield || 0,
    employees: Math.floor(Math.random() * 200000) + 1000,
    headquarters: stock.country === 'IN' ? 'Mumbai, India' : 'United States',
    website: `https://www.${stock.symbol.toLowerCase().replace('.ns', '')}.com`,
    founded: `${1950 + Math.floor(Math.random() * 60)}`,
    ceo: 'Executive Leadership',
  }
}

// News
export const newsTemplates: Omit<NewsArticle, 'id' | 'publishedAt'>[] = [
  {
    title: 'Tech Giants Lead Market Rally Amid Strong Earnings',
    source: 'Financial Times',
    url: '#',
    summary: 'Major technology companies reported better-than-expected quarterly results, driving broader market gains.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
    sentiment: 'bullish',
    tickers: ['AAPL', 'MSFT', 'GOOGL'],
  },
  {
    title: 'Federal Reserve Maintains Interest Rate, Signals Future Cuts',
    source: 'Bloomberg',
    url: '#',
    summary: 'The Federal Reserve held interest rates steady but indicated potential cuts later this year as inflation moderates.',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=400&fit=crop',
    sentiment: 'bullish',
    tickers: ['JPM', 'BAC', 'GS'],
  },
  {
    title: 'AI Chip Demand Drives Semiconductor Surge',
    source: 'Reuters',
    url: '#',
    summary: 'Semiconductor stocks surge as artificial intelligence applications drive unprecedented chip demand.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    sentiment: 'bullish',
    tickers: ['NVDA', 'AMD', 'INTC'],
  },
  {
    title: 'Indian Markets Hit All-Time Highs on Foreign Inflows',
    source: 'Economic Times',
    url: '#',
    summary: 'Indian equity markets reached record levels as foreign institutional investors increased allocations to emerging markets.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=400&fit=crop',
    sentiment: 'bullish',
    tickers: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'],
  },
  {
    title: 'Oil Prices Decline on Supply Concerns',
    source: 'CNBC',
    url: '#',
    summary: 'Crude oil prices fell as concerns over global demand and increased production weighed on energy markets.',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=400&fit=crop',
    sentiment: 'bearish',
    tickers: ['XOM', 'CVX', 'COP'],
  },
  {
    title: 'Healthcare Sector Shows Resilience Amid Market Volatility',
    source: 'Wall Street Journal',
    url: '#',
    summary: 'Healthcare stocks outperform as investors seek defensive positions during uncertain market conditions.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
    sentiment: 'neutral',
    tickers: ['JNJ', 'UNH', 'PFE'],
  },
  {
    title: 'Electric Vehicle Sales Accelerate Globally',
    source: 'Automotive News',
    url: '#',
    summary: 'Global electric vehicle sales continue to grow as consumers embrace sustainable transportation options.',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=400&fit=crop',
    sentiment: 'bullish',
    tickers: ['TSLA', 'TATAMOTORS.NS'],
  },
  {
    title: 'Banking Sector Reports Strong Loan Growth',
    source: 'Mint',
    url: '#',
    summary: 'Major banks report robust credit growth driven by retail and corporate lending demand.',
    image: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&h=400&fit=crop',
    sentiment: 'bullish',
    tickers: ['HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS'],
  },
]

export async function getMarketNews(limit = 8): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`/api/news?limit=${limit}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to load market news')
    }

    return response.json()
  } catch (error) {
    console.warn('[getMarketNews] falling back to local news templates:', error)
    return newsTemplates.slice(0, limit).map((news, index) => ({
      ...news,
      id: `news-${index}`,
      publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
    }))
  }
}

export async function getStockNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `/api/news?query=${encodeURIComponent(symbol)}&limit=20`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('Failed to load stock news')
    }

    return (await response.json()) as NewsArticle[]
  } catch (error) {
    console.warn('[getStockNews] falling back to local stock news:', error)
    const allNews = newsTemplates.slice(0, 20).map((news, index) => ({
      ...news,
      id: `news-${index}`,
      publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
    }))

    return allNews.filter(news =>
      news.tickers?.some(t => t.toUpperCase() === symbol.toUpperCase())
    )
  }
}

// Portfolio Functions
export function calculatePortfolio(holdings: { symbol: string; shares: number; avgCost: number }[]): Portfolio {
  const cache = getStockCache()
  
  const portfolioHoldings: PortfolioHolding[] = holdings.map(h => {
    const stock = cache[h.symbol.toUpperCase()]
    if (!stock) {
      return {
        symbol: h.symbol,
        name: h.symbol,
        shares: h.shares,
        avgCost: h.avgCost,
        currentPrice: h.avgCost,
        totalValue: h.shares * h.avgCost,
        totalGain: 0,
        gainPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
      }
    }
    
    const totalValue = h.shares * stock.price
    const totalCost = h.shares * h.avgCost
    const totalGain = totalValue - totalCost
    const dayChange = h.shares * stock.change
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      shares: h.shares,
      avgCost: h.avgCost,
      currentPrice: stock.price,
      totalValue,
      totalGain,
      gainPercent: (totalGain / totalCost) * 100,
      dayChange,
      dayChangePercent: stock.changePercent,
    }
  })
  
  const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.totalValue, 0)
  const totalCost = portfolioHoldings.reduce((sum, h) => sum + h.shares * h.avgCost, 0)
  const totalGain = totalValue - totalCost
  const dayChange = portfolioHoldings.reduce((sum, h) => sum + h.dayChange, 0)
  
  return {
    holdings: portfolioHoldings,
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
    dayChange,
    dayChangePercent: totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0,
  }
}

// Formatting utilities
export function formatCurrency(value: number, currency: 'USD' | 'INR' = 'USD'): string {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toLocaleString()
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatVolume(value: number): string {
  return formatNumber(value)
}

// Market status
export function getMarketStatus(): { us: boolean; india: boolean; usLabel: string; indiaLabel: string } {
  const now = new Date()
  const utcHours = now.getUTCHours()
  const utcMinutes = now.getUTCMinutes()
  const utcTime = utcHours * 60 + utcMinutes
  const dayOfWeek = now.getUTCDay()
  
  // US Market: 9:30 AM - 4:00 PM ET (13:30 - 20:00 UTC)
  const usOpen = dayOfWeek >= 1 && dayOfWeek <= 5 && utcTime >= 13 * 60 + 30 && utcTime < 20 * 60
  
  // India Market: 9:15 AM - 3:30 PM IST (3:45 - 10:00 UTC)
  const indiaOpen = dayOfWeek >= 1 && dayOfWeek <= 5 && utcTime >= 3 * 60 + 45 && utcTime < 10 * 60
  
  return {
    us: usOpen,
    india: indiaOpen,
    usLabel: usOpen ? 'Market Open' : 'Market Closed',
    indiaLabel: indiaOpen ? 'Market Open' : 'Market Closed',
  }
}

// Initialize cache on module load (works on both server and client)
let cacheInitialized = false

function ensureCacheInitialized() {
  if (cacheInitialized) return
  
  console.log('[Init] Initializing stock cache with mock data...')
  const mockData = generateMockStockCache()
  console.log('[Init] Generated mock data:', Object.keys(mockData).length, 'stocks')
  
  for (const [symbol, stock] of Object.entries(mockData)) {
    if (!stockCache[symbol]) {
      stockCache[symbol] = { stock, source: 'mock', fetchedAt: Date.now() }
    }
  }
  cacheInitialized = true
  console.log(`[Init] Cache initialized with ${Object.keys(stockCache).length} stocks in stockCache`)
}

// Call initialization immediately
ensureCacheInitialized()
