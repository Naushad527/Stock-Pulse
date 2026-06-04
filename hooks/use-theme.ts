'use client'

import { useState, useEffect, useCallback } from 'react'

type Theme = 'dark' | 'light'
const THEME_KEY = 'stock-dashboard-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) {
      setThemeState(stored)
      document.documentElement.classList.toggle('dark', stored === 'dark')
    } else {
      // Default to dark theme
      document.documentElement.classList.add('dark')
    }
    setIsLoaded(true)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isLoaded,
  }
}
