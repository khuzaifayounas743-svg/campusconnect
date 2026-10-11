'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import ThemeSwitcher from '@/components/theme-switcher'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      alert('Login failed: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden theme-bg">
      {/* Theme Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeSwitcher />
      </div>

      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
          style={{ backgroundColor: 'var(--blob-1)' }}
        ></div>
        <div
          className="absolute top-1/3 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"
          style={{ backgroundColor: 'var(--blob-2)' }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"
          style={{ backgroundColor: 'var(--blob-3)' }}
        ></div>
      </div>

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 theme-card rounded-xl text-sm font-semibold theme-text-primary hover:shadow-lg transition-all group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <div className="text-center mb-8 animate-fade-in-up">
            <Link href="/" className="inline-block">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-float">
                <span className="text-4xl">🎓</span>
              </div>
            </Link>
            <h1 className="text-4xl font-bold mb-2 gradient-text">
              CampusConnect
            </h1>
            <p className="theme-text-secondary text-sm">
              Your university&apos;s events, all in one place
            </p>
          </div>

          {/* Login Card */}
          <div className="theme-card rounded-3xl shadow-2xl p-8 animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold theme-text-primary mb-2">
                Welcome back 👋
              </h2>
              <p className="theme-text-secondary text-sm">
                Sign in to discover events around you
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-shine group w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-400 rounded-2xl px-4 py-4 text-gray-700 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: 'var(--border-primary)' }}
                ></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 theme-text-muted">
                  Secure sign-in powered by Google
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
              <span className="text-xl shrink-0">✨</span>
              <p className="text-xs text-indigo-900 leading-relaxed">
                Use your university Google account to sign in. Your profile
                will be created automatically.
              </p>
            </div>

            {/* Feature List */}
            <div className="mt-6 pt-6 border-t space-y-2.5"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center gap-3 text-xs theme-text-secondary">
                <span className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span>Discover events from your campus</span>
              </div>
              <div className="flex items-center gap-3 text-xs theme-text-secondary">
                <span className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span>Post with AI writing assistance</span>
              </div>
              <div className="flex items-center gap-3 text-xs theme-text-secondary">
                <span className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span>Connect with students nationwide</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs theme-text-muted mt-8 animate-fade-in-up leading-relaxed">
            By signing in, you agree to our{' '}
            <Link
              href="#"
              className="font-semibold gradient-text hover:underline"
            >
              Terms
            </Link>{' '}
            &{' '}
            <Link
              href="#"
              className="font-semibold gradient-text hover:underline"
            >
              Privacy Policy
            </Link>
          </p>

          <p className="text-center text-xs theme-text-muted mt-4 flex items-center justify-center gap-1.5">
            Developed by
            <span className="font-bold gradient-text">Khuzaifa Younas</span>
            <span className="text-rose-500">❤️</span>
          </p>
        </div>
      </div>
    </div>
  )
}