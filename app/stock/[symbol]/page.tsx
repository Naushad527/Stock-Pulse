'use client'

import { useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
  Building2,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUpDown,
  Globe,
  Users,
  Calendar,
  Briefcase,
  PieChart,
  Target,
  Plus,
} from 'lucide-react'
import useSWR from 'swr'
import { getStockQuote, getCompanyProfile, formatCurrency, formatPercent, formatNumber } from '@/lib/api'
import { CandlestickChart } from '@/components/candlestick-chart'
import { useWatchlist } from '@/hooks/use-watchlist'
import { useRecentlyViewed } from '@/hooks/use-recently-viewed'
import { usePortfolio } from '@/hooks/use-portfolio'

interface StockPageProps {
  params: Promise<{ symbol: string }>
}

export default function StockPage({ params }: StockPageProps) {
  const resolvedParams = use(params)
  const symbol = resolvedParams.symbol.toUpperCase()

  const { addToRecentlyViewed } = useRecentlyViewed()
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoaded: watchlistLoaded } = useWatchlist()
  const { isInPortfolio, addToPortfolio, isLoaded: portfolioLoaded } = usePortfolio()

  const {
    data: stock,
    isLoading,
    error,
  } = useSWR(['stock-quote', symbol], () => getStockQuote(symbol), {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  })

  const { data: profile } = useSWR(
    stock ? ['company-profile', symbol] : null,
    () => getCompanyProfile(symbol),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (stock) {
      addToRecentlyViewed(symbol)
    }
  }, [stock, symbol, addToRecentlyViewed])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Market
            </Link>
          </div>
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-2xl bg-muted/50" />
            <div className="h-[500px] animate-pulse rounded-2xl bg-muted/50" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!stock && !isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Unable to load stock</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The stock symbol <span className="font-semibold text-foreground">{symbol}</span> could not be loaded. It may not exist or the data service is unavailable.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Market
          </Link>
        </div>
      </div>
    )
  }

  if (!stock) {
    return null
  }

  const isGain = stock.changePercent >= 0
  const inWatchlist = watchlistLoaded && isInWatchlist(stock.symbol)
  const inPortfolio = portfolioLoaded && isInPortfolio(stock.symbol)
  const currency = stock.country === 'IN' ? 'INR' : 'USD'

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(stock.symbol)
    } else {
      addToWatchlist(stock.symbol)
    }
  }

  const addCurrentStockToPortfolio = () => {
    if (!inPortfolio) {
      addToPortfolio(stock.symbol, 1, stock.price)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Market
            </Link>
          </div>

          {/* Stock Header */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold ${
                isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
              }`}>
                {stock.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">
                    {stock.symbol.replace('.NS', '')}
                  </h1>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                    {stock.exchange || (stock.country === 'IN' ? 'NSE' : 'NASDAQ')}
                  </span>
                </div>
                <p className="mt-1 text-lg text-muted-foreground">{stock.name}</p>
                {stock.sector && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {stock.sector}
                    </span>
                    {stock.industry && (
                      <span className="text-sm text-muted-foreground">
                        {stock.industry}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground">
                  {formatCurrency(stock.price, currency)}
                </p>
                <div className={`mt-1 flex items-center justify-end gap-2 text-lg font-semibold ${
                  isGain ? 'text-gain' : 'text-loss'
                }`}>
                  {isGain ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span>
                    {isGain ? '+' : ''}{formatCurrency(stock.change, currency)} ({formatPercent(stock.changePercent)})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {watchlistLoaded && (
                  <button
                    onClick={toggleWatchlist}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      inWatchlist
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {inWatchlist ? (
                      <>
                        <Star className="h-4 w-4 fill-current" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <StarOff className="h-4 w-4" />
                        Add to Watchlist
                      </>
                    )}
                  </button>
                )}
                {portfolioLoaded && (
                  inPortfolio ? (
                    <Link
                      href="/portfolio"
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-gain/10 text-gain transition-all hover:bg-gain/20"
                    >
                      <Briefcase className="h-4 w-4" />
                      View Portfolio
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={addCurrentStockToPortfolio}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Portfolio
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Chart */}
        <div className="mb-8">
          <CandlestickChart symbol={stock.symbol} currency={currency} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Key Stats */}
          <div className="space-y-6 lg:col-span-2">
            {/* Trading Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Trading Statistics</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={ArrowUpDown}
                  label="Day Range"
                  value={`${formatCurrency(stock.low, currency)} - ${formatCurrency(stock.high, currency)}`}
                />
                <StatCard
                  icon={DollarSign}
                  label="Open"
                  value={formatCurrency(stock.open, currency)}
                />
                <StatCard
                  icon={Activity}
                  label="Prev Close"
                  value={formatCurrency(stock.previousClose, currency)}
                />
                <StatCard
                  icon={BarChart3}
                  label="Volume"
                  value={formatNumber(stock.volume)}
                />
              </div>
            </div>

            {/* Fundamentals */}
            {(stock.marketCap || stock.pe || stock.eps) && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Fundamentals</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stock.marketCap && (
                    <StatCard
                      icon={Building2}
                      label="Market Cap"
                      value={formatNumber(stock.marketCap)}
                    />
                  )}
                  {stock.pe && (
                    <StatCard
                      icon={PieChart}
                      label="P/E Ratio"
                      value={stock.pe.toFixed(2)}
                    />
                  )}
                  {stock.eps && (
                    <StatCard
                      icon={Target}
                      label="EPS"
                      value={formatCurrency(stock.eps, currency)}
                    />
                  )}
                  {stock.week52High && stock.week52Low && (
                    <StatCard
                      icon={Calendar}
                      label="52W Range"
                      value={`${formatCurrency(stock.week52Low, currency)} - ${formatCurrency(stock.week52High, currency)}`}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Company Profile */}
            {profile && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">About {profile.name}</h2>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {profile.description}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.headquarters && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Headquarters</p>
                        <p className="font-medium text-foreground">{profile.headquarters}</p>
                      </div>
                    </div>
                  )}
                  {profile.employees && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Employees</p>
                        <p className="font-medium text-foreground">{profile.employees.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {profile.founded && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Founded</p>
                        <p className="font-medium text-foreground">{profile.founded}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Price Performance */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Price Performance</h3>
              <div className="space-y-4">
                <PriceBar
                  label="Today"
                  current={stock.price}
                  low={stock.low}
                  high={stock.high}
                  isGain={isGain}
                />
                {stock.week52Low && stock.week52High && (
                  <PriceBar
                    label="52 Week"
                    current={stock.price}
                    low={stock.week52Low}
                    high={stock.week52High}
                    isGain={stock.price > (stock.week52Low + stock.week52High) / 2}
                  />
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Key Metrics</h3>
              <div className="space-y-3">
                {stock.avgVolume && (
                  <MetricRow label="Avg Volume" value={formatNumber(stock.avgVolume)} />
                )}
                {stock.dividend !== undefined && stock.dividend > 0 && (
                  <MetricRow label="Dividend" value={formatCurrency(stock.dividend, currency)} />
                )}
                {stock.dividendYield !== undefined && stock.dividendYield > 0 && (
                  <MetricRow label="Dividend Yield" value={`${stock.dividendYield.toFixed(2)}%`} />
                )}
                <MetricRow label="Exchange" value={stock.exchange || (stock.country === 'IN' ? 'NSE' : 'NASDAQ')} />
                <MetricRow label="Country" value={stock.country === 'IN' ? 'India' : 'United States'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: typeof TrendingUp
  label: string
  value: string
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

interface PriceBarProps {
  label: string
  current: number
  low: number
  high: number
  isGain: boolean
}

function PriceBar({ label, current, low, high, isGain }: PriceBarProps) {
  const range = high - low
  const position = range > 0 ? ((current - low) / range) * 100 : 50

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isGain ? 'text-gain' : 'text-loss'}`}>
          {position.toFixed(0)}%
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${isGain ? 'bg-gain' : 'bg-loss'}`}
          style={{ width: `${Math.min(Math.max(position, 0), 100)}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `${Math.min(Math.max(position, 0), 100)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{low.toFixed(2)}</span>
        <span>{high.toFixed(2)}</span>
      </div>
    </div>
  )
}

interface MetricRowProps {
  label: string
  value: string
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
