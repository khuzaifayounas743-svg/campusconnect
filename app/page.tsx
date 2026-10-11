import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ThemeSwitcher from '@/components/theme-switcher'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="relative min-h-screen overflow-x-hidden theme-bg">
      {/* Background blobs */}
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 theme-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <span className="text-xl">🎓</span>
            </div>
            <span className="text-xl font-bold gradient-text">
              CampusConnect
            </span>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="#features"
              className="hidden md:inline-flex text-sm font-medium theme-text-secondary hover:gradient-text transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden md:inline-flex text-sm font-medium theme-text-secondary hover:gradient-text transition-colors"
            >
              How it Works
            </a>
            <ThemeSwitcher />
            <Link
              href="/login"
              className="btn-shine px-5 py-2.5 theme-btn-primary text-sm font-semibold rounded-xl shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 theme-card rounded-full mb-6 shadow-sm animate-fade-in-up">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium theme-text-primary">
              Now live for Pakistani universities
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up theme-text-primary">
            <span className="gradient-text">Discover</span> events
            <br />
            beyond your classroom
          </h1>

          <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-10 animate-fade-in-up leading-relaxed">
            Every university event, hackathon, workshop, scholarship, and
            opportunity — all in one beautiful place. Never miss what matters
            again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up mb-6">
            <Link
              href="/login"
              className="btn-shine inline-flex items-center gap-2 px-8 py-4 theme-btn-primary font-semibold rounded-2xl shadow-2xl transition-all hover:-translate-y-0.5"
            >
              Get Started Free
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-4 theme-card font-semibold rounded-2xl transition-all theme-text-primary"
            >
              Learn More
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>

          <p className="text-sm theme-text-muted animate-fade-in-up">
            No credit card required · Free for all students
          </p>

          {/* Floating Preview Card */}
          <div className="mt-20 max-w-3xl mx-auto animate-float">
            <div className="theme-card rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 ring-2 ring-white shadow-md"></div>
                <div className="text-left flex-1">
                  <div className="h-3 w-28 bg-current opacity-20 rounded-full mb-2"></div>
                  <div className="h-2 w-20 bg-current opacity-10 rounded-full"></div>
                </div>
                <span className="text-xs px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full">
                  HACKATHON
                </span>
              </div>
              <div className="h-44 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                <span className="text-6xl relative z-10">🏆</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-current opacity-20 rounded-full"></div>
                <div className="h-3 w-1/2 bg-current opacity-10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ...rest of the sections with theme-* classes... */}
      {/* Ye sab pichle code jaisa hai, bas text-gray-* ko theme-text-* se replace karo */}

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
            About
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 theme-text-primary">
            What is <span className="gradient-text">CampusConnect</span>?
          </h2>
          <p className="text-lg theme-text-secondary leading-relaxed mb-6">
            CampusConnect is a{' '}
            <strong className="theme-text-primary">student-built platform</strong>{' '}
            where university students can discover, share, and never miss out on
            events and opportunities happening around them.
          </p>
          <p className="text-lg theme-text-secondary leading-relaxed">
            Whether it&apos;s a{' '}
            <strong className="theme-text-primary">hackathon</strong> at your
            campus, a <strong className="theme-text-primary">scholarship</strong>{' '}
            opportunity, an{' '}
            <strong className="theme-text-primary">
              inter-university competition
            </strong>
            , or a <strong className="theme-text-primary">cultural festival</strong>{' '}
            — everything is here, just one scroll away.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
              Everything you need,{' '}
              <span className="gradient-text">in one place</span>
            </h2>
            <p className="text-lg theme-text-secondary">
              Powerful tools designed for students, by students
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📅"
              title="Events Feed"
              description="See every event happening in your university and around the city in one clean, scrollable feed."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon="🤖"
              title="AI Writing Assistant"
              description="Describe your event in one line. AI generates the title, description, tags, and category for you."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon="🖼️"
              title="Rich Media Posts"
              description="Share images and text posts. Click any image to view it fullscreen, just like Facebook."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon="👥"
              title="Follow and Connect"
              description="Follow friends and favorite organizers. Get notified whenever they share something new."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon="💬"
              title="Comments and Replies"
              description="Join the conversation. Comment on posts and reply to other students in threaded discussions."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon="🔔"
              title="Smart Notifications"
              description="Stay updated about events from people you follow. Never miss what truly matters to you."
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Getting Started
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-lg theme-text-secondary">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              icon="🔐"
              title="Sign in with Google"
              description="Use your university Google account. No passwords, no hassle. Just one click."
            />
            <StepCard
              number="2"
              icon="👀"
              title="Discover Events"
              description="Browse events, hackathons, workshops, and opportunities from your campus and beyond."
            />
            <StepCard
              number="3"
              icon="✏️"
              title="Share and Engage"
              description="Post your own events with AI assistance. Like, comment, and connect with other students."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="theme-card rounded-3xl p-10 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StatCard number="🎓" label="Universities" value="20+" />
              <StatCard number="📅" label="Events Posted" value="500+" />
              <StatCard number="👥" label="Students" value="1,000+" />
              <StatCard number="🚀" label="Always Free" value="For You" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
              What students are saying
            </h2>
            <p className="text-lg theme-text-secondary">
              Real feedback from real students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Finally, one place where I can see every event happening at my university. No more missing out on hackathons!"
              name="Ahmed R."
              role="CS Student, UET Lahore"
              avatar="A"
              gradient="from-indigo-500 to-purple-500"
            />
            <TestimonialCard
              quote="The AI writing assistant is a game-changer. I typed one line about our workshop and it wrote the entire post."
              name="Fatima K."
              role="Event Organizer, LUMS"
              avatar="F"
              gradient="from-pink-500 to-rose-500"
            />
            <TestimonialCard
              quote="I discovered a scholarship opportunity through CampusConnect that I would have never found otherwise. Thank you!"
              name="Hassan M."
              role="Engineering Student, NUST"
              avatar="H"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Why CampusConnect */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
              Why <span className="gradient-text">CampusConnect</span>?
            </h2>
            <p className="text-lg theme-text-secondary">
              We solve the problems students face every day
            </p>
          </div>

          <div className="space-y-4">
            <ReasonItem
              problem="Events get lost in WhatsApp groups and Facebook pages"
              solution="One centralized platform for every campus event"
            />
            <ReasonItem
              problem="Students miss scholarships and opportunities"
              solution="AI-powered feed shows you what is relevant to you"
            />
            <ReasonItem
              problem="No way to know what is happening at other universities"
              solution="National reach with inter-university events in one place"
            />
            <ReasonItem
              problem="Posting events is a hassle and takes too long"
              solution="AI helps you write a perfect post in seconds"
            />
            <ReasonItem
              problem="No way to follow organizers or friends"
              solution="Follow system with instant notifications"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
            <p className="text-lg theme-text-secondary">
              Everything you need to know
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="Is CampusConnect free to use?"
              answer="Yes, CampusConnect is completely free for all university students. There are no hidden charges, no premium tiers, and no credit card required."
            />
            <FAQItem
              question="How do I sign up?"
              answer="Simply click Sign In and use your Google account. If you use a university email address, your account is automatically verified. No passwords to remember."
            />
            <FAQItem
              question="Can students from any university join?"
              answer="Absolutely. CampusConnect is designed for students from all Pakistani universities. You will see events from your campus as well as national-level opportunities."
            />
            <FAQItem
              question="What can I post?"
              answer="You can post events, hackathons, workshops, seminars, sports activities, cultural festivals, scholarship opportunities, and general announcements."
            />
            <FAQItem
              question="How does the AI writing assistant work?"
              answer="Just type a short idea like Hackathon at UET next month, and the AI will generate a complete post including title, description, tags, and category."
            />
            <FAQItem
              question="Will I get notified about new events?"
              answer="Yes. When you follow someone, you will receive a notification every time they post something new. You can manage notification preferences anytime."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students from across Pakistan who never miss
                out on opportunities anymore.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-0.5"
              >
                Sign in with Google
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <p className="text-sm text-white/70 mt-4">
                Free forever · No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 theme-header mt-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-lg">🎓</span>
                </div>
                <span className="font-bold text-lg gradient-text">
                  CampusConnect
                </span>
              </div>
              <p className="text-sm theme-text-secondary max-w-md leading-relaxed">
                The central hub for university events and opportunities across
                Pakistan. Built by students, for students.
              </p>
            </div>

            <div>
              <h4 className="font-bold theme-text-primary mb-3 text-sm uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2 text-sm theme-text-secondary">
                <li>
                  <a
                    href="#features"
                    className="hover:gradient-text transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:gradient-text transition-colors"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:gradient-text transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold theme-text-primary mb-3 text-sm uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-2 text-sm theme-text-secondary">
                <li>
                  <Link
                    href="#"
                    className="hover:gradient-text transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:gradient-text transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:gradient-text transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <p className="text-sm theme-text-muted">
              © 2025 CampusConnect. All rights reserved.
            </p>
            <p className="text-sm theme-text-muted flex items-center gap-2">
              Developed by
              <span className="font-bold gradient-text">Khuzaifa Younas</span>
              <span className="text-rose-500">❤️</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

// ==================== Sub Components ====================

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: string
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group theme-card rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold theme-text-primary mb-2">{title}</h3>
      <p className="text-sm theme-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="relative theme-card rounded-3xl p-8 shadow-xl text-center hover:shadow-2xl transition-all">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg ring-4"
        style={{ '--tw-ring-color': 'var(--bg-primary)' } as React.CSSProperties}
      >
        <span className="text-white font-bold text-lg">{number}</span>
      </div>
      <div className="text-5xl mb-4 mt-4">{icon}</div>
      <h3 className="text-xl font-bold theme-text-primary mb-3">{title}</h3>
      <p className="theme-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function StatCard({
  number,
  label,
  value,
}: {
  number: string
  label: string
  value: string
}) {
  return (
    <div className="group">
      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="text-2xl font-bold gradient-text mb-1">{value}</div>
      <div className="text-xs theme-text-muted uppercase tracking-wider font-medium">
        {label}
      </div>
    </div>
  )
}

function ReasonItem({
  problem,
  solution,
}: {
  problem: string
  solution: string
}) {
  return (
    <div className="theme-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-xl transition-all">
      <div className="flex items-start gap-3 sm:flex-1">
        <span className="text-2xl shrink-0">❌</span>
        <p className="theme-text-secondary font-medium leading-relaxed">
          {problem}
        </p>
      </div>
      <div className="hidden sm:flex items-center justify-center shrink-0">
        <svg
          className="w-6 h-6 text-indigo-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
      <div className="flex items-start gap-3 sm:flex-1">
        <span className="text-2xl shrink-0">✅</span>
        <p className="theme-text-primary font-semibold leading-relaxed">
          {solution}
        </p>
      </div>
    </div>
  )
}

function TestimonialCard({
  quote,
  name,
  role,
  avatar,
  gradient,
}: {
  quote: string
  name: string
  role: string
  avatar: string
  gradient: string
}) {
  return (
    <div className="theme-card rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
      <div className="text-4xl mb-4 text-indigo-300">"</div>
      <p className="theme-text-secondary leading-relaxed mb-6 italic">
        {quote}
      </p>
      <div className="flex items-center gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
        >
          {avatar}
        </div>
        <div>
          <p className="font-bold theme-text-primary text-sm">{name}</p>
          <p className="text-xs theme-text-muted">{role}</p>
        </div>
      </div>
    </div>
  )
}

function FAQItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <details className="theme-card rounded-2xl p-6 shadow-md group cursor-pointer hover:shadow-xl transition-all">
      <summary className="flex items-center justify-between font-bold theme-text-primary list-none">
        <span className="pr-4">{question}</span>
        <span className="text-indigo-500 text-xl shrink-0 group-open:rotate-45 transition-transform duration-300">
          +
        </span>
      </summary>
      <p className="theme-text-secondary leading-relaxed mt-4 pt-4 border-t"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        {answer}
      </p>
    </details>
  )
}