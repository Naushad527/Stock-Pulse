'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react'
import { StockQuote, formatCurrency, formatPercent } from '@/lib/api'
import { useWatchlist } from '@/hooks/use-watchlist'

interface StockCardProps {
  stock: StockQuote
  variant?: 'default' | 'compact' | 'detailed'
  showWatchlist?: boolean
}

export function StockCard({ stock, variant = 'default', showWatchlist = true }: StockCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoaded } = useWatchlist()
  const isGain = stock.changePercent >= 0
  const inWatchlist = isLoaded && isInWatchlist(stock.symbol)
  const currency = stock.country === 'IN' ? 'INR' : 'USD'

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWatchlist) {
      removeFromWatchlist(stock.symbol)
    } else {
      addToWatchlist(stock.symbol)
    }
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/stock/${stock.symbol}`}
        className="group flex items-center justify-between rounded-xl p-3 transition-all hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ${
            isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
          }`}>
            {stock.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-foreground group-hover:text-primary">
              {stock.symbol.replace('.NS', '')}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stock.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-foreground">
            {formatCurrency(stock.price, currency)}
          </p>
          <p className={`text-sm font-medium ${isGain ? 'text-gain' : 'text-loss'}`}>
            {formatPercent(stock.changePercent)}
          </p>
        </div>
      </Link>
    )
  }

  if (variant === 'detailed') {
    return (
      <Link
        href={`/stock/${stock.symbol}`}
        className={`glass-card group relative block rounded-2xl p-5 transition-all hover:shadow-lg ${
          isGain ? 'hover:glow-gain' : 'hover:glow-loss'
        }`}
      >
        {showWatchlist && isLoaded && (
          <button
            onClick={toggleWatchlist}
            className="absolute right-4 top-4 z-10 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {inWatchlist ? (
              <Star className="h-5 w-5 fill-primary text-primary" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </button>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold ${
              isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
            }`}>
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground group-hover:text-primary">
                {stock.symbol.replace('.NS', '')}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {stock.name}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(stock.price, currency)}
            </p>
            <div className={`mt-1 flex items-center gap-1 ${isGain ? 'text-gain' : 'text-loss'}`}>
              {isGain ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isGain ? '+' : ''}{formatCurrency(stock.change, currency)} ({formatPercent(stock.changePercent)})
              </span>
            </div>
          </div>
          {stock.sector && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {stock.sector}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="font-medium text-foreground">
              {formatCurrency(stock.open, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High</p>
            <p className="font-medium text-foreground">
              {formatCurrency(stock.high, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="font-medium text-foreground">
              {formatCurrency(stock.low, currency)}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={`/stock/${stock.symbol}`}
      className={`glass-card group relative block rounded-2xl p-4 transition-all hover:shadow-lg ${
        isGain ? 'hover:glow-gain' : 'hover:glow-loss'
      }`}
    >
      {showWatchlist && isLoaded && (
        <button
          onClick={toggleWatchlist}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {inWatchlist ? (
            <Star className="h-4 w-4 fill-primary text-primary" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ${
          isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
        }`}>
          {stock.symbol.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground group-hover:text-primary">
            {stock.symbol.replace('.NS', '')}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {stock.name}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-lg font-bold text-foreground">
          {formatCurrency(stock.price, currency)}
        </p>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${
          isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
        }`}>
          {isGain ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {formatPercent(stock.changePercent)}
        </div>
      </div>
    </Link>
  )
}
