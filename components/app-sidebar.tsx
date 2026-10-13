'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type User = {
  id: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      icon: '🏠',
      label: 'Home',
      active: pathname === '/dashboard',
    },
    {
      href: '/events',
      icon: '📅',
      label: 'Events',
      active: pathname === '/events',
    },
    {
      href: '/search',
      icon: '🔍',
      label: 'Discover',
      active: pathname === '/search',
    },
    {
      href: `/profile/${user.id}`,
      icon: '👤',
      label: 'My Profile',
      active: pathname === `/profile/${user.id}`,
    },
    {
      href: '/notifications',
      icon: '🔔',
      label: 'Notifications',
      active: pathname === '/notifications',
    },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-6rem)]">
      {/* Navigation */}
      <nav className="space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all"
            style={{
              backgroundColor: item.active ? 'var(--cc-hover)' : 'transparent',
              color: item.active ? 'var(--cc-primary)' : 'var(--cc-text-secondary)',
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button at bottom */}
      <form action="/auth/signout" method="post" className="pt-4">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all hover:bg-red-50 text-red-500"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </form>
    </aside>
  )
}