'use client'

import { useState, useEffect } from 'react'
import SuggestedUsers from './suggested-users'

const STORAGE_KEY = 'campusconnect-sidebar-closed'

export default function SidebarController({
  currentUserId,
}: {
  currentUserId: string
}) {
  const [closed, setClosed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'true') setClosed(true)
  }, [])

  const handleShow = () => {
    setClosed(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'false')
      window.dispatchEvent(new Event('sidebar-toggle'))
    }
  }

  const handleClose = () => {
    setClosed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
      window.dispatchEvent(new Event('sidebar-toggle'))
    }
  }

  if (!mounted) return null

  // CLOSED — show small "Show Suggestions" button
  if (closed) {
    return (
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24">
          <button
            onClick={handleShow}
            className="w-full theme-card rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">👥</span>
              <span className="text-sm font-bold theme-text-primary group-hover:gradient-text transition-colors">
                Show Suggestions
              </span>
            </div>
            <p className="text-xs theme-text-muted">
              Discover new people to follow
            </p>
          </button>
        </div>
      </div>
    )
  }

  // OPEN — full sidebar
  return (
    <div className="hidden lg:block lg:col-span-1">
      <div className="sticky top-24 space-y-4">
        <SuggestedUsers
          currentUserId={currentUserId}
          limit={5}
          onClose={handleClose}
        />
      </div>
    </div>
  )
}