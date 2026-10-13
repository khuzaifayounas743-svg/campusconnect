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
  program: string | null
  semester: string | null
  department: string | null
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
    <div
      className="rounded-3xl overflow-hidden shadow-sm border"
      style={{
        backgroundColor: 'var(--cc-surface)',
        borderColor: 'var(--cc-border)',
      }}
    >
      {/* Cover gradient */}
      <div
        className="h-32 relative"
        style={{
          background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-4 right-4 w-40 h-40 bg-white rounded-full filter blur-3xl"></div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + Buttons row */}
        <div className="flex items-end justify-between -mt-12 mb-4 flex-wrap gap-3">
          <div className="relative">
            <div
              className="ring-4 rounded-full"
              style={{ boxShadow: `0 0 0 4px var(--cc-surface)` }}
            >
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
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-md inline-flex items-center gap-2 border"
                style={{
                  backgroundColor: 'var(--cc-surface)',
                  borderColor: 'var(--cc-border)',
                  color: 'var(--cc-text)',
                }}
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </Link>
            )}

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
          <h1
            className="text-2xl font-bold mb-1 flex items-center gap-2 flex-wrap"
            style={{ color: 'var(--cc-text)' }}
          >
            {profile.full_name || 'Anonymous User'}
            {isOwnProfile && (
              <span
                className="text-xs px-2 py-0.5 rounded-md font-bold uppercase"
                style={{
                  backgroundColor: 'var(--cc-hover)',
                  color: 'var(--cc-primary)',
                }}
              >
                You
              </span>
            )}
          </h1>

          {/* Email — ONLY for owner */}
          {isOwnProfile && profile.email && (
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--cc-text-muted)' }}
            >
              {profile.email}
            </p>
          )}

          {/* University + Program + Semester Badges */}
          {(profile.university ||
            profile.program ||
            profile.semester ||
            profile.department) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {profile.university && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--cc-hover)',
                    color: 'var(--cc-primary)',
                  }}
                >
                  🎓 {profile.university}
                </span>
              )}
              {profile.program && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--cc-hover)',
                    color: 'var(--cc-primary)',
                  }}
                >
                  📚 {profile.program}
                </span>
              )}
              {profile.semester && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--cc-hover)',
                    color: 'var(--cc-primary)',
                  }}
                >
                  🗓️ {profile.semester}
                </span>
              )}
              {profile.department && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--cc-hover)',
                    color: 'var(--cc-primary)',
                  }}
                >
                  🏛️ {profile.department}
                </span>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-sm mt-3 leading-relaxed"
              style={{ color: 'var(--cc-text-secondary)' }}
            >
              {profile.bio}
            </p>
          )}

          <p
            className="text-xs mt-3"
            style={{ color: 'var(--cc-text-muted)' }}
          >
            📅 Joined {joinDate}
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-4 pt-4 border-t"
          style={{ borderColor: 'var(--cc-border)' }}
        >
          <div className="text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--cc-primary)' }}
            >
              {postsCount}
            </p>
            <p
              className="text-xs uppercase tracking-wider font-medium"
              style={{ color: 'var(--cc-text-muted)' }}
            >
              Posts
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--cc-primary)' }}
            >
              {followers}
            </p>
            <p
              className="text-xs uppercase tracking-wider font-medium"
              style={{ color: 'var(--cc-text-muted)' }}
            >
              Followers
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--cc-primary)' }}
            >
              {followingCount}
            </p>
            <p
              className="text-xs uppercase tracking-wider font-medium"
              style={{ color: 'var(--cc-text-muted)' }}
            >
              Following
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}