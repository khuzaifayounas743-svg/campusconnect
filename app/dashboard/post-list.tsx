'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from './post-card'

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

export default function PostList({
  posts,
  currentUserId,
  likedPostIds,
  showAuthor = true,
}: {
  posts: Post[]
  currentUserId: string
  likedPostIds: string[]
  showAuthor?: boolean
}) {
  const searchParams = useSearchParams()
  const postId = searchParams.get('post')
  const shouldOpenComments = searchParams.get('comments') === 'true'
  const highlightCommentId = searchParams.get('highlight')
  const [highlightedPost, setHighlightedPost] = useState<string | null>(null)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    if (!postId || hasScrolled) return

    const timer = setTimeout(() => {
      const element = document.getElementById(`post-${postId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedPost(postId)
        setHasScrolled(true)

        setTimeout(() => {
          setHighlightedPost(null)
        }, 3000)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [postId, hasScrolled])

  const likedSet = new Set(likedPostIds)

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <div
          key={post.id}
          id={`post-${post.id}`}
          className={`rounded-3xl transition-all duration-700 ${
            highlightedPost === post.id
              ? 'ring-4 ring-indigo-400/60 ring-offset-2 ring-offset-transparent scale-[1.02]'
              : ''
          }`}
        >
          <PostCard
            post={post}
            currentUserId={currentUserId}
            initialLiked={likedSet.has(post.id)}
            showAuthor={showAuthor}
            autoOpenComments={shouldOpenComments && post.id === postId}
            highlightCommentId={
              post.id === postId ? highlightCommentId : null
            }
          />
        </div>
      ))}
    </div>
  )
}