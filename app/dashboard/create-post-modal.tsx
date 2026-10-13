'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Portal ke liye: modal ko document.body me render karne ke liye
  const [mounted, setMounted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [aiIdea, setAiIdea] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [improvingDesc, setImprovingDesc] = useState(false)
  const [suggestingTitle, setSuggestingTitle] = useState(false)
  const [suggestingTags, setSuggestingTags] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    event_date: '',
    venue: '',
    city: '',
    university: '',
    tags: '',
  })

  useEffect(() => {
    setMounted(true)
    // Modal khula ho to background scroll band
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('User not logged in')
      setUploading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('post-images').getPublicUrl(fileName)

    setImageUrl(publicUrl)
    setUploading(false)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAIGenerate = async () => {
    if (!aiIdea.trim()) {
      alert('Pehle apna idea likho (e.g. "Hackathon at UET Lahore next month")')
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_all', data: { idea: aiIdea } }),
      })
      const result = await res.json()
      if (result.success) {
        setForm((prev) => ({
          ...prev,
          title: result.data.title || prev.title,
          description: result.data.description || prev.description,
          category: result.data.category || prev.category,
          tags: Array.isArray(result.data.tags)
            ? result.data.tags.join(', ')
            : prev.tags,
        }))
        setAiIdea('')
      } else {
        alert('AI error: ' + (result.error || 'Unknown'))
      }
    } catch (e: any) {
      alert('AI request failed: ' + e.message)
    }
    setAiLoading(false)
  }

  const handleImproveDescription = async () => {
    if (!form.description.trim()) {
      alert('Pehle description likho')
      return
    }
    setImprovingDesc(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve_description',
          data: { description: form.description },
        }),
      })
      const result = await res.json()
      if (result.success) setForm({ ...form, description: result.data })
      else alert('AI error: ' + (result.error || 'Unknown'))
    } catch (e: any) {
      alert('AI request failed: ' + e.message)
    }
    setImprovingDesc(false)
  }

  const handleSuggestTitle = async () => {
    if (!form.description.trim()) {
      alert('Pehle description likho, phir AI title suggest karega')
      return
    }
    setSuggestingTitle(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_title',
          data: { description: form.description },
        }),
      })
      const result = await res.json()
      if (result.success) setForm({ ...form, title: result.data })
      else alert('AI error: ' + (result.error || 'Unknown'))
    } catch (e: any) {
      alert('AI request failed: ' + e.message)
    }
    setSuggestingTitle(false)
  }

  const handleSuggestTags = async () => {
    if (!form.title.trim() && !form.description.trim()) {
      alert('Pehle title ya description likho')
      return
    }
    setSuggestingTags(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_tags',
          data: { title: form.title, description: form.description },
        }),
      })
      const result = await res.json()
      if (result.success) {
        setForm({
          ...form,
          tags: Array.isArray(result.data)
            ? result.data.join(', ')
            : result.data,
        })
      } else alert('AI error: ' + (result.error || 'Unknown'))
    } catch (e: any) {
      alert('AI request failed: ' + e.message)
    }
    setSuggestingTags(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      alert('Title aur description zaroori hain')
      return
    }

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login again')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category || 'general',
      event_date: form.event_date
        ? new Date(form.event_date).toISOString()
        : null,
      venue: form.venue.trim() || null,
      city: form.city.trim() || null,
      university: form.university.trim() || null,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      image_url: imageUrl,
    })

    if (error) {
      alert('Post failed: ' + error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  // Server-side render ke waqt document available nahi hota
  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Wrapper — Padding + Min Height */}
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        {/* Modal Card */}
        <div
          className="w-full max-w-2xl rounded-3xl shadow-2xl ring-1 ring-black/5"
          style={{ backgroundColor: 'var(--cc-surface)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div
            className="sticky top-0 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between rounded-t-3xl z-10"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--cc-surface) 95%, transparent)',
              borderColor: 'var(--cc-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
                }}
              >
                <span className="text-base">✏️</span>
              </div>
              <div>
                <h2
                  className="text-lg font-bold leading-tight"
                  style={{ color: 'var(--cc-text)' }}
                >
                  Create Post
                </h2>
                <p
                  className="text-xs leading-tight"
                  style={{ color: 'var(--cc-text-muted)' }}
                >
                  Share an event or announcement
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--cc-hover)]"
              style={{ color: 'var(--cc-text-muted)' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* AI MAGIC */}
            <div
              className="relative overflow-hidden rounded-2xl p-4 border"
              style={{
                background: `linear-gradient(135deg, var(--cc-hover), color-mix(in srgb, var(--cc-accent) 15%, transparent))`,
                borderColor: 'var(--cc-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h3
                  className="font-bold text-sm"
                  style={{ color: 'var(--cc-text)' }}
                >
                  AI Magic
                </h3>
                <span
                  className="text-[10px] text-white px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: `linear-gradient(90deg, var(--cc-primary), var(--cc-accent))`,
                  }}
                >
                  BETA
                </span>
              </div>
              <p
                className="text-xs mb-3"
                style={{ color: 'var(--cc-text-secondary)' }}
              >
                Apna idea ek line me likho — AI poora post bana dega!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiIdea}
                  onChange={(e) => setAiIdea(e.target.value)}
                  placeholder='e.g. "Hackathon at UET Lahore next month"'
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl border outline-none"
                  style={{
                    backgroundColor: 'var(--cc-surface)',
                    borderColor: 'var(--cc-border)',
                    color: 'var(--cc-text)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAIGenerate()
                    }
                  }}
                  disabled={aiLoading}
                />
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                  style={{
                    background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
                  }}
                >
                  {aiLoading ? (
                    <span>⏳ Wait...</span>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: 'var(--cc-text)' }}
                >
                  📸 Photo
                </label>
                <span
                  className="text-xs"
                  style={{ color: 'var(--cc-text-muted)' }}
                >
                  Optional
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                  style={{
                    borderColor: 'var(--cc-border)',
                    color: 'var(--cc-text-secondary)',
                  }}
                >
                  {uploading ? (
                    <span className="text-sm">Uploading...</span>
                  ) : (
                    <>
                      <span className="text-2xl">📸</span>
                      <span className="text-sm font-medium">
                        Click to add a photo
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--cc-text-muted)' }}
                      >
                        or skip for text-only post
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* TITLE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: 'var(--cc-text)' }}
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSuggestTitle}
                  disabled={suggestingTitle}
                  className="text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                  style={{ color: 'var(--cc-primary)' }}
                >
                  {suggestingTitle ? '⏳ Thinking...' : '🤖 AI Suggest'}
                </button>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Annual Hackathon 2025"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{
                  backgroundColor: 'var(--cc-surface)',
                  borderColor: 'var(--cc-border)',
                  color: 'var(--cc-text)',
                }}
                required
              />
              <p
                className="text-xs mt-1 text-right"
                style={{ color: 'var(--cc-text-muted)' }}
              >
                {form.title.length}/100
              </p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: 'var(--cc-text)' }}
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleImproveDescription}
                  disabled={improvingDesc}
                  className="text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                  style={{ color: 'var(--cc-primary)' }}
                >
                  {improvingDesc ? '⏳ Improving...' : '✨ AI Improve'}
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Event ke baare me details likho..."
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                style={{
                  backgroundColor: 'var(--cc-surface)',
                  borderColor: 'var(--cc-border)',
                  color: 'var(--cc-text)',
                }}
                required
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--cc-text)' }}
              >
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'general', label: '📌 General' },
                  { value: 'event', label: '🎉 Event' },
                  { value: 'hackathon', label: '💻 Hackathon' },
                  { value: 'workshop', label: '🛠️ Workshop' },
                  { value: 'seminar', label: '🎤 Seminar' },
                  { value: 'sports', label: '⚽ Sports' },
                  { value: 'cultural', label: '🎭 Cultural' },
                  { value: 'opportunity', label: '💼 Opportunity' },
                  { value: 'announcement', label: '📢 Announcement' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background:
                        form.category === cat.value
                          ? `linear-gradient(90deg, var(--cc-primary), var(--cc-accent))`
                          : 'var(--cc-hover)',
                      color:
                        form.category === cat.value
                          ? 'white'
                          : 'var(--cc-text-secondary)',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EVENT DETAILS */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: 'var(--cc-hover)' }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--cc-text)' }}
              >
                📅 Event Details (optional)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--cc-text-secondary)' }}
                  >
                    Event Date
                  </label>
                  <input
                    type="datetime-local"
                    value={form.event_date}
                    onChange={(e) =>
                      setForm({ ...form, event_date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--cc-surface)',
                      borderColor: 'var(--cc-border)',
                      color: 'var(--cc-text)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--cc-text-secondary)' }}
                  >
                    Venue
                  </label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) =>
                      setForm({ ...form, venue: e.target.value })
                    }
                    placeholder="e.g. Main Auditorium"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--cc-surface)',
                      borderColor: 'var(--cc-border)',
                      color: 'var(--cc-text)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--cc-text-secondary)' }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Lahore"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--cc-surface)',
                      borderColor: 'var(--cc-border)',
                      color: 'var(--cc-text)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--cc-text-secondary)' }}
                  >
                    University
                  </label>
                  <input
                    type="text"
                    value={form.university}
                    onChange={(e) =>
                      setForm({ ...form, university: e.target.value })
                    }
                    placeholder="e.g. UET Lahore"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--cc-surface)',
                      borderColor: 'var(--cc-border)',
                      color: 'var(--cc-text)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* TAGS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: 'var(--cc-text)' }}
                >
                  🏷️ Tags
                </label>
                <button
                  type="button"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags}
                  className="text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                  style={{ color: 'var(--cc-primary)' }}
                >
                  {suggestingTags ? '⏳ Thinking...' : '🏷️ AI Suggest'}
                </button>
              </div>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. coding, ai, free-food"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{
                  backgroundColor: 'var(--cc-surface)',
                  borderColor: 'var(--cc-border)',
                  color: 'var(--cc-text)',
                }}
              />
            </div>

            {/* ACTIONS */}
            <div
              className="flex gap-3 pt-4 border-t"
              style={{ borderColor: 'var(--cc-border)' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 font-semibold rounded-xl"
                style={{
                  backgroundColor: 'var(--cc-hover)',
                  color: 'var(--cc-text)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-6 py-3 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
                }}
              >
                {loading ? 'Posting...' : '🚀 Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}