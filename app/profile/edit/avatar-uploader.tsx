'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'

export default function AvatarUploader({
  userId,
  currentAvatarUrl,
  userName,
  onUpload,
}: {
  userId: string
  currentAvatarUrl: string | null
  userName: string | null
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials = (userName || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB allowed.')
      return
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed.')
      return
    }

    setError(null)

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError('Upload failed: ' + uploadError.message)
      setPreview(currentAvatarUrl)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('post-images').getPublicUrl(fileName)

    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar preview */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-2xl">
          {preview ? (
            <img
              src={preview}
              alt={userName || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Camera button overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800 hover:scale-110 transition-transform disabled:opacity-50"
          aria-label="Change avatar"
        >
          {uploading ? (
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
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />

      <p className="text-xs theme-text-muted text-center">
        Click the camera icon to change your avatar
        <br />
        <span className="text-[10px]">JPG, PNG, GIF · Max 5MB</span>
      </p>

      {error && (
        <p className="text-xs text-rose-500 font-medium text-center">
          {error}
        </p>
      )}
    </div>
  )
}