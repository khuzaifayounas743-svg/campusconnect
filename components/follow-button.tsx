'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function FollowButton({
  targetUserId,
  currentUserId,
  size = 'md',
  onChange,
}: {
  targetUserId: string
  currentUserId: string
  size?: 'sm' | 'md' | 'lg'
  onChange?: (following: boolean) => void
}) {
  const supabase = createClient()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hovering, setHovering] = useState(false)

  // Don't show for own profile
  if (targetUserId === currentUserId) {
    return null
  }

  useEffect(() => {
    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle()

      setFollowing(!!data)
      setLoading(false)
    }
    checkFollow()
  }, [targetUserId, currentUserId, supabase])

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)

    if (following) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)

      if (!error) {
        setFollowing(false)
        onChange?.(false)
      } else {
        alert('Unfollow failed: ' + error.message)
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        })

      if (!error) {
        setFollowing(true)
        onChange?.(true)
      } else {
        alert('Follow failed: ' + error.message)
      }
    }
    setLoading(false)
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  if (loading) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-xl font-semibold bg-gray-200 text-gray-400 animate-pulse`}
      >
        ...
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`${sizeClasses[size]} rounded-xl font-semibold transition-all duration-200 ${
        following
          ? hovering
            ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
            : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
          : 'theme-btn-primary shadow-lg hover:shadow-xl'
      }`}
    >
      {following ? (hovering ? 'Unfollow' : 'Following') : 'Follow'}
    </button>
  )
}