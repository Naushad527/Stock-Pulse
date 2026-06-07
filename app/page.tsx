'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { BarChart3, TrendingUp, Newspaper, Filter } from 'lucide-react'
import { MarketMovers } from '@/components/market-movers'
import { NewsPreview } from '@/components/news-card'
import { WatchlistPanel } from '@/components/watchlist-panel'
import { MarketSentiment } from '@/components/market-sentiment'
import { RecentlyViewed } from '@/components/recently-viewed'
import { StockCard } from '@/components/stock-card'
import { getAllStocks, getStockQuote, StockQuote } from '@/lib/api'

type SortBy = 'name' | 'price' | 'change' | 'marketCap'

const sectors = ['All', 'Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Industrial', 'Communications']

export default function HomePage() {
  const [sector, setSector] = useState('All')
  const [sortBy, setSortBy] = useState<SortBy>('marketCap')
  const [showFilters, setShowFilters] = useState(false)

  const { data: allStocks, isLoading } = useSWR(
  ['stocks', 'ALL'],
  async () => {
  const stocks = await getAllStocks()

  await Promise.all(
    stocks
      .filter((s) => s.country === 'IN')
      .map((s) => getStockQuote(s.symbol))
  )

  return await getAllStocks()
},
  {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  }
)

  const filteredStocks = allStocks
    ?.filter((stock) => sector === 'All' || stock.sector === sector)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return b.price - a.price
        case 'change':
          return b.changePercent - a.changePercent
        case 'marketCap':
          return (b.marketCap || 0) - (a.marketCap || 0)
        default:
          return 0
      }
    }) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary glow-primary">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="rounded-full bg-gain/10 px-3 py-1 text-sm font-medium text-gain">
                  Live Data
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Stock Market Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Track 100+ US and Indian stocks with real-time prices, advanced charts, and technical indicators.
              </p>
            </div>

            {/* Market Selector */}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Recently Viewed */}
        <div className="mb-8">
          <RecentlyViewed />
        </div>

        {/* Market Movers */}
        <div className="mb-8">
          <MarketMovers />
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* All Stocks Section */}
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">All Stocks</h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredStocks.length} stocks
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    showFilters
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mb-6 flex flex-wrap gap-4 rounded-xl bg-muted/30 p-4">
                  {/* Sector Filter */}
                  <div className="flex-1 min-w-48">
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Sector
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    >
                      {sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex-1 min-w-48">
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="marketCap">Market Cap</option>
                      <option value="price">Price</option>
                      <option value="change">Change %</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Stock Grid */}
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredStocks.slice(0, 20).map((stock) => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              )}

              {filteredStocks.length > 20 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 20 of {filteredStocks.length} stocks. Use filters to narrow down results.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Market Sentiment */}
            <MarketSentiment />

            {/* Watchlist */}
            <WatchlistPanel />

            {/* News Preview */}
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Latest News</h2>
              </div>
              <NewsPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
