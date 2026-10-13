import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import UserAvatar from './user-avatar'
import FollowButton from './follow-button'

export default async function TopUsersWidget({
  currentUserId,
}: {
  currentUserId: string
}) {
  const supabase = await createClient()

  // Get users that current user is NOT following
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  const followingIds = new Set(
    following?.map((f) => f.following_id) || []
  )
  followingIds.add(currentUserId)

  const excludedIds = [...followingIds]
    .map((id) => `"${id}"`)
    .join(',')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, university')
    .not('id', 'in', `(${excludedIds})`)
    .limit(4)

  if (!users || users.length === 0) return null

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
          Who to Follow
        </h3>
        <Link
          href="/search"
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--cc-primary)' }}
        >
          Find More
        </Link>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80"
            >
              <UserAvatar
                userId={user.id}
                name={user.full_name}
                avatarUrl={user.avatar_url}
                size="sm"
                clickable={false}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--cc-text)' }}
                >
                  {user.full_name || 'Student'}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--cc-text-muted)' }}
                >
                  {user.university || 'Student'}
                </p>
              </div>
            </Link>
            <FollowButton
              targetUserId={user.id}
              currentUserId={currentUserId}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
}