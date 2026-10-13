'use client'

import { useState } from 'react'

const TABS = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'event', label: 'Events', icon: '📅' },
  { id: 'hackathon', label: 'Hackathons', icon: '💻' },
  { id: 'workshop', label: 'Workshops', icon: '🛠️' },
  { id: 'opportunity', label: 'Opportunities', icon: '💼' },
]

export default function FeedTabs({
  activeTab,
  onChange,
}: {
  activeTab: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              backgroundColor: isActive
                ? 'var(--cc-primary)'
                : 'var(--cc-surface)',
              color: isActive ? 'white' : 'var(--cc-text-secondary)',
              borderWidth: 1,
              borderColor: isActive ? 'var(--cc-primary)' : 'var(--cc-border)',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}