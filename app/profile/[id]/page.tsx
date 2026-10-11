import BackButton from './back-button'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PostList from '@/app/dashboard/post-list'
import ProfileHeader from './profile-header'
import ThemeSwitcher from '@/components/theme-switcher'
import NotificationBell from '@/components/notification-bell'
import SidebarController from '@/components/sidebar-controller'
import FeedLayout from '@/components/feed-layout'
import AIChatbot from '@/components/ai-chatbot'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select(`*, likes(count), comments(count)`)
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', id)

  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', currentUser.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  const isOwnProfile = currentUser.id === id

  return (
    <main className="relative min-h-screen overflow-hidden theme-bg">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
          style={{ backgroundColor: 'var(--blob-1)' }}
        ></div>
        <div
          className="absolute bottom-0 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"
          style={{ backgroundColor: 'var(--blob-2)' }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BackButton />
            <NotificationBell currentUserId={currentUser.id} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <FeedLayout
          sidebar={<SidebarController currentUserId={currentUser.id} />}
        >
          <ProfileHeader
            profile={profile}
            currentUserId={currentUser.id}
            followersCount={followersCount || 0}
            followingCount={followingCount || 0}
            postsCount={posts?.length || 0}
            isOwnProfile={isOwnProfile}
          />

          {/* Posts Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold theme-text-primary">
                📝 Posts ({posts?.length || 0})
              </h2>
            </div>

            {posts && posts.length > 0 ? (
              <PostList
                posts={posts}
                currentUserId={currentUser.id}
                likedPostIds={[...likedPostIds]}
                showAuthor={false}
              />
            ) : (
              <div className="theme-card rounded-3xl p-12 text-center shadow-xl">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-lg font-bold theme-text-primary mb-2">
                  No posts yet
                </h3>
                <p className="theme-text-secondary text-sm max-w-md mx-auto">
                  {isOwnProfile
                    ? "You haven't posted anything yet. Share your first event with the community!"
                    : `${profile.full_name || 'This user'} hasn't posted anything yet.`}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 theme-btn-primary rounded-2xl font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <span>✏️</span>
                    <span>Create Your First Post</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </FeedLayout>
      </div>
          {/* AI Chatbot */}
      <AIChatbot />

      {/* Footer */}
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