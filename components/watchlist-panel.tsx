'use client'

import Link from 'next/link'
import { Star, TrendingUp, TrendingDown, X } from 'lucide-react'
import useSWR from 'swr'
import { useWatchlist } from '@/hooks/use-watchlist'
import { getStockQuote, formatCurrency, formatPercent } from '@/lib/api'

export function WatchlistPanel() {
  const { watchlist, removeFromWatchlist, isLoaded } = useWatchlist()

  if (!isLoaded) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-foreground">Watchlist</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-lg font-semibold text-foreground">Watchlist</h2>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {watchlist.length}
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="py-8 text-center">
          <Star className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Your watchlist is empty
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add stocks to track them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map((symbol) => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              onRemove={() => removeFromWatchlist(symbol)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface WatchlistItemProps {
  symbol: string
  onRemove: () => void
}

function WatchlistItem({ symbol, onRemove }: WatchlistItemProps) {
  const { data: stock, isLoading } = useSWR(
    ['stock-quote', symbol],
    () => getStockQuote(symbol),
    { revalidateOnFocus: false }
  )

  if (isLoading) {
    return <div className="h-16 animate-pulse rounded-lg bg-muted" />
  }

  if (!stock) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
        <span className="font-medium text-muted-foreground">{symbol}</span>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const isGain = stock.changePercent >= 0

  return (
    <div className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted">
      <Link
        href={`/stock/${stock.symbol}`}
        className="flex flex-1 items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground">
          {stock.symbol.slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
            {stock.symbol}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {stock.name}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-medium text-foreground">
            {formatCurrency(stock.price)}
          </p>
          <div
            className={`flex items-center justify-end gap-1 text-xs font-medium ${
              isGain ? 'text-gain' : 'text-loss'
            }`}
          >
            {isGain ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {formatPercent(stock.changePercent)}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            onRemove()
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
          aria-label="Remove from watchlist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
