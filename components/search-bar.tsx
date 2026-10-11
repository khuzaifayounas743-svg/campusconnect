'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import UserAvatar from './user-avatar'

type Result = {
  id: string
  full_name: string | null
  avatar_url: string | null
  university: string | null
}

export default function SearchBar() {
  const supabase = createClient()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search (email NOT fetched — privacy)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, university')
        .or(
          `full_name.ilike.%${query}%,email.ilike.%${query}%,university.ilike.%${query}%`
        )
        .limit(6)

      setResults(data || [])
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, supabase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl theme-input outline-none transition-all"
          />
        </div>
      </form>

      {/* Dropdown results */}
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl theme-card shadow-2xl ring-1 ring-black/5 overflow-hidden z-50 animate-scale-in max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-300/50 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-300/50 rounded-full"></div>
                    <div className="h-2 w-32 bg-gray-200/50 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div
                className="divide-y"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                {results.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/40 transition-colors"
                  >
                    <UserAvatar
                      userId={user.id}
                      name={user.full_name}
                      avatarUrl={user.avatar_url}
                      size="sm"
                      clickable={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm theme-text-primary truncate">
                        {user.full_name || 'User'}
                      </p>
                      {/* Email hatao — sirf university */}
                      <p className="text-xs theme-text-muted truncate">
                        {user.university || 'Student'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors border-t"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                See all results for &quot;{query}&quot; →
              </button>
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-sm font-semibold theme-text-primary mb-1">
                No users found
              </p>
              <p className="text-xs theme-text-muted">
                Try a different name or university
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}