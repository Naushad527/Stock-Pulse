'use client'

import { Briefcase } from 'lucide-react'
import { PortfolioTracker } from '@/components/portfolio-tracker'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
              <p className="text-muted-foreground">
                Track your investments and monitor performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PortfolioTracker />
      </div>
    </div>
  )
}
