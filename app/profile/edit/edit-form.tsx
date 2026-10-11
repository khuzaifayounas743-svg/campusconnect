'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarUploader from './avatar-uploader'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  university: string | null
}

export default function EditForm({
  profile,
  userId,
}: {
  profile: Profile
  userId: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    university: profile.university || '',
    avatar_url: profile.avatar_url || '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validation
    if (!form.full_name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    if (form.full_name.trim().length > 80) {
      setError('Name too long (max 80 chars)')
      setLoading(false)
      return
    }

    if (form.bio.length > 300) {
      setError('Bio too long (max 300 chars)')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        bio: form.bio.trim() || null,
        university: form.university.trim() || null,
        avatar_url: form.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to save: ' + updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect after short delay
    setTimeout(() => {
      router.push(`/profile/${userId}`)
      router.refresh()
    }, 1200)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="theme-card rounded-3xl p-6 shadow-xl">
        <h2 className="text-sm font-bold theme-text-primary mb-5 uppercase tracking-wider">
          Profile Photo
        </h2>
        <AvatarUploader
          userId={userId}
          currentAvatarUrl={profile.avatar_url}
          userName={profile.full_name}
          onUpload={(url) => setForm({ ...form, avatar_url: url })}
        />
      </div>

      {/* Info Section */}
      <div className="theme-card rounded-3xl p-6 shadow-xl space-y-5">
        <h2 className="text-sm font-bold theme-text-primary uppercase tracking-wider">
          Profile Information
        </h2>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold theme-text-primary mb-2">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Khuzaifa Younas"
            maxLength={80}
            required
            className="w-full px-4 py-3 rounded-xl theme-input outline-none transition-all"
          />
          <p className="text-xs theme-text-muted mt-1 text-right">
            {form.full_name.length}/80
          </p>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-semibold theme-text-primary mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email || ''}
            readOnly
            disabled
            className="w-full px-4 py-3 rounded-xl theme-input outline-none opacity-60 cursor-not-allowed"
          />
          <p className="text-xs theme-text-muted mt-1">
            Email cannot be changed (linked to Google account)
          </p>
        </div>

        {/* University */}
        <div>
          <label className="block text-sm font-semibold theme-text-primary mb-2">
            University
          </label>
          <input
            type="text"
            value={form.university}
            onChange={(e) => setForm({ ...form, university: e.target.value })}
            placeholder="e.g. UET Lahore"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl theme-input outline-none transition-all"
          />
          <p className="text-xs theme-text-muted mt-1">
            Optional · Shown on your profile
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold theme-text-primary mb-2">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell others about yourself..."
            rows={4}
            maxLength={300}
            className="w-full px-4 py-3 rounded-xl theme-input outline-none resize-none transition-all"
          />
          <p className="text-xs theme-text-muted mt-1 text-right">
            {form.bio.length}/300
          </p>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-sm text-rose-700 font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl animate-fade-in-up">
          <p className="text-sm text-green-700 font-medium flex items-center gap-2">
            <span>✅</span> Profile updated successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3.5 theme-card rounded-2xl font-semibold theme-text-primary hover:shadow-lg transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3.5 theme-btn-primary rounded-2xl font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
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
  )
}