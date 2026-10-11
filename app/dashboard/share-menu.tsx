'use client'

import { useState, useRef, useEffect } from 'react'

export default function ShareMenu({
  postId,
  postTitle,
}: {
  postId: string
  postTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/dashboard?post=${postId}`
  }

  const getShareText = () => {
    return `Check out this event on CampusConnect: "${postTitle}"`
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1500)
    }
  }

  const handleWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getShareText())
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
    setOpen(false)
  }

  const handleFacebook = () => {
    const url = encodeURIComponent(getShareUrl())
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    )
    setOpen(false)
  }

  const handleTwitter = () => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getShareText())
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=600,height=400'
    )
    setOpen(false)
  }

  const handleTelegram = () => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getShareText())
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
    setOpen(false)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(postTitle)
    const body = encodeURIComponent(`${getShareText()}\n\n${getShareUrl()}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
          open
            ? 'bg-purple-50 text-purple-600'
            : 'theme-text-secondary hover:bg-purple-50 hover:text-purple-600'
        }`}
      >
        <span className="text-lg">🔗</span>
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl theme-card shadow-2xl ring-1 ring-black/5 p-2 z-40 animate-scale-in">
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">
              Share this post
            </p>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs shrink-0">
              {copied ? '✓' : '🔗'}
            </span>
            <span className="flex-1 text-left">
              {copied ? 'Link Copied!' : 'Copy Link'}
            </span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
            <span className="flex-1 text-left">WhatsApp</span>
          </button>

          <button
            onClick={handleFacebook}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </span>
            <span className="flex-1 text-left">Facebook</span>
          </button>

          <button
            onClick={handleTwitter}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
            <span className="flex-1 text-left">X (Twitter)</span>
          </button>

          <button
            onClick={handleTelegram}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </span>
            <span className="flex-1 text-left">Telegram</span>
          </button>

          <button
            onClick={handleEmail}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium theme-text-primary hover:bg-white/60 transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="flex-1 text-left">Email</span>
          </button>
        </div>
      )}
    </div>
  )
}