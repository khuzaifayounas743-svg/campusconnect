'use client'

import { useState } from 'react'
import FollowButton from '@/components/follow-button'
import UserAvatar from '@/components/user-avatar'
import Link from 'next/link'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  university: string | null
}

export default function ProfileHeader({
  profile,
  currentUserId,
  followersCount,
  followingCount,
  postsCount,
  isOwnProfile,
}: {
  profile: Profile
  currentUserId: string
  followersCount: number
  followingCount: number
  postsCount: number
  isOwnProfile: boolean
}) {
  const [followers, setFollowers] = useState(followersCount)

  const handleFollowChange = (following: boolean) => {
    setFollowers((c) => (following ? c + 1 : Math.max(0, c - 1)))
  }

  const joinDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="theme-card rounded-3xl overflow-hidden shadow-xl">
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-4 right-4 w-40 h-40 bg-purple-300 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + Buttons row */}
        <div className="flex items-end justify-between -mt-12 mb-4 flex-wrap gap-3">
          <div className="relative">
            <div className="ring-4 ring-white dark:ring-slate-800 rounded-full">
              <UserAvatar
                userId={profile.id}
                name={profile.full_name}
                avatarUrl={profile.avatar_url}
                size="xl"
                clickable={false}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Profile — ONLY for owner */}
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="px-4 py-2 theme-card rounded-xl text-sm font-semibold theme-text-primary hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </Link>
            )}

            {/* Follow/Unfollow — for others */}
            {!isOwnProfile && (
              <FollowButton
                targetUserId={profile.id}
                currentUserId={currentUserId}
                size="md"
                onChange={handleFollowChange}
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold theme-text-primary mb-1 flex items-center gap-2 flex-wrap">
            {profile.full_name || 'Anonymous User'}
            {isOwnProfile && (
              <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-bold uppercase">
                You
              </span>
            )}
          </h1>

          {/* 🔒 Email — ONLY for owner */}
          {isOwnProfile && profile.email && (
            <p className="text-sm theme-text-muted mb-2">{profile.email}</p>
          )}

          {/* University — public */}
          {profile.university && (
            <p className="text-sm theme-text-secondary">
              🎓 {profile.university}
            </p>
          )}

          {/* Bio — public */}
          {profile.bio && (
            <p className="text-sm theme-text-secondary mt-3 leading-relaxed">
              {profile.bio}
            </p>
          )}

          <p className="text-xs theme-text-muted mt-3">
            📅 Joined {joinDate}
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-4 pt-4 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold gradient-text">{postsCount}</p>
            <p className="text-xs theme-text-muted uppercase tracking-wider font-medium">
              Posts
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold gradient-text">{followers}</p>
            <p className="text-xs theme-text-muted uppercase tracking-wider font-medium">
              Followers
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold gradient-text">
              {followingCount}
            </p>
            <p className="text-xs theme-text-muted uppercase tracking-wider font-medium">
              Following
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}