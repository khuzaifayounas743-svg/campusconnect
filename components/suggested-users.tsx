'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserAvatar from './user-avatar'
import FollowButton from './follow-button'

type SuggestedUser = {
  id: string
  full_name: string | null
  avatar_url: string | null
  university: string | null
}

export default function SuggestedUsers({
  currentUserId,
  limit = 5,
  onClose,
}: {
  currentUserId: string
  limit?: number
  onClose?: () => void
}) {
  const supabase = createClient()
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggested = async () => {
      setLoading(true)

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)

      const followingIds = new Set(
        following?.map((f) => f.following_id) || []
      )
      followingIds.add(currentUserId)

      const excludedIds = [...followingIds]
        .map((id) => `"${id}"`)
        .join(',')

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, university')
        .not('id', 'in', `(${excludedIds})`)
        .limit(limit)

      setUsers(profiles || [])
      setLoading(false)
    }

    fetchSuggested()
  }, [currentUserId, limit, supabase])

  if (loading) {
    return (
      <div className="theme-card rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold theme-text-primary text-sm">
            👥 Who to follow
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg theme-text-muted hover:theme-text-primary hover:bg-white/40 flex items-center justify-center transition-all text-xs"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-300/50"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-20 bg-gray-300/50 rounded-full"></div>
                <div className="h-2 w-16 bg-gray-200/50 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="theme-card rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold theme-text-primary text-sm">
            👥 Who to follow
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg theme-text-muted hover:theme-text-primary hover:bg-white/40 flex items-center justify-center transition-all text-xs"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs theme-text-muted text-center py-2">
          No suggestions right now
        </p>
      </div>
    )
  }

  return (
    <div className="theme-card rounded-2xl p-4 shadow-xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold theme-text-primary text-sm">
          👥 Who to follow
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg theme-text-muted hover:theme-text-primary hover:bg-white/40 flex items-center justify-center transition-all text-xs"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                userId={user.id}
                name={user.full_name}
                avatarUrl={user.avatar_url}
                size="sm"
                clickable={false}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs theme-text-primary truncate">
                  {user.full_name || 'User'}
                </p>
                <p className="text-[10px] theme-text-muted truncate">
                  {user.university || 'Student'}
                </p>
              </div>
            </Link>
            <FollowButton
              targetUserId={user.id}
              currentUserId={currentUserId}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
}