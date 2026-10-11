'use client'

import { useState } from 'react'
import CreatePostModal from './create-post-modal'

export default function CreatePostButton({ big = false }: { big?: boolean }) {
  const [open, setOpen] = useState(false)

  if (big) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="btn-shine px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30"
        >
          ✏️ Create First Post
        </button>
        {open && <CreatePostModal onClose={() => setOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-shine px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2"
      >
        <span className="text-base">✏️</span>
        <span className="hidden sm:inline">Create Post</span>
      </button>
      {open && <CreatePostModal onClose={() => setOpen(false)} />}
    </>
  )
}