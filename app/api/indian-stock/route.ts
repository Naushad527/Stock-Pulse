import YahooFinance from 'yahoo-finance2'
import { NextResponse } from 'next/server'

const yahooFinance = new YahooFinance()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing symbol' },
      { status: 400 }
    )
  }

  try {
    const quote: any = await yahooFinance.quote(symbol)

    return NextResponse.json({
      symbol,
      name: quote?.longName || quote?.shortName || symbol,
      price: Number(quote?.regularMarketPrice || 0),
      change: Number(quote?.regularMarketChange || 0),
      changePercent: Number(
        quote?.regularMarketChangePercent || 0
      ),
      high: Number(quote?.regularMarketDayHigh || 0),
      low: Number(quote?.regularMarketDayLow || 0),
      open: Number(quote?.regularMarketOpen || 0),
      previousClose: Number(
        quote?.regularMarketPreviousClose || 0
      ),
      volume: Number(quote?.regularMarketVolume || 0),
    })
  } catch (error) {
    console.error('[Yahoo Finance Error]', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch stock data',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}