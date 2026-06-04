'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react'
import { searchStocks, StockQuote, formatCurrency, formatPercent } from '@/lib/api'

interface SearchBarProps {
  onSelect?: () => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockQuote[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 1) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await searchStocks(query)
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (symbol: string) => {
    setQuery('')
    setIsOpen(false)
    onSelect?.()
    router.push(`/stock/${symbol}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].symbol)
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks by symbol or name..."
          className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (query.trim().length > 0 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-2">
              {results.map((stock) => (
                <li key={stock.symbol}>
                  <button
                    onClick={() => handleSelect(stock.symbol)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {stock.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(stock.price)}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 text-sm ${
                          stock.changePercent >= 0
                            ? 'text-gain'
                            : 'text-loss'
                        }`}
                      >
                        {stock.changePercent >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(stock.changePercent)}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No stocks found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
