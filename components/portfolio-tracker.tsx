'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  PieChart,
  DollarSign,
  Percent,
  X,
} from 'lucide-react'
import useSWR from 'swr'
import { usePortfolio } from '@/hooks/use-portfolio'
import {
  calculatePortfolio,
  formatCurrency,
  formatPercent,
  searchStocks,
  StockQuote,
} from '@/lib/api'

interface AddHoldingModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (symbol: string, shares: number, avgCost: number) => void
}

function AddHoldingModal({ isOpen, onClose, onAdd }: AddHoldingModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null)
  const [shares, setShares] = useState('')
  const [avgCost, setAvgCost] = useState('')

  const { data: searchResults } = useSWR(
    searchQuery.length >= 1 ? ['search', searchQuery] : null,
    () => searchStocks(searchQuery),
    { revalidateOnFocus: false }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStock && shares && avgCost) {
      onAdd(selectedStock.symbol, parseFloat(shares), parseFloat(avgCost))
      setSearchQuery('')
      setSelectedStock(null)
      setShares('')
      setAvgCost('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Holding</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock Search */}
          <div className="relative">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Stock
            </label>
            {selectedStock ? (
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{selectedStock.symbol}</p>
                  <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedStock(stock)
                          setSearchQuery('')
                          if (!avgCost) setAvgCost(stock.price.toString())
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted"
                      >
                        <div>
                          <p className="font-medium text-foreground">{stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                        </div>
                        <span className="text-sm text-foreground">
                          {formatCurrency(stock.price, stock.country === 'IN' ? 'INR' : 'USD')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Shares */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Number of Shares
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              min="0"
              step="0.001"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Average Cost */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Average Cost per Share
            </label>
            <input
              type="number"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Preview */}
          {selectedStock && shares && avgCost && (
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(
                  parseFloat(shares) * parseFloat(avgCost),
                  selectedStock.country === 'IN' ? 'INR' : 'USD'
                )}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStock || !shares || !avgCost}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Add Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PortfolioTracker() {
  const { portfolio, removeFromPortfolio, isLoaded } = usePortfolio()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToPortfolio } = usePortfolio()

  const portfolioData = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return null
    return calculatePortfolio(portfolio)
  }, [portfolio])

  if (!isLoaded) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!portfolioData || portfolioData.holdings.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <PieChart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No Holdings Yet
          </h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Start building your portfolio by adding your first stock holding.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Add Holding
          </button>
        </div>

        <AddHoldingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addToPortfolio}
        />
      </div>
    )
  }

  const isGain = portfolioData.totalGain >= 0

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(portfolioData.totalValue)}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Holding
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Cost</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(portfolioData.totalCost)}
            </p>
          </div>

          <div className={`rounded-xl p-4 ${isGain ? 'gradient-gain' : 'gradient-loss'}`}>
            <div className="mb-2 flex items-center gap-2">
              {isGain ? (
                <TrendingUp className="h-4 w-4 text-gain" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
              <span className="text-sm text-muted-foreground">Total Gain/Loss</span>
            </div>
            <p className={`text-lg font-semibold ${isGain ? 'text-gain' : 'text-loss'}`}>
              {isGain ? '+' : ''}{formatCurrency(portfolioData.totalGain)}
            </p>
          </div>

          <div className={`rounded-xl p-4 ${isGain ? 'gradient-gain' : 'gradient-loss'}`}>
            <div className="mb-2 flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Return</span>
            </div>
            <p className={`text-lg font-semibold ${isGain ? 'text-gain' : 'text-loss'}`}>
              {formatPercent(portfolioData.totalGainPercent)}
            </p>
          </div>

          <div className={`rounded-xl p-4 ${portfolioData.dayChange >= 0 ? 'gradient-gain' : 'gradient-loss'}`}>
            <div className="mb-2 flex items-center gap-2">
              {portfolioData.dayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-gain" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
              <span className="text-sm text-muted-foreground">{"Today's"} Change</span>
            </div>
            <p className={`text-lg font-semibold ${portfolioData.dayChange >= 0 ? 'text-gain' : 'text-loss'}`}>
              {portfolioData.dayChange >= 0 ? '+' : ''}{formatCurrency(portfolioData.dayChange)}
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Shares
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {portfolioData.holdings.map((holding) => {
                const holdingGain = holding.totalGain >= 0
                return (
                  <tr key={holding.symbol} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <Link
                        href={`/stock/${holding.symbol}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                          {holding.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary">
                            {holding.symbol}
                          </p>
                          <p className="text-sm text-muted-foreground">{holding.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      {holding.shares.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {formatCurrency(holding.avgCost)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(holding.currentPrice)}
                      </p>
                      <p className={`text-sm ${holding.dayChangePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {formatPercent(holding.dayChangePercent)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      {formatCurrency(holding.totalValue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-medium ${holdingGain ? 'text-gain' : 'text-loss'}`}>
                        {holdingGain ? '+' : ''}{formatCurrency(holding.totalGain)}
                      </p>
                      <p className={`text-sm ${holdingGain ? 'text-gain' : 'text-loss'}`}>
                        {formatPercent(holding.gainPercent)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeFromPortfolio(holding.symbol)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Remove holding"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addToPortfolio}
      />
    </div>
  )
}
