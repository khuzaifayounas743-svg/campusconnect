'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import CreatePostButton from '@/app/dashboard/create-post-button'
import NotificationBell from './notification-bell'
import ThemeSwitcher from './theme-switcher'
import AISearchBar from './ai-search-bar'

type User = {
  id: string
  email: string | undefined
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AppNavbar({ user }: { user: User }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const userName = user.user_metadata?.full_name || 'Student'
  const userInitial = userName[0]?.toUpperCase() || 'S'
  const userAvatar = user.user_metadata?.avatar_url

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () =>
        document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--cc-navbar-bg) 90%, transparent)',
        borderColor: 'var(--cc-border)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            style={{
              background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
            }}
          >
            <span className="text-xl">🎓</span>
          </div>
          <span
            className="text-xl font-bold hidden md:block"
            style={{ color: 'var(--cc-primary)' }}
          >
            CampusConnect
          </span>
        </Link>

        {/* AI Search Bar — Center */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <AISearchBar />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Create Post */}
          <div className="hidden sm:block">
            <CreatePostButton />
          </div>

          {/* Notification Bell */}
          <NotificationBell currentUserId={user.id} />

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--cc-hover)' }}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full ring-2"
                  style={{ boxShadow: `0 0 0 2px var(--cc-primary)` }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
                  }}
                >
                  {userInitial}
                </div>
              )}
              <span
                className="text-sm font-semibold hidden md:block"
                style={{ color: 'var(--cc-text)' }}
              >
                {userName.split(' ')[0]}
              </span>
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden z-50"
                style={{ backgroundColor: 'var(--cc-surface)' }}
              >
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--cc-hover)]"
                  style={{ color: 'var(--cc-text)' }}
                >
                  <span>👤</span>
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
                <Link
                  href="/profile/edit"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--cc-hover)]"
                  style={{ color: 'var(--cc-text)' }}
                >
                  <span>✏️</span>
                  <span className="text-sm font-medium">Edit Profile</span>
                </Link>
                <div
                  className="border-t"
                  style={{ borderColor: 'var(--cc-border)' }}
                ></div>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <span>🚪</span>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}