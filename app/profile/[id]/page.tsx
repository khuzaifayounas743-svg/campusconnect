import BackButton from './back-button'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import AppSidebar from '@/components/app-sidebar'
import TopUsersWidget from '@/components/top-users-widget'
import PostListClient from '@/components/post-list-client'
import ProfileHeader from './profile-header'
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
    <div className="min-h-screen cc-bg">
      <AppNavbar user={currentUser} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <AppSidebar user={currentUser} />

          {/* Middle Column — WIDER */}
          <main className="flex-1 min-w-0">
            {/* Back Button (Mobile) */}
            <div className="lg:hidden mb-4">
              <BackButton />
            </div>

            <ProfileHeader
              profile={profile}
              currentUserId={currentUser.id}
              followersCount={followersCount || 0}
              followingCount={followingCount || 0}
              postsCount={posts?.length || 0}
              isOwnProfile={isOwnProfile}
            />

            {/* Posts */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--cc-text)' }}
                >
                  📝 Posts ({posts?.length || 0})
                </h2>
              </div>

              {posts && posts.length > 0 ? (
                <PostListClient
                  posts={posts}
                  currentUserId={currentUser.id}
                  likedPostIds={[...likedPostIds]}
                />
              ) : (
                <div
                  className="rounded-3xl p-12 text-center shadow-sm border"
                  style={{
                    backgroundColor: 'var(--cc-surface)',
                    borderColor: 'var(--cc-border)',
                  }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-[var(--cc-hover)] flex items-center justify-center">
                    <span className="text-4xl">📭</span>
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: 'var(--cc-text)' }}
                  >
                    No posts yet
                  </h3>
                  <p
                    className="text-sm max-w-md mx-auto"
                    style={{ color: 'var(--cc-text-secondary)' }}
                  >
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
          </main>

          {/* Right Sidebar — only Who to Follow */}
          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              <TopUsersWidget currentUserId={currentUser.id} />
            </div>
          </aside>
        </div>
      </div>

      <AIChatbot />

      {/* Footer */}
      <footer
        className="border-t mt-16 py-6"
        style={{
          backgroundColor: 'var(--cc-surface)',
          borderColor: 'var(--cc-border)',
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--cc-text-muted)' }}>
            © 2025 CampusConnect. All rights reserved.
          </p>
          <p
            className="text-xs flex items-center gap-1.5"
            style={{ color: 'var(--cc-text-muted)' }}
          >
            Developed by
            <span
              className="font-bold"
              style={{ color: 'var(--cc-primary)' }}
            >
              Khuzaifa Younas
            </span>
            <span className="text-rose-500">❤️</span>
          </p>
        </div>
      </footer>
    </div>
  )
}