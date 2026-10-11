'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    // If user came from within the app, go back in history (preserves scroll)
    // Otherwise, fallback to /dashboard
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <button
      onClick={handleBack}
      className="px-4 py-2 text-sm font-semibold theme-text-primary hover:gradient-text transition-all rounded-xl hover:bg-white/40 flex items-center gap-1.5"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>Back</span>
    </button>
  )
}