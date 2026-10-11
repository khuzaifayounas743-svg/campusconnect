'use client'

import { useState, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'campusconnect-sidebar-closed'

export default function FeedLayout({
  children,
  sidebar,
}: {
  children: ReactNode
  sidebar: ReactNode
}) {
  const [closed, setClosed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const checkState = () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      setClosed(saved === 'true')
    }

    checkState()

    window.addEventListener('storage', checkState)
    window.addEventListener('sidebar-toggle', checkState)

    return () => {
      window.removeEventListener('storage', checkState)
      window.removeEventListener('sidebar-toggle', checkState)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">{children}</div>
        {sidebar}
      </div>
    )
  }

  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        closed
          ? 'max-w-2xl mx-auto w-full'
          : 'grid grid-cols-1 lg:grid-cols-3 gap-6'
      }`}
    >
      <div className={`transition-all duration-500 ${closed ? 'w-full' : 'lg:col-span-2'}`}>
        {children}
      </div>
      {!closed && <div className="animate-fade-in-up">{sidebar}</div>}
    </div>
  )
}