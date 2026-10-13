'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import CommentSection from './comment-section'
import ImageViewer from './image-viewer'
import ShareMenu from './share-menu'
import PostMenu from './post-menu'
import UserAvatar from '@/components/user-avatar'
import FollowButton from '@/components/follow-button'
import Link from 'next/link'

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

type Author = {
  id: string
  full_name: string | null
  avatar_url: string | null
  university: string | null
  program: string | null
  semester: string | null
}

export default function PostCard({
  post,
  currentUserId,
  initialLiked,
  showAuthor = true,
  autoOpenComments = false,
  highlightCommentId = null,
}: {
  post: Post
  currentUserId: string
  initialLiked: boolean
  showAuthor?: boolean
  autoOpenComments?: boolean
  highlightCommentId?: string | null
}) {
  const supabase = createClient()
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(post.likes?.[0]?.count || 0)
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(autoOpenComments)
  const [commentCount, setCommentCount] = useState(
    post.comments?.[0]?.count || 0
  )
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [author, setAuthor] = useState<Author | null>(null)
  const [timeText, setTimeText] = useState<string>('')

  const isOwnPost = post.user_id === currentUserId

  // Fetch author info with university + program
  useEffect(() => {
    if (!showAuthor) return
    const fetchAuthor = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, university, program, semester')
        .eq('id', post.user_id)
        .single()
      if (data) setAuthor(data)
    }
    fetchAuthor()
  }, [post.user_id, showAuthor, supabase])

  // Client-only time
  useEffect(() => {
    const computeTime = () => {
      const seconds = Math.floor(
        (new Date().getTime() - new Date(post.created_at).getTime()) / 1000
      )
      if (seconds < 60) return 'just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
      return new Date(post.created_at).toLocaleDateString()
    }

    setTimeText(computeTime())
    const interval = setInterval(() => {
      setTimeText(computeTime())
    }, 60000)

    return () => clearInterval(interval)
  }, [post.created_at])

  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('feedScrollPosition', window.scrollY.toString())
    }
  }

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    if (liked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
      if (!error) {
        setLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: currentUserId })
      if (!error) {
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
    }
    setLoading(false)
  }

  const formatEventDate = (date: string) => {
    const d = new Date(date)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const month = months[d.getUTCMonth()]
    const day = d.getUTCDate()
    const year = d.getUTCFullYear()
    let hours = d.getUTCHours()
    const minutes = d.getUTCMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const minStr = minutes.toString().padStart(2, '0')
    return {
      date: `${month} ${day}, ${year}`,
      time: `${hours}:${minStr} ${ampm}`,
    }
  }

  // Shorten university name (COMSATS University - Lahore → COMSATS)
  const shortUniversity = author?.university?.split(' - ')[0] || null

  return (
    <>
      <article className="theme-card rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* ============ AUTHOR HEADER ============ */}
        {showAuthor && (
          <div
            className="px-6 py-4 flex items-center gap-3 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div onClick={saveScrollPosition}>
              <UserAvatar
                userId={post.user_id}
                name={author?.full_name}
                avatarUrl={author?.avatar_url}
                size="md"
              />
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${post.user_id}`}
                onClick={saveScrollPosition}
                className="font-bold theme-text-primary hover:gradient-text transition-colors text-sm truncate block"
              >
                {author?.full_name || 'User'}
              </Link>
              <div className="flex items-center gap-1.5 text-xs theme-text-muted flex-wrap">
                {shortUniversity && (
                  <span className="inline-flex items-center gap-0.5 truncate">
                    🎓 {shortUniversity}
                  </span>
                )}
                {author?.program && (
                  <>
                    <span>·</span>
                    <span className="truncate">{author.program}</span>
                  </>
                )}
              </div>
              <p className="text-xs theme-text-muted mt-0.5">
                {timeText || '...'}
              </p>
            </div>

            {!isOwnPost && (
              <FollowButton
                targetUserId={post.user_id}
                currentUserId={currentUserId}
                size="sm"
              />
            )}

            <PostMenu post={post} currentUserId={currentUserId} />
          </div>
        )}

        {/* ============ IMAGE ============ */}
        {post.image_url && (
          <div
            className="relative w-full bg-black/5 cursor-pointer group overflow-hidden"
            onClick={() => setShowImageViewer(true)}
          >
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full max-h-[28rem] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md rounded-full p-3 shadow-2xl">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ============ CONTENT ============ */}
        <div className="p-6">
          {post.category && post.category !== 'general' && (
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full mb-3">
              {post.category.toUpperCase()}
            </span>
          )}

          <h2 className="text-xl font-bold theme-text-primary mb-2">
            {post.title}
          </h2>

          <p className="theme-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
            {post.description}
          </p>

          {(post.event_date || post.venue || post.city) && (
            <div className="flex flex-wrap gap-2 mb-4 text-sm">
              {post.event_date && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                  📅 {formatEventDate(post.event_date).date} at{' '}
                  {formatEventDate(post.event_date).time}
                </span>
              )}
              {post.venue && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium">
                  📍 {post.venue}
                </span>
              )}
              {post.city && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium">
                  🌆 {post.city}
                </span>
              )}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ============ ACTIONS ============ */}
          <div
            className="flex items-center justify-between pt-4 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleLike}
                disabled={loading}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  liked
                    ? 'bg-rose-50 text-rose-600'
                    : 'theme-text-secondary hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
                <span>{likeCount}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  showComments
                    ? 'bg-blue-50 text-blue-600'
                    : 'theme-text-secondary hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="text-lg">💬</span>
                <span>{commentCount}</span>
              </button>

              <ShareMenu postId={post.id} postTitle={post.title} />
            </div>

            {!showAuthor && (
              <span className="text-xs theme-text-muted">
                {timeText || '...'}
              </span>
            )}
          </div>
        </div>

        {/* ============ COMMENTS ============ */}
        {showComments && (
          <CommentSection
            postId={post.id}
            currentUserId={currentUserId}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
            highlightCommentId={highlightCommentId}
          />
        )}
      </article>

      {/* ============ IMAGE VIEWER ============ */}
      {showImageViewer && post.image_url && (
        <ImageViewer
          src={post.image_url}
          alt={post.title}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </>
  )
}