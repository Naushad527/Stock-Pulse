'use client'

import { Newspaper } from 'lucide-react'
import { NewsList } from '@/components/news-card'

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Market News</h1>
            <p className="mt-1 text-muted-foreground">
              Stay updated with the latest financial news
            </p>
          </div>
        </div>
      </div>

      <NewsList />
    </div>
  )
}
