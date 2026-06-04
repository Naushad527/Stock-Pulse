'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  TrendingUp,
  Search,
  Star,
  Newspaper,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X,
  Briefcase,
  Globe,
} from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { SearchBar } from './search-bar'

const navLinks = [
  { href: '/', label: 'Markets', icon: TrendingUp },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/news', label: 'News', icon: Newspaper },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme, isLoaded } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="glass-navbar sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary glow-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Stock<span className="text-primary">Pulse</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Search */}
          <div className="relative w-64">
            <SearchBar />
          </div>

          {/* Theme Toggle */}
          {isLoaded && (
            <button
              onClick={toggleTheme}
              className="glass-button flex h-10 w-10 items-center justify-center rounded-xl"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
          )}

          {/* Market Status */}
          <div className="glass-button flex items-center gap-2 rounded-xl px-3 py-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">US</span>
              <span className="h-2 w-2 rounded-full bg-gain animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">IN</span>
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="glass-button flex h-10 w-10 items-center justify-center rounded-xl"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>

          {isLoaded && (
            <button
              onClick={toggleTheme}
              className="glass-button flex h-10 w-10 items-center justify-center rounded-xl"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="glass-button flex h-10 w-10 items-center justify-center rounded-xl"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <SearchBar onSelect={() => setIsSearchOpen(false)} />
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Market Status Mobile */}
          <div className="mt-4 flex items-center justify-center gap-6 rounded-xl bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">US Market</span>
              <span className="h-2.5 w-2.5 rounded-full bg-gain animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">IN Market</span>
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
