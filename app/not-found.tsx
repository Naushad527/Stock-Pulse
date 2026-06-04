import Link from 'next/link'
import { TrendingUp, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Stock Not Found</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The stock symbol you&apos;re looking for doesn&apos;t exist or couldn&apos;t be found.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Back to Market
        </Link>
      </div>
    </div>
  )
}
