import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNavbar from '@/components/app-navbar'
import AppSidebar from '@/components/app-sidebar'
import TopUsersWidget from '@/components/top-users-widget'
import PostCard from '@/app/dashboard/post-card'
import AIChatbot from '@/components/ai-chatbot'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('posts')
    .select(`*, likes(count), comments(count)`)
    .eq('category', 'event')
    .order('event_date', { ascending: true, nullsFirst: false })

  const { data: userLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  return (
    <div className="min-h-screen cc-bg">
      <AppNavbar user={user} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          <AppSidebar user={user} />

          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--cc-text)' }}
              >
                📅 All Events
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--cc-text-secondary)' }}
              >
                {events?.length || 0} event
                {events?.length !== 1 ? 's' : ''} happening on campus
              </p>
            </div>

            {events && events.length > 0 ? (
              <div className="space-y-5">
                {events.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    initialLiked={likedPostIds.has(post.id)}
                  />
                ))}
              </div>
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
                  No events yet
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--cc-text-secondary)' }}
                >
                  Events will appear here once posted.
                </p>
              </div>
            )}
          </main>

          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              <TopUsersWidget currentUserId={user.id} />
            </div>
          </aside>
        </div>
      </div>

      <AIChatbot />
    </div>
  )
}