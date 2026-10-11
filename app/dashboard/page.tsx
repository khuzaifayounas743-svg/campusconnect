import NotificationBell from '@/components/notification-bell'
import SearchBar from '@/components/search-bar'
import SidebarController from '@/components/sidebar-controller'
import FeedLayout from '@/components/feed-layout'
import PostList from './post-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreatePostButton from './create-post-button'
import ThemeSwitcher from '@/components/theme-switcher'
import AIChatbot from '@/components/ai-chatbot'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select(`*, likes(count), comments(count)`)
    .order('created_at', { ascending: false })

  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  const userName = user.user_metadata?.full_name?.split(' ')[0] || 'Student'
  const postsCount = posts?.length || 0

  return (
    <main className="relative min-h-screen overflow-hidden theme-bg">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
          style={{ backgroundColor: 'var(--blob-1)' }}
        ></div>
        <div
          className="absolute top-1/3 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"
          style={{ backgroundColor: 'var(--blob-2)' }}
        ></div>
        <div
          className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"
          style={{ backgroundColor: 'var(--blob-3)' }}
        ></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 theme-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
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

          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <CreatePostButton />

            <Link
              href={`/profile/${user.id}`}
              className="hidden sm:flex items-center gap-2 theme-card rounded-2xl px-3 py-1.5 hover:shadow-lg transition-all"
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full ring-2 ring-indigo-200/60"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold theme-text-primary hidden md:block">
                {userName}
              </span>
            </Link>

            <NotificationBell currentUserId={user.id} />
            <ThemeSwitcher />

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-500/20 transition-all"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <FeedLayout sidebar={<SidebarController currentUserId={user.id} />}>
          {/* Welcome Banner */}
          <Link href={`/profile/${user.id}`} className="block group">
            <div className="theme-card rounded-3xl p-6 mb-8 shadow-xl animate-fade-in-up group-hover:shadow-2xl transition-all">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-14 h-14 rounded-full ring-4 ring-indigo-200/40 shadow-lg shrink-0 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-indigo-200/40 group-hover:scale-105 transition-transform">
                    {userName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold theme-text-primary mb-1 leading-tight">
                    Welcome back,{' '}
                    <span className="gradient-text">{userName}</span> 👋
                  </h1>
                  <p className="text-sm theme-text-secondary">
                    Here&apos;s what&apos;s happening on your campus today
                  </p>
                </div>
                <svg
                  className="w-5 h-5 theme-text-muted group-hover:translate-x-1 transition-transform shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-bold gradient-text">
                    {postsCount}
                  </p>
                  <p className="text-xs theme-text-muted uppercase tracking-wider font-medium">
                    Posts
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-bold gradient-text">
                    {likedPostIds.size}
                  </p>
                  <p className="text-xs theme-text-muted uppercase tracking-wider font-medium">
                    Liked
                  </p>
                </div>
                <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                  <p className="text-2xl font-bold gradient-text">🎓</p>
                  <p className="text-xs theme-text-muted uppercase tracking-wider font-medium">
                    Student
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Feed Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold theme-text-primary mb-1 flex items-center gap-2">
                📰 Campus Feed
              </h2>
              <p className="text-sm theme-text-secondary">
                Latest events and announcements from your campus
              </p>
            </div>
          </div>

          {/* Feed */}
          {posts && posts.length > 0 ? (
            <PostList
              posts={posts}
              currentUserId={user.id}
              likedPostIds={[...likedPostIds]}
            />
          ) : (
            <div className="theme-card rounded-3xl p-12 text-center shadow-xl animate-fade-in-up">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-float">
                <span className="text-5xl">📭</span>
              </div>
              <h2 className="text-2xl font-bold theme-text-primary mb-3">
                No posts yet
              </h2>
              <p className="theme-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                Be the first to share an event, hackathon, or opportunity with
                your campus community. Let&apos;s get started!
              </p>
              <CreatePostButton big />
            </div>
          )}

          {/* Footer indicator */}
          {posts && posts.length > 0 && (
            <div className="text-center py-10 mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 theme-card rounded-full">
                <span className="text-sm">✨</span>
                <span className="text-xs theme-text-muted">
                  You&apos;re all caught up
                </span>
              </div>
            </div>
          )}
        </FeedLayout>
      </div>
       {/* AI Chatbot */}
      <AIChatbot />
      {/* Page Footer */}
      <footer className="relative z-10 theme-header mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs theme-text-muted">
              © 2025 CampusConnect. All rights reserved.
            </p>
            <p className="text-xs theme-text-muted flex items-center gap-1.5">
              Developed by
              <span className="font-bold gradient-text">
                Khuzaifa Younas
              </span>
              <span className="text-rose-500">❤️</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}