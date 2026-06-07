'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import useSWR from 'swr'
import { getStockHistory, formatCurrency } from '@/lib/api'

interface StockDataPoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface StockChartProps {
  symbol: string
  isGain: boolean
}

type TimeRange = '1D' | '1W' | '1M' | '1Y'

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
]

function formatDate(timestamp: string, range: TimeRange): string {
  const date = parseISO(timestamp)
  switch (range) {
    case '1D':
      return format(date, 'HH:mm')
    case '1W':
      return format(date, 'EEE')
    case '1M':
      return format(date, 'MMM d')
    case '1Y':
      return format(date, 'MMM yyyy')
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number; payload: StockDataPoint }[]
  range: TimeRange
}

function CustomTooltip({ active, payload, range }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
      <p className="text-sm text-muted-foreground">
        {format(parseISO(data.timestamp), range === '1D' ? 'MMM d, HH:mm' : 'MMM d, yyyy')}
      </p>
      <p className="mt-1 text-lg font-bold text-foreground">
        {formatCurrency(data.close)}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">Open:</span>
        <span className="text-foreground">{formatCurrency(data.open)}</span>
        <span className="text-muted-foreground">High:</span>
        <span className="text-foreground">{formatCurrency(data.high)}</span>
        <span className="text-muted-foreground">Low:</span>
        <span className="text-foreground">{formatCurrency(data.low)}</span>
      </div>
    </div>
  )
}

export function StockChart({ symbol, isGain }: StockChartProps) {
  const [range, setRange] = useState<TimeRange>('1M')

  const { data: chartData, isLoading } = useSWR(
    ['stock-history', symbol, range],
    () => getStockHistory(symbol, range),
    { revalidateOnFocus: false }
  )

  const chartColor = isGain ? 'oklch(0.72 0.2 145)' : 'oklch(0.65 0.25 25)'

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Price Chart</h2>
        <div className="flex rounded-lg bg-muted p-1">
          {timeRanges.map((tr) => (
            <button
              key={tr.value}
              onClick={() => setRange(tr.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                range === tr.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : chartData && chartData.length > 0 ? (
        <div className="h-[350px] w-full">
  <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartColor}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatDate(value, range)}
                stroke="oklch(0.65 0 0)"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value}`}
                stroke="oklch(0.65 0 0)"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip range={range} />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#colorChart)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center text-muted-foreground">
          No chart data available
        </div>
      )}
    </div>
  )
}
