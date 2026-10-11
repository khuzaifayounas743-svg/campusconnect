'use client'

import UserAvatar from '@/components/user-avatar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

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

export default function CommentItem({
  comment,
  replies,
  profiles,
  currentUserId,
  userLikes,
  onRefresh,
  isReply = false,
}: {
  comment: Comment
  replies: Comment[]
  profiles: Record<string, Profile>
  currentUserId: string
  userLikes: Set<string>
  onRefresh: () => void
  isReply?: boolean
}) {
  const supabase = createClient()
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [replyLoading, setReplyLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [liked, setLiked] = useState(userLikes.has(comment.id))
  const [likeCount, setLikeCount] = useState(
    comment.comment_likes?.[0]?.count || 0
  )
  // 🔑 Client-only time string
  const [timeText, setTimeText] = useState<string>('')

  const author = profiles[comment.user_id]
  const isOwn = comment.user_id === currentUserId

  // Sync editText with comment content
  useEffect(() => {
    setEditText(comment.content)
  }, [comment.content])

  // Sync liked state
  useEffect(() => {
    setLiked(userLikes.has(comment.id))
  }, [userLikes, comment.id])

  // 🔑 Compute timeAgo client-side only
  useEffect(() => {
    const computeTime = () => {
      const seconds = Math.floor(
        (new Date().getTime() - new Date(comment.created_at).getTime()) / 1000
      )
      if (seconds < 60) return 'just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
      return new Date(comment.created_at).toLocaleDateString()
    }

    setTimeText(computeTime())

    const interval = setInterval(() => {
      setTimeText(computeTime())
    }, 60000)

    return () => clearInterval(interval)
  }, [comment.created_at])

  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('feedScrollPosition', window.scrollY.toString())
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || replyLoading) return

    setReplyLoading(true)
    const content = replyText.trim()
    setReplyText('')

    const { error } = await supabase.from('comments').insert({
      post_id: comment.post_id,
      user_id: currentUserId,
      content,
      parent_id: comment.id,
    })

    if (error) {
      alert('Reply failed: ' + error.message)
      setReplyText(content)
    } else {
      setShowReplyBox(false)
      await onRefresh()
    }
    setReplyLoading(false)
  }

  const handleEdit = async () => {
    const trimmed = editText.trim()
    if (!trimmed) {
      alert('Comment cannot be empty')
      return
    }
    if (trimmed === comment.content) {
      setEditing(false)
      return
    }

    const { error } = await supabase
      .from('comments')
      .update({ content: trimmed })
      .eq('id', comment.id)

    if (error) {
      alert('Edit failed: ' + error.message)
    } else {
      comment.content = trimmed
      setEditing(false)
      await onRefresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id)
    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      await onRefresh()
    }
  }

  const handleLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)

    if (liked) {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', comment.id)
        .eq('user_id', currentUserId)
      if (!error) {
        setLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
      }
    } else {
      const { error } = await supabase
        .from('comment_likes')
        .insert({ comment_id: comment.id, user_id: currentUserId })
      if (!error) {
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
    }
    setLikeLoading(false)
  }

  return (
    <div>
      <div className="flex gap-3">
        {/* Avatar */}
        <div onClick={saveScrollPosition}>
          <UserAvatar
            userId={comment.user_id}
            name={author?.full_name}
            avatarUrl={author?.avatar_url}
            size="sm"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-full px-4 py-2.5 rounded-2xl theme-input">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${comment.user_id}`}
                onClick={saveScrollPosition}
                className="font-semibold text-sm theme-text-primary hover:gradient-text transition-colors"
              >
                {author?.full_name || 'User'}
              </Link>
              {isOwn && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold uppercase">
                  You
                </span>
              )}
            </div>

            {editing ? (
              <div className="space-y-2 min-w-[200px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  maxLength={500}
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-xl resize-none outline-none theme-input"
                />
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handleEdit}
                    className="text-xs font-semibold px-3 py-1 theme-btn-primary rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditText(comment.content)
                    }}
                    className="text-xs font-semibold theme-text-secondary px-3 py-1"
                  >
                    Cancel
                  </button>
                  <span className="text-[10px] theme-text-muted ml-auto">
                    {editText.length}/500
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm theme-text-primary whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5 px-1 flex-wrap">
            <span className="text-xs theme-text-muted">
              {timeText || '...'}
            </span>

            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                liked
                  ? 'text-rose-500'
                  : 'theme-text-muted hover:text-rose-500'
              }`}
            >
              {liked ? '❤️' : '🤍'} {likeCount > 0 && likeCount}
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-xs font-semibold theme-text-muted hover:gradient-text transition-colors"
              >
                {showReplyBox ? 'Cancel' : 'Reply'}
              </button>
            )}

            {isOwn && !editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs font-semibold theme-text-muted hover:gradient-text transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs font-semibold theme-text-muted hover:text-rose-500 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Reply box */}
          {showReplyBox && !isReply && (
            <form
              onSubmit={handleReply}
              className="mt-3 flex gap-2 animate-fade-in-up"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${author?.full_name || 'user'}...`}
                maxLength={500}
                autoFocus
                className="flex-1 px-3 py-2 text-sm rounded-xl outline-none theme-input"
              />
              <button
                type="submit"
                disabled={replyLoading || !replyText.trim()}
                className="px-3 py-2 text-xs font-semibold theme-btn-primary rounded-xl disabled:opacity-50"
              >
                {replyLoading ? '...' : 'Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyBox(false)
                  setReplyText('')
                }}
                className="px-3 py-2 text-xs font-semibold theme-text-muted"
              >
                ✕
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div
          className="ml-12 mt-3 pl-3 space-y-3 border-l-2"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              profiles={profiles}
              currentUserId={currentUserId}
              userLikes={userLikes}
              onRefresh={onRefresh}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}