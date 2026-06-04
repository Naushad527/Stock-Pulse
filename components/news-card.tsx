'use client'

import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ExternalLink, Calendar, Building2 } from 'lucide-react'
import useSWR from 'swr'
import { getMarketNews, NewsArticle } from '@/lib/api'

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {article.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {article.source}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(parseISO(article.publishedAt), 'MMM d, yyyy')}
          </span>
        </div>
        <h3 className="mb-2 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
          Read more
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </a>
  )
}

export function NewsList() {
  const { data: news, isLoading } = useSWR('market-news', getMarketNews, {
    revalidateOnFocus: false,
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!news?.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        No market news is available right now. Please check back shortly.
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {news.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  )
}

export function NewsPreview() {
  const { data: news, isLoading } = useSWR('market-news', getMarketNews, {
    revalidateOnFocus: false,
  })

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Market News</h2>
        <Link
          href="/news"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-16 w-24 flex-shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : !news?.length ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          No market news is available right now.
        </div>
      ) : (
        <div className="space-y-4">
          {news.slice(0, 4).map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4"
            >
              {article.image && (
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {article.source} • {format(parseISO(article.publishedAt), 'MMM d')}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
