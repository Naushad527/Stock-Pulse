'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { TrendingUp, TrendingDown, Activity, Flame } from 'lucide-react'
import { StockCard } from './stock-card'
import {
  getTopGainers,
  getTopLosers,
  getMostActive,
  getUSStocks,
  getIndianStocks,
  StockQuote,
} from '@/lib/api'

type Market = 'US' | 'IN'
type Tab = 'gainers' | 'losers' | 'active'

export function MarketMovers() {
  const [market, setMarket] = useState<Market>('US')
  const [activeTab, setActiveTab] = useState<Tab>('gainers')

  const { data: gainers, isLoading: gainersLoading } = useSWR(
    ['top-gainers'],
    () => getTopGainers(20),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  )

  const { data: losers, isLoading: losersLoading } = useSWR(
    ['top-losers'],
    () => getTopLosers(20),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  )

  const { data: active, isLoading: activeLoading } = useSWR(
    ['most-active'],
    () => getMostActive(20),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  )

  const filterByMarket = (stocks: StockQuote[] | undefined): StockQuote[] => {
    if (!stocks) return []
    return stocks.filter((s) =>
      market === 'US' ? s.country === 'US' : s.country === 'IN'
    ).slice(0, 8)
  }

  const getCurrentData = (): { stocks: StockQuote[]; isLoading: boolean } => {
    switch (activeTab) {
      case 'gainers':
        return { stocks: filterByMarket(gainers), isLoading: gainersLoading }
      case 'losers':
        return { stocks: filterByMarket(losers), isLoading: losersLoading }
      case 'active':
        return { stocks: filterByMarket(active), isLoading: activeLoading }
    }
  }

  const { stocks, isLoading } = getCurrentData()

  const tabs = [
    { id: 'gainers' as Tab, label: 'Top Gainers', icon: TrendingUp, color: 'text-gain' },
    { id: 'losers' as Tab, label: 'Top Losers', icon: TrendingDown, color: 'text-loss' },
    { id: 'active' as Tab, label: 'Most Active', icon: Activity, color: 'text-primary' },
  ]

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Market Movers</h2>
        </div>

        {/* Market Selector */}
        <div className="flex rounded-xl bg-muted/50 p-1">
          {(['US', 'IN'] as Market[]).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                market === m
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'US' ? 'US Stocks' : 'Indian Stocks'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? `bg-muted ${tab.color}`
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : stocks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} variant="default" />
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          No stocks found for this market
        </div>
      )}
    </div>
  )
}
