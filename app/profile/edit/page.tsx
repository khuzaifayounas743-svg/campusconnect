import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditForm from './edit-form'
import ThemeSwitcher from '@/components/theme-switcher'
import NotificationBell from '@/components/notification-bell'
import BackButton from '@/app/profile/[id]/back-button'

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  return (
    <main className="relative min-h-screen overflow-hidden theme-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
          style={{ backgroundColor: 'var(--blob-1)' }}
        ></div>
        <div
          className="absolute bottom-0 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"
          style={{ backgroundColor: 'var(--blob-2)' }}
        ></div>
      </div>

      <header className="sticky top-0 z-30 theme-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <span className="text-xl">🎓</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden md:block">
              CampusConnect
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BackButton />
            <NotificationBell currentUserId={user.id} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold theme-text-primary mb-2 flex items-center gap-2">
            ✏️ Edit Profile
          </h1>
          <p className="theme-text-secondary text-sm">
            Update your profile information
          </p>
        </div>

        <EditForm profile={profile} userId={user.id} />
      </div>
    </main>
  )
}