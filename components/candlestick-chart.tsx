'use client'

import { useState, useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import useSWR from 'swr'
import {
  getStockHistory,
  calculateTechnicalIndicators,
  CandlestickData,
  formatCurrency,
} from '@/lib/api'
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'

interface CandlestickChartProps {
  symbol: string
  currency?: 'USD' | 'INR'
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'
type ChartType = 'candlestick' | 'line' | 'area'
type Indicator = 'none' | 'sma' | 'ema' | 'bollinger' | 'macd' | 'rsi'

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
]

const indicators: { label: string; value: Indicator }[] = [
  { label: 'None', value: 'none' },
  { label: 'SMA', value: 'sma' },
  { label: 'EMA', value: 'ema' },
  { label: 'Bollinger', value: 'bollinger' },
  { label: 'RSI', value: 'rsi' },
  { label: 'MACD', value: 'macd' },
]

function formatDateLabel(timestamp: string, range: TimeRange): string {
  const date = parseISO(timestamp)
  switch (range) {
    case '1D':
      return format(date, 'HH:mm')
    case '1W':
      return format(date, 'EEE HH:mm')
    case '1M':
    case '3M':
      return format(date, 'MMM d')
    case '6M':
    case '1Y':
      return format(date, 'MMM d')
    case '5Y':
      return format(date, 'MMM yyyy')
    default:
      return format(date, 'MMM d')
  }
}

// Custom Candlestick Bar
function CandlestickBar(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: CandlestickData & { index: number }
}) {
  const { x = 0, width = 0, payload } = props
  if (!payload) return null

  const { open, close, high, low } = payload
  const isGain = close >= open
  const color = isGain ? 'oklch(0.7 0.22 145)' : 'oklch(0.62 0.25 25)'

  const barWidth = Math.max(width * 0.6, 2)
  const barX = x + (width - barWidth) / 2

  // Scale calculations
  const priceRange = high - low
  const bodyTop = Math.max(open, close)
  const bodyBottom = Math.min(open, close)

  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        x2={x + width / 2}
        y1={props.y! + (1 - (high - low) / priceRange) * (props.height || 0)}
        y2={props.y! + props.height!}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={barX}
        y={props.y! + ((high - bodyTop) / priceRange) * (props.height || 0)}
        width={barWidth}
        height={Math.max(((bodyTop - bodyBottom) / priceRange) * (props.height || 0), 1)}
        fill={isGain ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: CandlestickData & { sma20?: number; sma50?: number; rsi?: number; macd?: number } }[]
  range: TimeRange
  currency: 'USD' | 'INR'
  indicator: Indicator
}

function CustomTooltip({ active, payload, range, currency, indicator }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload
  const isGain = data.close >= data.open

  return (
    <div className="glass-card rounded-lg p-4 shadow-xl">
      <p className="text-sm text-muted-foreground">
        {format(parseISO(data.timestamp), range === '1D' ? 'MMM d, HH:mm' : 'MMM d, yyyy')}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Open</span>
          <span className="ml-2 font-medium text-foreground">
            {formatCurrency(data.open, currency)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Close</span>
          <span className={`ml-2 font-medium ${isGain ? 'text-gain' : 'text-loss'}`}>
            {formatCurrency(data.close, currency)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">High</span>
          <span className="ml-2 font-medium text-foreground">
            {formatCurrency(data.high, currency)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Low</span>
          <span className="ml-2 font-medium text-foreground">
            {formatCurrency(data.low, currency)}
          </span>
        </div>
      </div>
      {indicator !== 'none' && (
        <div className="mt-3 border-t border-border pt-3 text-sm">
          {(indicator === 'sma' || indicator === 'ema') && data.sma20 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">MA 20</span>
              <span className="font-medium text-chart-2">{formatCurrency(data.sma20, currency)}</span>
            </div>
          )}
          {indicator === 'rsi' && data.rsi !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">RSI (14)</span>
              <span className={`font-medium ${data.rsi > 70 ? 'text-loss' : data.rsi < 30 ? 'text-gain' : 'text-foreground'}`}>
                {data.rsi.toFixed(1)}
              </span>
            </div>
          )}
          {indicator === 'macd' && data.macd !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">MACD</span>
              <span className={`font-medium ${data.macd >= 0 ? 'text-gain' : 'text-loss'}`}>
                {data.macd.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CandlestickChart({ symbol, currency = 'USD' }: CandlestickChartProps) {
  const [range, setRange] = useState<TimeRange>('1M')
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [indicator, setIndicator] = useState<Indicator>('none')

  const { data: rawData, isLoading } = useSWR(
    ['stock-history', symbol, range],
    () => getStockHistory(symbol, range),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  )

  const { chartData, technicalData } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { chartData: [], technicalData: null }
    }

    const techData = calculateTechnicalIndicators(rawData)

    const enhanced = rawData.map((d, i) => ({
      ...d,
      index: i,
      sma20: techData.sma20[i],
      sma50: techData.sma50[i],
      ema12: techData.ema12[i],
      ema26: techData.ema26[i],
      rsi: techData.rsi[i],
      macd: techData.macd[i]?.macd,
      macdSignal: techData.macd[i]?.signal,
      macdHistogram: techData.macd[i]?.histogram,
      bbUpper: techData.bollingerBands[i]?.upper,
      bbMiddle: techData.bollingerBands[i]?.middle,
      bbLower: techData.bollingerBands[i]?.lower,
    }))

    return { chartData: enhanced, technicalData: techData }
  }, [rawData])

  const priceChange = useMemo(() => {
    if (!chartData || chartData.length < 2) return { value: 0, percent: 0, isGain: true }
    const first = chartData[0].close
    const last = chartData[chartData.length - 1].close
    const change = last - first
    return {
      value: change,
      percent: (change / first) * 100,
      isGain: change >= 0,
    }
  }, [chartData])

  const chartColor = priceChange.isGain ? 'oklch(0.7 0.22 145)' : 'oklch(0.62 0.25 25)'

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Price Chart</h2>
          <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
            priceChange.isGain ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
          }`}>
            {priceChange.isGain ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {priceChange.isGain ? '+' : ''}{priceChange.percent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('candlestick')}
            className={`rounded-lg p-2 transition-colors ${
              chartType === 'candlestick'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Candlestick"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`rounded-lg p-2 transition-colors ${
              chartType === 'line'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Line"
          >
            <Activity className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-xl bg-muted/50 p-1">
          {timeRanges.map((tr) => (
            <button
              key={tr.value}
              onClick={() => setRange(tr.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                range === tr.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {/* Indicator Selector */}
        <div className="flex rounded-xl bg-muted/50 p-1">
          {indicators.map((ind) => (
            <button
              key={ind.value}
              onClick={() => setIndicator(ind.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                indicator === ind.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : chartData && chartData.length > 0 ? (
        <div className="space-y-4">
          {/* Main Price Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.2 250)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="oklch(0.7 0.2 250)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => formatDateLabel(value, range)}
                  stroke="oklch(0.5 0 0)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => formatCurrency(value, currency).replace(/\.00$/, '')}
                  stroke="oklch(0.5 0 0)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip range={range} currency={currency} indicator={indicator} />} />

                {/* Bollinger Bands */}
                {indicator === 'bollinger' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="bbUpper"
                      stroke="oklch(0.7 0.2 250 / 0.5)"
                      fill="url(#bbGradient)"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bbMiddle"
                      stroke="oklch(0.7 0.2 250)"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="bbLower"
                      stroke="oklch(0.7 0.2 250 / 0.5)"
                      fill="transparent"
                      strokeWidth={1}
                      dot={false}
                    />
                  </>
                )}

                {/* Price */}
                {chartType === 'candlestick' ? (
                  <Bar
                    dataKey="high"
                    shape={<CandlestickBar />}
                    isAnimationActive={false}
                  />
                ) : chartType === 'line' ? (
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={chartColor}
                    strokeWidth={2}
                    dot={false}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                    dot={false}
                  />
                )}

                {/* Moving Averages */}
                {indicator === 'sma' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma20"
                      stroke="oklch(0.7 0.18 180)"
                      strokeWidth={1.5}
                      dot={false}
                      name="SMA 20"
                    />
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      stroke="oklch(0.75 0.15 60)"
                      strokeWidth={1.5}
                      dot={false}
                      name="SMA 50"
                    />
                  </>
                )}

                {indicator === 'ema' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="ema12"
                      stroke="oklch(0.7 0.18 180)"
                      strokeWidth={1.5}
                      dot={false}
                      name="EMA 12"
                    />
                    <Line
                      type="monotone"
                      dataKey="ema26"
                      stroke="oklch(0.75 0.15 60)"
                      strokeWidth={1.5}
                      dot={false}
                      name="EMA 26"
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* RSI Chart */}
          {indicator === 'rsi' && (
            <div className="h-32 rounded-xl bg-muted/30 p-2">
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">RSI (14)</p>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[0, 100]} ticks={[30, 50, 70]} width={30} tick={{ fontSize: 10 }} stroke="oklch(0.5 0 0)" />
                  <ReferenceLine y={70} stroke="oklch(0.62 0.25 25 / 0.5)" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="oklch(0.7 0.22 145 / 0.5)" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="oklch(0.7 0.2 300)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACD Chart */}
          {indicator === 'macd' && (
            <div className="h-32 rounded-xl bg-muted/30 p-2">
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">MACD (12, 26, 9)</p>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis width={40} tick={{ fontSize: 10 }} stroke="oklch(0.5 0 0)" />
                  <ReferenceLine y={0} stroke="oklch(0.5 0 0 / 0.3)" />
                  <Bar
                    dataKey="macdHistogram"
                    fill="oklch(0.7 0.2 250 / 0.5)"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="oklch(0.7 0.2 250)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="macdSignal"
                    stroke="oklch(0.72 0.2 30)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume Chart */}
          <div className="h-20 rounded-xl bg-muted/30 p-2">
            <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">Volume</p>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="timestamp" hide />
                <YAxis hide />
                <Bar
                  dataKey="volume"
                  fill="oklch(0.5 0 0 / 0.3)"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Indicator Legend */}
          {indicator !== 'none' && (
            <div className="flex flex-wrap gap-4 text-xs">
              {indicator === 'sma' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded bg-[oklch(0.7_0.18_180)]" />
                    <span className="text-muted-foreground">SMA 20</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded bg-[oklch(0.75_0.15_60)]" />
                    <span className="text-muted-foreground">SMA 50</span>
                  </div>
                </>
              )}
              {indicator === 'ema' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded bg-[oklch(0.7_0.18_180)]" />
                    <span className="text-muted-foreground">EMA 12</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded bg-[oklch(0.75_0.15_60)]" />
                    <span className="text-muted-foreground">EMA 26</span>
                  </div>
                </>
              )}
              {indicator === 'rsi' && (
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    RSI: <span className="text-loss">Overbought {'>'} 70</span> | <span className="text-gain">Oversold {'<'} 30</span>
                  </span>
                </div>
              )}
              {indicator === 'macd' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded bg-[oklch(0.7_0.2_250)]" />
                    <span className="text-muted-foreground">MACD Line</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 rounded bg-[oklch(0.72_0.2_30)]" />
                    <span className="text-muted-foreground">Signal Line</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center text-muted-foreground">
          No chart data available
        </div>
      )}
    </div>
  )
}
