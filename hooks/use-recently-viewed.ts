'use client'

import { useState, useEffect, useCallback } from 'react'

const RECENTLY_VIEWED_KEY = 'recently-viewed-stocks'
const MAX_ITEMS = 10

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY)
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored))
      } catch {
        setRecentlyViewed([])
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed))
    }
  }, [recentlyViewed, isLoaded])

  const addToRecentlyViewed = useCallback((symbol: string) => {
    setRecentlyViewed((prev) => {
      const upperSymbol = symbol.toUpperCase()
      const filtered = prev.filter((s) => s !== upperSymbol)
      return [upperSymbol, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([])
  }, [])

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    isLoaded,
  }
}
