'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import UserAvatar from './user-avatar'

type Notification = {
  id: string
  user_id: string
  actor_id: string
  type: 'follow' | 'like' | 'comment' | 'reply' | 'new_post'
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
}

type Actor = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function NotificationBell({
  currentUserId,
}: {
  currentUserId: string
}) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [actors, setActors] = useState<Record<string, Actor>>({})
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true)

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)

        const actorIds = [...new Set(data.map((n) => n.actor_id))]
        if (actorIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', actorIds)

          const map: Record<string, Actor> = {}
          profilesData?.forEach((p) => {
            map[p.id] = p
          })
          setActors(map)
        }
      }

      if (showLoading) setLoading(false)
    },
    [supabase, currentUserId]
  )

  useEffect(() => {
    fetchNotifications(true)
    const interval = setInterval(() => {
      fetchNotifications(false)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    if (open) fetchNotifications(false)
  }, [open, fetchNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () =>
        document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId)
      .eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
    }
    setOpen(false)
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    if (seconds < 60) return 'now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
    return new Date(date).toLocaleDateString()
  }

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case 'follow':
        return 'started following you'
      case 'like':
        return 'liked your post'
      case 'comment':
        return 'commented on your post'
      case 'reply':
        return 'replied to your comment'
      case 'new_post':
        return 'shared a new post'
      default:
        return 'did something'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👤'
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'reply':
        return '↩️'
      case 'new_post':
        return '📝'
      default:
        return '🔔'
    }
  }

  // 🔑 DEEP LINK LOGIC
  const getNotificationLink = (notif: Notification) => {
    // Follow → actor's profile
    if (notif.type === 'follow') {
      return `/profile/${notif.actor_id}`
    }

    // Like → the liked post
    if (notif.type === 'like' && notif.post_id) {
      return `/dashboard?post=${notif.post_id}`
    }

    // New post → the new post
    if (notif.type === 'new_post' && notif.post_id) {
      return `/dashboard?post=${notif.post_id}`
    }

    // Comment → post with comments open
    if (notif.type === 'comment' && notif.post_id) {
      return `/dashboard?post=${notif.post_id}&comments=true`
    }

    // Reply → post + comments + highlight the specific comment
    if (notif.type === 'reply' && notif.post_id) {
      return `/dashboard?post=${notif.post_id}&comments=true&highlight=${notif.comment_id}`
    }

    return '/dashboard'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-xl theme-card hover:shadow-lg transition-all flex items-center justify-center ${
          open ? 'ring-2 ring-indigo-300' : ''
        }`}
        aria-label="Notifications"
      >
        <svg
          className={`w-5 h-5 theme-text-primary transition-transform ${
            open ? 'scale-110' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-rose-500 to-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md max-h-[80vh] rounded-2xl theme-card shadow-2xl ring-1 ring-black/5 overflow-hidden z-50 animate-scale-in">
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div>
              <h3 className="font-bold theme-text-primary text-sm">
                🔔 Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-[10px] theme-text-muted">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300/50 shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-gray-300/50 rounded-full"></div>
                      <div className="h-2 w-1/3 bg-gray-200/50 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div
                className="divide-y"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                {notifications.map((notif) => {
                  const actor = actors[notif.actor_id]
                  const link = getNotificationLink(notif)
                  return (
                    <Link
                      key={notif.id}
                      href={link}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-white/40 ${
                        !notif.is_read ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <div className="relative shrink-0">
                        <UserAvatar
                          userId={notif.actor_id}
                          name={actor?.full_name}
                          avatarUrl={actor?.avatar_url}
                          size="md"
                          clickable={false}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] shadow-md ring-1 ring-black/5">
                          {getNotificationIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm theme-text-primary leading-snug">
                          <span className="font-bold">
                            {actor?.full_name || 'Someone'}
                          </span>{' '}
                          <span className="theme-text-secondary">
                            {getNotificationText(notif)}
                          </span>
                        </p>
                        <p className="text-[11px] theme-text-muted mt-1">
                          {timeAgo(notif.created_at)} ago
                        </p>
                      </div>

                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-2 animate-pulse"></span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="text-sm font-semibold theme-text-primary mb-1">
                  No notifications yet
                </p>
                <p className="text-xs theme-text-muted">
                  When someone follows, likes, or comments — you&apos;ll see
                  it here
                </p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div
              className="border-t"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                View All Notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}