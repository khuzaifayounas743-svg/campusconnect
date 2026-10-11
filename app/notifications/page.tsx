import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserAvatar from '@/components/user-avatar'
import ThemeSwitcher from '@/components/theme-switcher'
import BackButton from '@/app/profile/[id]/back-button'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')

  // Fetch all notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch actors
  const actorIds = [...new Set(notifications?.map((n) => n.actor_id) || [])]
  let actors: Record<string, any> = {}

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', actorIds)

    profiles?.forEach((p) => {
      actors[p.id] = p
    })
  }

  // Mark all as read when viewing this page
  if (notifications && notifications.length > 0) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false)
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  const getText = (type: string) => {
    switch (type) {
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

  const getIcon = (type: string) => {
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

  const getLink = (notif: any) => {
    if (notif.type === 'follow') return `/profile/${notif.actor_id}`
    if (notif.post_id) return `/dashboard?post=${notif.post_id}`
    return '/dashboard'
  }

  return (
    <main className="relative min-h-screen overflow-hidden theme-bg">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
          style={{ backgroundColor: 'var(--blob-1)' }}
        ></div>
        <div
          className="absolute bottom-0 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"
          style={{ backgroundColor: 'var(--blob-2)' }}
        ></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 theme-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <span className="text-xl">🎓</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden md:block">
              CampusConnect
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BackButton />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            🔔 Notifications
          </h1>
          <p className="text-sm theme-text-secondary">
            {notifications?.length || 0} notification
            {notifications?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="theme-card rounded-3xl shadow-xl overflow-hidden">
            <div
              className="divide-y"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              {notifications.map((notif) => {
                const actor = actors[notif.actor_id]
                return (
                  <Link
                    key={notif.id}
                    href={getLink(notif)}
                    className="flex gap-4 px-5 py-4 hover:bg-white/40 transition-colors"
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
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm theme-text-primary leading-snug">
                        <span className="font-bold">
                          {actor?.full_name || 'Someone'}
                        </span>{' '}
                        <span className="theme-text-secondary">
                          {getText(notif.type)}
                        </span>
                      </p>
                      <p className="text-xs theme-text-muted mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="theme-card rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl">🔔</span>
            </div>
            <h2 className="text-xl font-bold theme-text-primary mb-2">
              No notifications yet
            </h2>
            <p className="theme-text-secondary text-sm">
              When someone follows, likes, or comments — you'll see it here.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}