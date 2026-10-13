'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import UserAvatar from './user-avatar'

type SearchResult = {
  users: any[]
  posts: any[]
  ai_interpretation: string
}

export default function AISearchBar() {
  const supabase = createClient()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
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

  // Debounced AI search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }),
        })
        const data = await res.json()

        if (data.success) {
          setResult({
            users: data.users || [],
            posts: data.posts || [],
            ai_interpretation: data.ai_interpretation || '',
          })
        } else {
          setResult({ users: [], posts: [], ai_interpretation: '' })
        }
      } catch (err) {
        console.error('Search error:', err)
        setResult({ users: [], posts: [], ai_interpretation: '' })
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  const totalResults = (result?.users.length || 0) + (result?.posts.length || 0)

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--cc-text-muted)' }}
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
            placeholder="Try: hackathons in Lahore, BS CS students, workshops this week..."
            className="w-full pl-11 pr-12 py-2.5 text-sm rounded-2xl outline-none transition-all border"
            style={{
              backgroundColor: 'var(--cc-bg)',
              borderColor: 'var(--cc-border)',
              color: 'var(--cc-text)',
            }}
          />
          {/* AI Badge */}
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{
              backgroundColor: 'var(--cc-hover)',
              color: 'var(--cc-primary)',
            }}
          >
            ✨ AI
          </div>
        </div>
      </form>

      {/* Dropdown results */}
      {open && query.trim().length >= 2 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--cc-surface)',
            borderColor: 'var(--cc-border)',
          }}
        >
          {loading ? (
            <div className="p-4">
              {/* AI Thinking */}
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--cc-primary)' }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: 'var(--cc-primary)',
                      animationDelay: '0.15s',
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: 'var(--cc-primary)',
                      animationDelay: '0.3s',
                    }}
                  ></span>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--cc-text-muted)' }}
                >
                  AI is understanding your query...
                </span>
              </div>
            </div>
          ) : result ? (
            <>
              {/* AI Interpretation */}
              {result.ai_interpretation && (
                <div
                  className="px-4 py-2.5 border-b flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--cc-hover)',
                    borderColor: 'var(--cc-border)',
                  }}
                >
                  <span className="text-sm">✨</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--cc-primary)' }}
                  >
                    {result.ai_interpretation}
                  </span>
                </div>
              )}

              {totalResults === 0 ? (
                <div className="p-6 text-center">
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--cc-hover)' }}
                  >
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--cc-text)' }}
                  >
                    No results found
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--cc-text-muted)' }}
                  >
                    Try different keywords
                  </p>
                </div>
              ) : (
                <>
                  {/* Users Section */}
                  {result.users.length > 0 && (
                    <div>
                      <div
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: 'var(--cc-text-muted)',
                          backgroundColor: 'var(--cc-bg)',
                        }}
                      >
                        👥 People ({result.users.length})
                      </div>
                      {result.users.slice(0, 3).map((user) => {
                        const shortUni =
                          user.university?.split(' - ')[0] || null
                        return (
                          <Link
                            key={user.id}
                            href={`/profile/${user.id}`}
                            onClick={() => {
                              setOpen(false)
                              setQuery('')
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--cc-hover)]"
                          >
                            <UserAvatar
                              userId={user.id}
                              name={user.full_name}
                              avatarUrl={user.avatar_url}
                              size="sm"
                              clickable={false}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: 'var(--cc-text)' }}
                              >
                                {user.full_name || 'User'}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: 'var(--cc-text-muted)' }}
                              >
                                {shortUni && user.program
                                  ? `🎓 ${shortUni} · ${user.program}`
                                  : shortUni
                                  ? `🎓 ${shortUni}`
                                  : user.program || 'Student'}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Posts Section */}
                  {result.posts.length > 0 && (
                    <div>
                      <div
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-t"
                        style={{
                          color: 'var(--cc-text-muted)',
                          backgroundColor: 'var(--cc-bg)',
                          borderColor: 'var(--cc-border)',
                        }}
                      >
                        📝 Posts ({result.posts.length})
                      </div>
                      {result.posts.slice(0, 5).map((post) => (
                        <Link
                          key={post.id}
                          href={`/dashboard?post=${post.id}`}
                          onClick={() => {
                            setOpen(false)
                            setQuery('')
                          }}
                          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--cc-hover)]"
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                            style={{ backgroundColor: 'var(--cc-hover)' }}
                          >
                            {post.category === 'hackathon'
                              ? '💻'
                              : post.category === 'event'
                              ? '📅'
                              : post.category === 'workshop'
                              ? '🛠️'
                              : post.category === 'opportunity'
                              ? '💼'
                              : '📌'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-sm line-clamp-1"
                              style={{ color: 'var(--cc-text)' }}
                            >
                              {post.title}
                            </p>
                            <p
                              className="text-xs line-clamp-1 mt-0.5"
                              style={{ color: 'var(--cc-text-secondary)' }}
                            >
                              {post.description}
                            </p>
                            <div
                              className="flex items-center gap-2 text-[10px] mt-1"
                              style={{ color: 'var(--cc-text-muted)' }}
                            >
                              {post.city && <span>📍 {post.city}</span>}
                              {post.category && (
                                <span>· {post.category}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* See All */}
              {totalResults > 0 && (
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 text-xs font-semibold transition-colors border-t"
                  style={{
                    color: 'var(--cc-primary)',
                    borderColor: 'var(--cc-border)',
                  }}
                >
                  See all {totalResults} results →
                </button>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}