'use client'

import Link from 'next/link'
import { Clock, TrendingUp, TrendingDown, X } from 'lucide-react'
import useSWR from 'swr'
import { useRecentlyViewed } from '@/hooks/use-recently-viewed'
import { getStockQuote, formatCurrency, formatPercent } from '@/lib/api'

export function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed, isLoaded } = useRecentlyViewed()

  if (!isLoaded) {
    return null
  }

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Recently Viewed</h2>
        </div>
        <button
          onClick={clearRecentlyViewed}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {recentlyViewed.slice(0, 6).map((symbol) => (
          <RecentItem key={symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  )
}

function RecentItem({ symbol }: { symbol: string }) {
  const { data: stock } = useSWR(
    ['stock-quote', symbol],
    () => getStockQuote(symbol),
    { revalidateOnFocus: false }
  )

  if (!stock) {
    return (
      <Link
        href={`/stock/${symbol}`}
        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
      >
        {symbol}
      </Link>
    )
  }

  const isGain = stock.changePercent >= 0

  return (
    <Link
      href={`/stock/${symbol}`}
      className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm transition-colors hover:bg-muted/80"
    >
      <span className="font-medium text-foreground">{symbol}</span>
      <span
        className={`flex items-center gap-0.5 text-xs font-medium ${
          isGain ? 'text-gain' : 'text-loss'
        }`}
      >
        {isGain ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {formatPercent(stock.changePercent)}
      </span>
    </Link>
  )
}
