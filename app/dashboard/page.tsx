import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNavbar from '@/components/app-navbar'
import AppSidebar from '@/components/app-sidebar'
import WelcomeBanner from '@/components/welcome-banner'
import TopUsersWidget from '@/components/top-users-widget'
import PostListClient from '@/components/post-list-client'
import CreatePostButton from './create-post-button'
import AIChatbot from '@/components/ai-chatbot'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

   // Get current user's university
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('university')
    .eq('id', user.id)
    .single()

  const userUniversity = userProfile?.university

  // Fetch all posts with author university info
  const { data: allPosts } = await supabase
    .from('posts')
    .select(`*, likes(count), comments(count)`)
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch author universities for all posts
  const authorIds = [...new Set((allPosts || []).map((p) => p.user_id))]
  const { data: authors } = await supabase
    .from('profiles')
    .select('id, university, program, semester, full_name')
    .in('id', authorIds)

  const authorMap: Record<string, any> = {}
  authors?.forEach((a) => {
    authorMap[a.id] = a
  })

  // Sort posts: same university first, then rest
  const posts = (allPosts || [])
    .map((post) => ({
      ...post,
      author_university: authorMap[post.user_id]?.university || null,
      author_program: authorMap[post.user_id]?.program || null,
      author_semester: authorMap[post.user_id]?.semester || null,
    }))
    .sort((a, b) => {
      const aSameUni = a.author_university === userUniversity ? 1 : 0
      const bSameUni = b.author_university === userUniversity ? 1 : 0
      if (aSameUni !== bSameUni) return bSameUni - aSameUni
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    })

  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  const userName = user.user_metadata?.full_name?.split(' ')[0] || 'Student'
  const postsCount = posts?.length || 0

  return (
    <div className="min-h-screen cc-bg">
      {/* Top Navbar */}
      <AppNavbar user={user} />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <AppSidebar user={user} />

          {/* Middle Feed — WIDER */}
          <main className="flex-1 min-w-0">
            {/* Welcome Banner (simple text) */}
            <WelcomeBanner
              userName={userName}
              postsCount={postsCount}
              likedCount={likedPostIds.size}
            />

            {/* Feed Header */}
            <div className="mb-4">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--cc-text)' }}
              >
                📰 Campus Feed
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--cc-text-secondary)' }}
              >
                Latest events and announcements from your campus
              </p>
            </div>

            {/* Posts */}
            {posts && posts.length > 0 ? (
              <PostListClient
                posts={posts}
                currentUserId={user.id}
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
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[var(--cc-hover)] flex items-center justify-center animate-float">
                  <span className="text-5xl">📭</span>
                </div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ color: 'var(--cc-text)' }}
                >
                  No posts yet
                </h2>
                <p
                  className="mb-8 max-w-md mx-auto leading-relaxed"
                  style={{ color: 'var(--cc-text-secondary)' }}
                >
                  Be the first to share an event, hackathon, or opportunity
                  with your campus community. Let&apos;s get started!
                </p>
                <CreatePostButton big />
              </div>
            )}

            {/* Footer indicator */}
            <div className="text-center py-10 mt-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{
                  backgroundColor: 'var(--cc-surface)',
                  borderColor: 'var(--cc-border)',
                }}
              >
                <span className="text-sm">✨</span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--cc-text-muted)' }}
                >
                  You&apos;re all caught up
                </span>
              </div>
            </div>
          </main>

          {/* Right Sidebar — only Who to Follow */}
          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              <TopUsersWidget currentUserId={user.id} />
            </div>
          </aside>
        </div>
      </div>

      {/* AI Chatbot */}
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