'use client'

import Link from 'next/link'

export default function UserAvatar({
  userId,
  name,
  avatarUrl,
  size = 'md',
  clickable = true,
}: {
  userId: string
  name?: string | null
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  clickable?: boolean
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const initials = (name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avatarContent = (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0 ring-2 ring-white/40 shadow-md`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || 'User'}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )

  if (!clickable) {
    return avatarContent
  }

  return (
    <Link href={`/profile/${userId}`} className="shrink-0 hover:scale-105 transition-transform">
      {avatarContent}
    </Link>
  )
}