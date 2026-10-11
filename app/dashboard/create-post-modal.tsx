'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // AI states
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

  // ---------- IMAGE UPLOAD ----------
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

  // ---------- AI: GENERATE ALL ----------
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
        body: JSON.stringify({
          action: 'generate_all',
          data: { idea: aiIdea },
        }),
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

  // ---------- AI: IMPROVE DESCRIPTION ----------
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
      if (result.success) {
        setForm({ ...form, description: result.data })
      } else {
        alert('AI error: ' + (result.error || 'Unknown'))
      }
    } catch (e: any) {
      alert('AI request failed: ' + e.message)
    }
    setImprovingDesc(false)
  }

  // ---------- AI: SUGGEST TITLE ----------
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

  // ---------- AI: SUGGEST TAGS ----------
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

  // ---------- SUBMIT ----------
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
        ? form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-base">✏️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Create Post
              </h2>
              <p className="text-xs text-gray-500 leading-tight">
                Share an event or announcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ============ AI MAGIC BOX ============ */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-4">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300 rounded-full filter blur-3xl opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h3 className="font-bold text-gray-900 text-sm">AI Magic</h3>
                <span className="text-[10px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                  BETA
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Apna idea ek line me likho — AI poora post (title, description,
                category, tags) bana dega!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiIdea}
                  onChange={(e) => setAiIdea(e.target.value)}
                  placeholder='e.g. "Hackathon at UET Lahore next month"'
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
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
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5 transition-all"
                >
                  {aiLoading ? (
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
                      <span>Generating</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ============ IMAGE ============ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                📸 Photo
              </label>
              <span className="text-xs text-gray-400">Optional</span>
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/90 text-gray-900 text-sm font-semibold rounded-xl hover:bg-white"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:opacity-0 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-indigo-600 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-indigo-600"
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
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📸</span>
                    <span className="text-sm font-medium">
                      Click to add a photo
                    </span>
                    <span className="text-xs text-gray-400">
                      or skip for a text-only post
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* ============ TITLE ============ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSuggestTitle}
                disabled={suggestingTitle}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                {suggestingTitle ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3"
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
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>AI Suggest</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Hackathon 2025"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              required
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.title.length}/100
            </p>
          </div>

          {/* ============ DESCRIPTION ============ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleImproveDescription}
                disabled={improvingDesc}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                {improvingDesc ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3"
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
                    <span>Improving...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>AI Improve</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Event ke baare me details likho... ya AI se likhwao"
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all"
              required
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.description.length}/2000
            </p>
          </div>

          {/* ============ CATEGORY ============ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    form.category === cat.value
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ============ EVENT DETAILS ============ */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              📅 Event Details (optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Event Date
                </label>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) =>
                    setForm({ ...form, event_date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. Main Auditorium"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Lahore"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  University
                </label>
                <input
                  type="text"
                  value={form.university}
                  onChange={(e) =>
                    setForm({ ...form, university: e.target.value })
                  }
                  placeholder="e.g. UET Lahore"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* ============ TAGS ============ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                🏷️ Tags
              </label>
              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={suggestingTags}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                {suggestingTags ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3"
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
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>🏷️</span>
                    <span>AI Suggest</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. coding, ai, free-food"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">
              Comma se separate karo — # automatic lagega
            </p>
          </div>

          {/* ============ ACTIONS ============ */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
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
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}