'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen theme-bg flex items-center justify-center p-6">
      <div className="theme-card rounded-3xl p-10 shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center">
          <span className="text-4xl">😵</span>
        </div>
        <h1 className="text-2xl font-bold theme-text-primary mb-3">
          Something went wrong
        </h1>
        <p className="theme-text-secondary text-sm mb-6 leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 theme-btn-primary rounded-2xl font-semibold shadow-lg transition-all hover:-translate-y-0.5"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-3 theme-card rounded-2xl font-semibold theme-text-primary hover:shadow-lg transition-all text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}