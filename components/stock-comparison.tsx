'use client'

import { useState } from 'react'
import { Plus, X, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import useSWR from 'swr'
import {
  getAllStocks,
  getStockQuote,
  StockQuote,
  formatCurrency,
  formatPercent,
  formatNumber,
} from '@/lib/api'

export function StockComparison() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  const allStocks = getAllStocks()

  const addStock = (symbol: string) => {
    if (!selectedStocks.includes(symbol) && selectedStocks.length < 4) {
      setSelectedStocks([...selectedStocks, symbol])
    }
    setIsSelectOpen(false)
  }

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter((s) => s !== symbol))
  }

  const availableStocks = allStocks.filter(
    (s) => !selectedStocks.includes(s.symbol)
  )

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Compare Stocks</h2>
      </div>

      {/* Selected Stocks */}
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedStocks.map((symbol) => (
          <div
            key={symbol}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
          >
            {symbol}
            <button
              onClick={() => removeStock(symbol)}
              className="hover:text-primary/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {selectedStocks.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Add stock
            </button>

            {isSelectOpen && (
              <div className="absolute top-full left-0 z-10 mt-2 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-xl">
                {availableStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => addStock(stock.symbol)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span className="font-medium text-foreground">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(stock.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedStocks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">
                  Metric
                </th>
                {selectedStocks.map((symbol) => (
                  <th
                    key={symbol}
                    className="pb-3 text-right font-medium text-foreground"
                  >
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Price"
                stocks={selectedStocks}
                getValue={(s) => formatCurrency(s.price)}
              />
              <ComparisonRow
                label="Change"
                stocks={selectedStocks}
                getValue={(s) => formatPercent(s.changePercent)}
                getColor={(s) => (s.changePercent >= 0 ? 'text-gain' : 'text-loss')}
              />
              <ComparisonRow
                label="Day High"
                stocks={selectedStocks}
                getValue={(s) => formatCurrency(s.high)}
              />
              <ComparisonRow
                label="Day Low"
                stocks={selectedStocks}
                getValue={(s) => formatCurrency(s.low)}
              />
              <ComparisonRow
                label="Volume"
                stocks={selectedStocks}
                getValue={(s) => formatNumber(s.volume)}
              />
              <ComparisonRow
                label="Market Cap"
                stocks={selectedStocks}
                getValue={(s) =>
                  s.marketCap ? formatNumber(s.marketCap) : 'N/A'
                }
              />
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <Scale className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Select stocks to compare
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add up to 4 stocks for side-by-side comparison
          </p>
        </div>
      )}
    </div>
  )
}

interface ComparisonRowProps {
  label: string
  stocks: string[]
  getValue: (stock: StockQuote) => string
  getColor?: (stock: StockQuote) => string
}

function ComparisonRow({
  label,
  stocks,
  getValue,
  getColor,
}: ComparisonRowProps) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-3 text-muted-foreground">{label}</td>
      {stocks.map((symbol) => (
        <ComparisonCell
          key={symbol}
          symbol={symbol}
          getValue={getValue}
          getColor={getColor}
        />
      ))}
    </tr>
  )
}

interface ComparisonCellProps {
  symbol: string
  getValue: (stock: StockQuote) => string
  getColor?: (stock: StockQuote) => string
}

function ComparisonCell({ symbol, getValue, getColor }: ComparisonCellProps) {
  const { data: stock } = useSWR(
    ['stock-quote', symbol],
    () => getStockQuote(symbol),
    { revalidateOnFocus: false }
  )

  if (!stock) {
    return <td className="py-3 text-right">-</td>
  }

  return (
    <td className={`py-3 text-right font-medium ${getColor?.(stock) || 'text-foreground'}`}>
      {getValue(stock)}
    </td>
  )
}
