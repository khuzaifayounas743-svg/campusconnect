'use client'

type Props = {
  userName: string
}

export default function WelcomeBanner({ userName }: Props) {
  return (
    <div className="mb-6">
      <h1
        className="text-3xl font-bold mb-1"
        style={{ color: 'var(--cc-text)' }}
      >
        Welcome back,{' '}
        <span style={{ color: 'var(--cc-primary)' }}>{userName}</span> 👋
      </h1>
      <p className="text-sm" style={{ color: 'var(--cc-text-secondary)' }}>
        Here&apos;s what&apos;s happening on your campus today
      </p>
    </div>
  )
}