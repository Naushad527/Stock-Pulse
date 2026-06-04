'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { getTopGainers, getTopLosers, formatCurrency, formatPercent } from '@/lib/api'

export function MarketOverview() {
  const { data: gainers, isLoading: gainersLoading } = useSWR(
    'top-gainers',
    getTopGainers,
    { revalidateOnFocus: false }
  )

  const { data: losers, isLoading: losersLoading } = useSWR(
    'top-losers',
    getTopLosers,
    { revalidateOnFocus: false }
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Gainers */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gain/10">
            <TrendingUp className="h-4 w-4 text-gain" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Top Gainers</h2>
        </div>

        {gainersLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {gainers?.map((stock, index) => (
              <Link
                key={stock.symbol}
                href={`/stock/${stock.symbol}`}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {stock.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatCurrency(stock.price)}
                  </p>
                  <p className="text-sm font-medium text-gain">
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Top Losers */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-loss/10">
            <TrendingDown className="h-4 w-4 text-loss" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Top Losers</h2>
        </div>

        {losersLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {losers?.map((stock, index) => (
              <Link
                key={stock.symbol}
                href={`/stock/${stock.symbol}`}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {stock.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatCurrency(stock.price)}
                  </p>
                  <p className="text-sm font-medium text-loss">
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
