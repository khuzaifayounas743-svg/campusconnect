'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import CommentItem from './comment-item'

type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  likes: { count: number }[]
  comment_likes: { count: number }[]
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
}

export default function CommentSection({
  postId,
  currentUserId,
  onCommentAdded,
  highlightCommentId = null,
}: {
  postId: string
  currentUserId: string
  onCommentAdded?: () => void
  highlightCommentId?: string | null
}) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchComments = async () => {
    setFetching(true)

    const { data: commentsData } = await supabase
      .from('comments')
      .select(`*, comment_likes(count)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!commentsData) {
      setFetching(false)
      return
    }

    // Fetch profiles for all comment users
    const userIds = [...new Set(commentsData.map((c) => c.user_id))]
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds)

      const profilesMap: Record<string, Profile> = {}
      profilesData?.forEach((p) => {
        profilesMap[p.id] = p
      })
      setProfiles(profilesMap)
    }

    // Fetch user's comment likes
    const { data: likesData } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', currentUserId)

    setUserLikes(new Set(likesData?.map((l) => l.comment_id) || []))
    setComments(commentsData as Comment[])
    setFetching(false)
  }

  useEffect(() => {
  fetchComments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [postId])

// 🔑 Scroll to highlighted comment
useEffect(() => {
  if (!highlightCommentId || fetching) return

  const timer = setTimeout(() => {
    const element = document.getElementById(`comment-${highlightCommentId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('comment-highlighted')
      setTimeout(() => {
        element.classList.remove('comment-highlighted')
      }, 3000)
    }
  }, 400)

  return () => clearTimeout(timer)
}, [highlightCommentId, fetching])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || loading) return

    setLoading(true)
    const content = newComment.trim()
    setNewComment('')

    // Optimistic add
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: currentUserId,
      content,
      parent_id: null,
      created_at: new Date().toISOString(),
      likes: [{ count: 0 }],
      comment_likes: [{ count: 0 }],
    }
    setComments((prev) => [...prev, optimisticComment])

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUserId,
      content,
      parent_id: null,
    })

    if (error) {
      alert('Comment failed: ' + error.message)
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id))
      setNewComment(content)
    } else {
      await fetchComments()
      // 🔑 FIX: Notify parent so comment count updates
      if (onCommentAdded) onCommentAdded()
    }
    setLoading(false)
  }

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parent_id)

  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId)

  return (
    <div className="border-t" style={{ borderColor: 'var(--border-primary)' }}>
      <div className="p-5">
        {/* Comment input */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {profiles[currentUserId]?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={newComment ? 3 : 1}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-2xl text-sm resize-none outline-none theme-input transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e)
                }
              }}
            />
            {newComment && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs theme-text-muted">
                  {newComment.length}/500 · Ctrl+Enter to post
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="px-4 py-1.5 text-xs font-semibold theme-btn-primary rounded-lg disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Comments list */}
        {fetching ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-300/50"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-300/50 rounded-full"></div>
                  <div className="h-3 w-3/4 bg-gray-200/50 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topLevelComments.length > 0 ? (
          <div className="space-y-4">
            {topLevelComments.map((comment) => (
  <div
    key={`${comment.id}-${comment.content}`}
    id={`comment-${comment.id}`}
    className="rounded-2xl transition-all duration-500"
  >
    <CommentItem
      comment={comment}
      replies={getReplies(comment.id)}
      profiles={profiles}
      currentUserId={currentUserId}
      userLikes={userLikes}
      onRefresh={fetchComments}
    />
  </div>
))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm font-semibold theme-text-primary mb-1">
              No comments yet
            </p>
            <p className="text-xs theme-text-muted">
              Be the first to share your thoughts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}