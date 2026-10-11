import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserAvatar from '@/components/user-avatar'
import FollowButton from '@/components/follow-button'
import ThemeSwitcher from '@/components/theme-switcher'
import NotificationBell from '@/components/notification-bell'
import BackButton from '@/app/profile/[id]/back-button'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')

  // Fetch matching users (email NOT fetched — privacy)
  let users: any[] = []
  if (query.length >= 2) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, university')
      .or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,university.ilike.%${query}%`
      )
      .neq('id', currentUser.id)
      .limit(30)

    users = data || []
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
            <NotificationBell currentUserId={currentUser.id} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            🔍 Search Results
          </h1>
          {query && (
            <p className="text-sm theme-text-secondary">
              {users.length} result{users.length !== 1 ? 's' : ''} for{' '}
              <span className="font-semibold gradient-text">
                &quot;{query}&quot;
              </span>
            </p>
          )}
        </div>

        {!query || query.length < 2 ? (
          <div className="theme-card rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl">🔎</span>
            </div>
            <h2 className="text-xl font-bold theme-text-primary mb-2">
              Search for users
            </h2>
            <p className="theme-text-secondary text-sm">
              Type at least 2 characters to find users by name or university.
            </p>
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="theme-card rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
              >
                <Link
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <UserAvatar
                    userId={u.id}
                    name={u.full_name}
                    avatarUrl={u.avatar_url}
                    size="md"
                    clickable={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold theme-text-primary truncate">
                      {u.full_name || 'User'}
                    </p>
                    {/* University — public, Email — hidden */}
                    {u.university && (
                      <p className="text-xs theme-text-secondary truncate">
                        🎓 {u.university}
                      </p>
                    )}
                  </div>
                </Link>
                <FollowButton
                  targetUserId={u.id}
                  currentUserId={currentUser.id}
                  size="sm"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="theme-card rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl">😔</span>
            </div>
            <h2 className="text-xl font-bold theme-text-primary mb-2">
              No users found
            </h2>
            <p className="theme-text-secondary text-sm">
              Try a different name or university.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}