'use client'

import { useState } from 'react'
import FeedTabs from './feed-tabs'
import PostCard from '@/app/dashboard/post-card'

type Post = {
  id: string
  user_id: string
  title: string
  description: string
  category: string | null
  image_url: string | null
  event_date: string | null
  venue: string | null
  city: string | null
  university: string | null
  tags: string[] | null
  created_at: string
  likes: { count: number }[]
  comments: { count: number }[]
}

export default function PostListClient({
  posts,
  currentUserId,
  likedPostIds,
}: {
  posts: Post[]
  currentUserId: string
  likedPostIds: string[]
}) {
  const [activeTab, setActiveTab] = useState('all')

  const likedSet = new Set(likedPostIds)

  const filteredPosts =
    activeTab === 'all'
      ? posts
      : posts.filter((post) => post.category === activeTab)

  return (
    <div className="space-y-5">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Posts */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              initialLiked={likedSet.has(post.id)}
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
            <span className="text-4xl">🔍</span>
          </div>
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: 'var(--cc-text)' }}
          >
            No {activeTab === 'all' ? 'posts' : activeTab + 's'} yet
          </h3>
          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: 'var(--cc-text-secondary)' }}
          >
            {activeTab === 'all'
              ? "Be the first to share something with your campus!"
              : `No ${activeTab}s found. Check back later!`}
          </p>
        </div>
      )}
    </div>
  )
}