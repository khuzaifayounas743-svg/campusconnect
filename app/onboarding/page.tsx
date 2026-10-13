import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './onboarding-form'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen cc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <OnboardingForm
          userId={user.id}
          userEmail={user.email || ''}
          initialName={user.user_metadata?.full_name || ''}
        />
      </div>
    </main>
  )
}