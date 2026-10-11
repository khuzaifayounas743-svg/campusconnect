'use client'

import { useTheme } from './theme-provider'
import { useState, useRef, useEffect } from 'react'

const themes = [
  { id: 'light', label: 'Light', icon: '☀️', colors: 'from-yellow-100 to-white' },
  { id: 'dark', label: 'Dark', icon: '🌙', colors: 'from-slate-800 to-slate-900' },
  {
    id: 'sunset',
    label: 'Sunset',
    icon: '🌸',
    colors: 'from-orange-300 to-pink-400',
  },
] as const

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = themes.find((t) => t.id === theme) || themes[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl theme-card hover:shadow-lg transition-all"
        aria-label="Change theme"
      >
        <span className="text-base">{current.icon}</span>
        <span className="hidden md:inline text-xs font-semibold theme-text-primary">
          {current.label}
        </span>
        <svg
          className={`w-3 h-3 theme-text-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl theme-card shadow-2xl ring-1 ring-black/5 p-2 z-50 animate-scale-in">
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">
              Choose Theme
            </p>
          </div>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                theme === t.id
                  ? 'theme-btn-primary shadow-md'
                  : 'theme-text-primary hover:bg-white/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.colors} flex items-center justify-center shadow-sm shrink-0`}
              >
                <span className="text-sm">{t.icon}</span>
              </div>
              <span className="flex-1 text-left">{t.label}</span>
              {theme === t.id && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}