'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import UserAvatar from '@/components/user-avatar'
import PostCard from '@/app/dashboard/post-card'
import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [interpretation, setInterpretation] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const search = async () => {
      if (!query || query.length < 2) {
        setLoading(false)
        return
      }

      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // Call AI search
      try {
        const res = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })
        const data = await res.json()

        if (data.success) {
          setUsers(data.users || [])
          setPosts(data.posts || [])
          setInterpretation(data.ai_interpretation || '')

          // Fetch user likes
          if (user && data.posts?.length > 0) {
            const { data: likesData } = await supabase
              .from('likes')
              .select('post_id')
              .eq('user_id', user.id)
              .in(
                'post_id',
                data.posts.map((p: any) => p.id)
              )
            setLikedPostIds(
              new Set(likesData?.map((l: any) => l.post_id) || [])
            )
          }
        }
      } catch (err) {
        console.error('Search error:', err)
      }

      setLoading(false)
    }

    search()
  }, [query, supabase])

  return (
    <div className="min-h-screen cc-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--cc-text)' }}
          >
            🔍 Search Results
          </h1>
          {query && (
            <p
              className="text-sm"
              style={{ color: 'var(--cc-text-secondary)' }}
            >
              Results for{' '}
              <span
                className="font-semibold"
                style={{ color: 'var(--cc-primary)' }}
              >
                &quot;{query}&quot;
              </span>
            </p>
          )}
        </div>

        {/* AI Interpretation */}
        {interpretation && (
          <div
            className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-2"
            style={{
              backgroundColor: 'var(--cc-hover)',
              color: 'var(--cc-primary)',
            }}
          >
            <span>✨</span>
            <span className="text-sm font-medium">
              AI understood: {interpretation}
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: 'var(--cc-primary)',
                borderTopColor: 'transparent',
              }}
            ></div>
            <p className="mt-4 text-sm" style={{ color: 'var(--cc-text-muted)' }}>
              AI is searching...
            </p>
          </div>
        ) : (
          <>
            {/* Users */}
            {users.length > 0 && (
              <div className="mb-8">
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: 'var(--cc-text)' }}
                >
                  👥 People ({users.length})
                </h2>
                <div className="space-y-2">
                  {users.map((user) => {
                    const shortUni = user.university?.split(' - ')[0] || null
                    return (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-md"
                        style={{
                          backgroundColor: 'var(--cc-surface)',
                          borderColor: 'var(--cc-border)',
                        }}
                      >
                        <UserAvatar
                          userId={user.id}
                          name={user.full_name}
                          avatarUrl={user.avatar_url}
                          size="md"
                          clickable={false}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold truncate"
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
                              : shortUni || 'Student'}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Posts */}
            {posts.length > 0 && (
              <div>
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: 'var(--cc-text)' }}
                >
                  📝 Posts ({posts.length})
                </h2>
                <div className="space-y-5">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                      initialLiked={likedPostIds.has(post.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {users.length === 0 && posts.length === 0 && (
              <div
                className="rounded-3xl p-12 text-center border"
                style={{
                  backgroundColor: 'var(--cc-surface)',
                  borderColor: 'var(--cc-border)',
                }}
              >
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--cc-hover)' }}
                >
                  <span className="text-4xl">🔍</span>
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--cc-text)' }}
                >
                  No results found
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--cc-text-secondary)' }}
                >
                  Try different keywords, or search for events, users, or
                  universities.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}