'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PortfolioEntry {
  symbol: string
  shares: number
  avgCost: number
  addedAt: string
}

const STORAGE_KEY = 'stockpulse-portfolio'

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setPortfolio(JSON.parse(stored))
        } catch {
          setPortfolio([])
        }
      }
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
    }
  }, [portfolio, isLoaded])

  const addToPortfolio = useCallback((symbol: string, shares: number, avgCost: number) => {
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol.toUpperCase() === symbol.toUpperCase())
      if (existing) {
        // Average the cost
        const totalShares = existing.shares + shares
        const newAvgCost = ((existing.shares * existing.avgCost) + (shares * avgCost)) / totalShares
        return prev.map(p =>
          p.symbol.toUpperCase() === symbol.toUpperCase()
            ? { ...p, shares: totalShares, avgCost: newAvgCost }
            : p
        )
      }
      return [...prev, { symbol: symbol.toUpperCase(), shares, avgCost, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeFromPortfolio = useCallback((symbol: string) => {
    setPortfolio(prev => prev.filter(p => p.symbol.toUpperCase() !== symbol.toUpperCase()))
  }, [])

  const updateHolding = useCallback((symbol: string, shares: number, avgCost: number) => {
    setPortfolio(prev =>
      prev.map(p =>
        p.symbol.toUpperCase() === symbol.toUpperCase()
          ? { ...p, shares, avgCost }
          : p
      )
    )
  }, [])

  const isInPortfolio = useCallback((symbol: string) => {
    return portfolio.some(p => p.symbol.toUpperCase() === symbol.toUpperCase())
  }, [portfolio])

  const getHolding = useCallback((symbol: string) => {
    return portfolio.find(p => p.symbol.toUpperCase() === symbol.toUpperCase())
  }, [portfolio])

  const clearPortfolio = useCallback(() => {
    setPortfolio([])
  }, [])

  return {
    portfolio,
    addToPortfolio,
    removeFromPortfolio,
    updateHolding,
    isInPortfolio,
    getHolding,
    clearPortfolio,
    isLoaded,
  }
}
