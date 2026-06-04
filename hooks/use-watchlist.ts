'use client'

import { useState, useEffect, useCallback } from 'react'

const WATCHLIST_KEY = 'stock-watchlist'

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY)
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored))
      } catch {
        setWatchlist([])
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
    }
  }, [watchlist, isLoaded])

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol.toUpperCase())) return prev
      return [...prev, symbol.toUpperCase()]
    })
  }, [])

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol.toUpperCase()))
  }, [])

  const isInWatchlist = useCallback(
    (symbol: string) => watchlist.includes(symbol.toUpperCase()),
    [watchlist]
  )

  const toggleWatchlist = useCallback(
    (symbol: string) => {
      if (isInWatchlist(symbol)) {
        removeFromWatchlist(symbol)
      } else {
        addToWatchlist(symbol)
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  )

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    isLoaded,
  }
}
