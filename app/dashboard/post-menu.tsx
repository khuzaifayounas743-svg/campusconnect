'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import EditPostModal from './edit-post-modal'

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
}

export default function PostMenu({
  post,
  currentUserId,
  onDeleted,
}: {
  post: Post
  currentUserId: string
  onDeleted?: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isOwnPost = post.user_id === currentUserId

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () =>
        document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleDelete = async () => {
    setDeleting(true)

    // Delete image from storage (if exists)
    if (post.image_url) {
      try {
        // Extract file path from URL
        const urlParts = post.image_url.split('/post-images/')
        if (urlParts[1]) {
          await supabase.storage.from('post-images').remove([urlParts[1]])
        }
      } catch {
        // Ignore storage errors
      }
    }

    // Delete post from database
    const { error } = await supabase.from('posts').delete().eq('id', post.id)

    if (error) {
      alert('Delete failed: ' + error.message)
      setDeleting(false)
      return
    }

    setDeleting(false)
    setShowDeleteDialog(false)
    onDeleted?.()
    router.refresh()
  }

  // Don't show menu for non-owners
  if (!isOwnPost) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* 3-dot button */}
        <button
          onClick={() => setOpen(!open)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            open
              ? 'bg-indigo-50 text-indigo-600'
              : 'theme-text-muted hover:bg-white/60 hover:theme-text-primary'
          }`}
          aria-label="Post options"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 rounded-2xl theme-card shadow-2xl ring-1 ring-black/5 p-1.5 z-50 animate-scale-in">
            {/* Edit */}
            <button
              onClick={() => {
                setOpen(false)
                setShowEditModal(true)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
            >
              <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-xs">
                ✏️
              </span>
              <span className="flex-1 text-left">Edit Post</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                setOpen(false)
                setShowDeleteDialog(true)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
            >
              <span className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-xs">
                🗑️
              </span>
              <span className="flex-1 text-left">Delete Post</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
          onClick={() => !deleting && setShowDeleteDialog(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center">
              <span className="text-3xl">🗑️</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Delete this post?
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-slate-300 text-center mb-6 leading-relaxed">
              This action cannot be undone. The post, its likes, and comments
              will be permanently deleted.
            </p>

            {/* Post preview */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-3 mb-6">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {post.title}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-1">
                {post.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="flex-1 px-5 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}