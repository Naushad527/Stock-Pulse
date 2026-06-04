'use client'

import { Star } from 'lucide-react'
import useSWR from 'swr'
import { useWatchlist } from '@/hooks/use-watchlist'
import { getStockQuote } from '@/lib/api'
import { StockCard } from '@/components/stock-card'
import Link from 'next/link'

export default function WatchlistPage() {
  const { watchlist, isLoaded } = useWatchlist()

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Watchlist</h1>
          <p className="mt-2 text-muted-foreground">
            Track your favorite stocks in one place
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Watchlist</h1>
            <p className="mt-1 text-muted-foreground">
              {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Star className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            Your watchlist is empty
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start adding stocks to track them here
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Stocks
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {watchlist.map((symbol) => (
            <WatchlistStockCard key={symbol} symbol={symbol} />
          ))}
        </div>
      )}
    </div>
  )
}

function WatchlistStockCard({ symbol }: { symbol: string }) {
  const { data: stock, isLoading } = useSWR(
    ['stock-quote', symbol],
    () => getStockQuote(symbol),
    { revalidateOnFocus: false }
  )

  if (isLoading || !stock) {
    return <div className="h-40 animate-pulse rounded-xl bg-card" />
  }

  return <StockCard stock={stock} showWatchlist={true} />
}
