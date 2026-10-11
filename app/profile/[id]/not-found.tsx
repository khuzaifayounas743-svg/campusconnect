import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen theme-bg flex items-center justify-center p-6">
      <div className="theme-card rounded-3xl p-10 shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-float">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-3xl font-bold theme-text-primary mb-3">404</h1>
        <p className="theme-text-secondary text-sm mb-6 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 theme-btn-primary rounded-2xl font-semibold shadow-lg transition-all hover:-translate-y-0.5"
        >
          <span>←</span>
          <span>Back to Feed</span>
        </Link>
      </div>
    </div>
  )
}