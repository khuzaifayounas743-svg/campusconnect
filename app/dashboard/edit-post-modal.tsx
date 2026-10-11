'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

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

export default function EditPostModal({
  post,
  onClose,
}: {
  post: Post
  onClose: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(
    post.image_url
  )
  const [imageUrl, setImageUrl] = useState<string | null>(post.image_url)

  // Format event_date for datetime-local input
  const formatEventDateForInput = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getUTCFullYear()
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = d.getUTCDate().toString().padStart(2, '0')
    const hours = d.getUTCHours().toString().padStart(2, '0')
    const minutes = d.getUTCMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [form, setForm] = useState({
    title: post.title || '',
    description: post.description || '',
    category: post.category || 'general',
    event_date: formatEventDateForInput(post.event_date),
    venue: post.venue || '',
    city: post.city || '',
    university: post.university || '',
    tags: post.tags?.join(', ') || '',
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

  // ---------- SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      alert('Title and description are required')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('posts')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id)

    if (error) {
      alert('Update failed: ' + error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-base">✏️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Edit Post
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-tight">
                Update your post details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* IMAGE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">
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
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-28 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-indigo-600 transition-all disabled:opacity-50"
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
                  </>
                )}
              </button>
            )}
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Hackathon 2025"
              maxLength={100}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.title.length}/100
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Event details..."
              rows={5}
              maxLength={2000}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.description.length}/2000
            </p>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
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
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* EVENT DETAILS */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">
              📅 Event Details (optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                  Event Date
                </label>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) =>
                    setForm({ ...form, event_date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. Main Auditorium"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Lahore"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                  University
                </label>
                <input
                  type="text"
                  value={form.university}
                  onChange={(e) =>
                    setForm({ ...form, university: e.target.value })
                  }
                  placeholder="e.g. UET Lahore"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              🏷️ Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. coding, ai, free-food"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Comma separated
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-white font-semibold rounded-xl transition-colors"
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}