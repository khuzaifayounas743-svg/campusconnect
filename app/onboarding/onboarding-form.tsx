'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  UNIVERSITIES,
  PROGRAMS,
  SEMESTERS,
  DEPARTMENTS,
} from '@/lib/universities'

export default function OnboardingForm({
  userId,
  userEmail,
  initialName,
}: {
  userId: string
  userEmail: string
  initialName: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // University search
  const [universitySearch, setUniversitySearch] = useState('')
  const [showUniversityList, setShowUniversityList] = useState(false)

  const [form, setForm] = useState({
    full_name: initialName || '',
    university: '',
    program: '',
    semester: '',
    department: '',
  })

  const filteredUniversities = UNIVERSITIES.filter(
    (u) =>
      u.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
      u.shortName.toLowerCase().includes(universitySearch.toLowerCase()) ||
      u.city.toLowerCase().includes(universitySearch.toLowerCase())
  )

  const handleSelectUniversity = (name: string) => {
    setForm({ ...form, university: name })
    setUniversitySearch(name)
    setShowUniversityList(false)
  }

  const handleNext = () => {
    if (step === 1 && !form.full_name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (step === 2 && !form.university) {
      setError('Please select your university')
      return
    }
    if (step === 3 && (!form.program || !form.semester || !form.department)) {
      setError('Please fill all fields')
      return
    }
    setError(null)
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        university: form.university,
        program: form.program,
        semester: form.semester,
        department: form.department,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to save. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const totalSteps = 3

  return (
    <div
      className="rounded-3xl p-8 shadow-2xl border"
      style={{
        backgroundColor: 'var(--cc-surface)',
        borderColor: 'var(--cc-border)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
          }}
        >
          🎓
        </div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--cc-text)' }}
        >
          Welcome to CampusConnect!
        </h1>
        <p className="text-sm" style={{ color: 'var(--cc-text-secondary)' }}>
          Let&apos;s set up your profile — step {step} of {totalSteps}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--cc-hover)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(step / totalSteps) * 100}%`,
              background: `linear-gradient(90deg, var(--cc-primary), var(--cc-accent))`,
            }}
          ></div>
        </div>
      </div>

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--cc-text)' }}
            >
              Your Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
              placeholder="e.g. Khuzaifa Younas"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl border outline-none transition-all"
              style={{
                backgroundColor: 'var(--cc-bg)',
                borderColor: 'var(--cc-border)',
                color: 'var(--cc-text)',
              }}
            />
          </div>

          <div
            className="p-4 rounded-2xl text-sm"
            style={{
              backgroundColor: 'var(--cc-hover)',
              color: 'var(--cc-text-secondary)',
            }}
          >
            💡 <strong>Email:</strong> {userEmail}
            <br />
            <span className="text-xs">
              We recommend using your university email for verification.
            </span>
          </div>
        </div>
      )}

      {/* Step 2: University */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--cc-text)' }}
            >
              Your University
            </label>
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--cc-text-muted)' }}
            >
              Search karo ya list me se select karo
            </p>

            <div className="relative">
              <input
                type="text"
                value={universitySearch}
                onChange={(e) => {
                  setUniversitySearch(e.target.value)
                  setShowUniversityList(true)
                }}
                onFocus={() => setShowUniversityList(true)}
                placeholder="Search university... (e.g. COMSATS, NUST, FAST)"
                className="w-full px-4 py-3 rounded-2xl border outline-none"
                style={{
                  backgroundColor: 'var(--cc-bg)',
                  borderColor: 'var(--cc-border)',
                  color: 'var(--cc-text)',
                }}
              />

              {showUniversityList && filteredUniversities.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl shadow-2xl border z-50"
                  style={{
                    backgroundColor: 'var(--cc-surface)',
                    borderColor: 'var(--cc-border)',
                  }}
                >
                  {filteredUniversities.map((u) => (
                    <button
                      key={u.name}
                      onClick={() => handleSelectUniversity(u.name)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--cc-hover)] transition-colors border-b"
                      style={{ borderColor: 'var(--cc-border)' }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--cc-text)' }}
                      >
                        {u.shortName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--cc-text-muted)' }}
                      >
                        {u.name} · {u.city}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {form.university && (
              <div
                className="mt-3 p-3 rounded-xl text-sm flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--cc-hover)',
                  color: 'var(--cc-primary)',
                }}
              >
                <span>✅</span>
                <span className="font-semibold">{form.university}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Program + Semester + Department */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--cc-text)' }}
            >
              Your Program
            </label>
            <select
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border outline-none"
              style={{
                backgroundColor: 'var(--cc-bg)',
                borderColor: 'var(--cc-border)',
                color: 'var(--cc-text)',
              }}
            >
              <option value="">Select program...</option>
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--cc-text)' }}
            >
              Current Semester
            </label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border outline-none"
              style={{
                backgroundColor: 'var(--cc-bg)',
                borderColor: 'var(--cc-border)',
                color: 'var(--cc-text)',
              }}
            >
              <option value="">Select semester...</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--cc-text)' }}
            >
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              className="w-full px-4 py-3 rounded-2xl border outline-none"
              style={{
                backgroundColor: 'var(--cc-bg)',
                borderColor: 'var(--cc-border)',
                color: 'var(--cc-text)',
              }}
            >
              <option value="">Select department...</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button
            onClick={() => {
              setStep(step - 1)
              setError(null)
            }}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-2xl font-semibold border transition-all"
            style={{
              borderColor: 'var(--cc-border)',
              color: 'var(--cc-text)',
              backgroundColor: 'var(--cc-surface)',
            }}
          >
            ← Back
          </button>
        )}

        {step < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, var(--cc-primary), var(--cc-accent))`,
            }}
          >
            {loading ? 'Saving...' : 'Complete Setup 🎉'}
          </button>
        )}
      </div>
    </div>
  )
}