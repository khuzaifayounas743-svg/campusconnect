import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UpcomingEventsWidget() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('posts')
    .select('id, title, event_date, city, venue, category')
    .not('event_date', 'is', null)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`
  }

  return (
    <div
      className="rounded-3xl p-5 border shadow-sm"
      style={{
        backgroundColor: 'var(--cc-surface)',
        borderColor: 'var(--cc-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-bold text-lg"
          style={{ color: 'var(--cc-text)' }}
        >
          Upcoming Events
        </h3>
        <Link
          href="/events"
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--cc-primary)' }}
        >
          View All
        </Link>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard?post=${event.id}`}
              className="flex items-start gap-3 p-2 rounded-xl transition-colors group"
              style={{ backgroundColor: 'transparent' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--cc-hover)' }}
              >
                <span className="text-lg">📅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold line-clamp-2 leading-snug group-hover:underline"
                  style={{ color: 'var(--cc-text)' }}
                >
                  {event.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--cc-text-muted)' }}
                >
                  {formatDate(event.event_date!)} at{' '}
                  {event.venue || event.city || 'Campus'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div
            className="w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--cc-hover)' }}
          >
            <span className="text-xl">📭</span>
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--cc-text-secondary)' }}
          >
            No upcoming events
          </p>
        </div>
      )}
    </div>
  )
}