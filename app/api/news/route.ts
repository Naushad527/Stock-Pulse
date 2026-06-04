import { NextResponse } from 'next/server'
import { newsTemplates, NewsArticle } from '@/lib/api'

const NEWS_API_KEY =
  process.env.NEWS_API_KEY ||
  process.env.NEXT_PUBLIC_NEWS_API_KEY ||
  'd3dd6dba34e1410d9ef95b86d1b54de7'
const NEWS_ENDPOINT = 'https://newsapi.org/v2/everything'
const DEFAULT_QUERY = 'stock market OR finance OR investing'

function mapArticle(article: any, index: number): NewsArticle {
  return {
    id: article.url || `news-${index}`,
    title: article.title || 'Market update',
    source: article.source?.name || 'News',
    url: article.url || '#',
    summary: article.description || article.content || 'Read the latest market news.',
    image: article.urlToImage || undefined,
    sentiment: 'neutral',
    tickers: [],
    publishedAt: article.publishedAt || new Date().toISOString(),
  }
}

function buildFallbackNews(limit: number): NewsArticle[] {
  return newsTemplates.slice(0, limit).map((news, index) => ({
    ...news,
    id: `fallback-${index}`,
    publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
  }))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(Number(url.searchParams.get('limit') || '8'), 20)
  const query = url.searchParams.get('query') || DEFAULT_QUERY

  try {
    const apiUrl = `${NEWS_ENDPOINT}?q=${encodeURIComponent(query)}&language=en&pageSize=${limit}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    const response = await fetch(apiUrl)
    const payload = await response.json()

    if (!response.ok || !payload.articles) {
      console.warn('[News API] Failed to fetch articles, using fallback news', payload)
      return NextResponse.json(buildFallbackNews(limit), { status: 200 })
    }

    const articles = payload.articles.map(mapArticle)
    return NextResponse.json(articles, { status: 200 })
  } catch (error) {
    console.warn('[News API] Error fetching market news:', error)
    return NextResponse.json(buildFallbackNews(limit), { status: 200 })
  }
}
