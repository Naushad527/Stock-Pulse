'use client'

import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import useSWR from 'swr'
import { getAllStocks } from '@/lib/api'

export function MarketSentiment() {
  const { data: stocks } = useSWR('all-stocks', () => getAllStocks(), {
    revalidateOnFocus: false,
  })

  if (!stocks) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Market Sentiment</h2>
        </div>
        <div className="mt-4 h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  const gainers = stocks.filter((s) => s.changePercent > 0).length
  const losers = stocks.filter((s) => s.changePercent < 0).length
  const neutral = stocks.filter((s) => s.changePercent === 0).length
  const total = stocks.length

  const gainPercent = (gainers / total) * 100
  const lossPercent = (losers / total) * 100

  let sentiment: 'Bullish' | 'Bearish' | 'Neutral'
  let sentimentColor: string
  let SentimentIcon: typeof TrendingUp

  if (gainPercent > 60) {
    sentiment = 'Bullish'
    sentimentColor = 'text-gain'
    SentimentIcon = TrendingUp
  } else if (lossPercent > 60) {
    sentiment = 'Bearish'
    sentimentColor = 'text-loss'
    SentimentIcon = TrendingDown
  } else {
    sentiment = 'Neutral'
    sentimentColor = 'text-muted-foreground'
    SentimentIcon = Minus
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Gauge className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Market Sentiment</h2>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <SentimentIcon className={`h-8 w-8 ${sentimentColor}`} />
        <span className={`text-2xl font-bold ${sentimentColor}`}>
          {sentiment}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="bg-gain transition-all"
            style={{ width: `${gainPercent}%` }}
          />
          <div
            className="bg-muted-foreground transition-all"
            style={{ width: `${(neutral / total) * 100}%` }}
          />
          <div
            className="bg-loss transition-all"
            style={{ width: `${lossPercent}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-gain" />
            <span className="text-muted-foreground">
              Gainers: <span className="font-medium text-foreground">{gainers}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-loss" />
            <span className="text-muted-foreground">
              Losers: <span className="font-medium text-foreground">{losers}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
